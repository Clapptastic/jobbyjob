/*
  # Fix Job Processing Implementation

  1. Changes
    - Consolidates all job processing functionality into a single migration
    - Adds proper error handling and logging
    - Fixes policy conflicts
    - Improves API validation
  
  2. Tables
    - job_processing_logs: Track processing attempts
    - job_processing_queue: Manage processing queue
    - job_processing_errors: Track detailed errors
  
  3. Security
    - RLS policies with unique names
    - Security definer functions
    - Proper error logging
*/

-- Start transaction
begin;

-- Drop existing objects
do $$
begin
  -- Drop all related functions
  drop function if exists check_required_api_keys() cascade;
  drop function if exists verify_api_configuration() cascade;
  drop function if exists start_job_processing(uuid) cascade;
  drop function if exists update_job_processing_status(uuid, int, int, text, boolean) cascade;
  drop function if exists log_processing_error(uuid, text, jsonb) cascade;

  -- Drop existing tables
  drop table if exists public.job_processing_errors cascade;
  drop table if exists public.job_processing_logs cascade;
  drop table if exists public.job_processing_queue cascade;
exception 
  when others then null;
end $$;

-- Create tables
create table public.job_processing_errors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  error_type text not null,
  error_message text not null,
  error_details jsonb,
  created_at timestamptz default now()
);

create table public.job_processing_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  started_at timestamptz default now(),
  completed_at timestamptz,
  jobs_found int default 0,
  jobs_processed int default 0,
  error text,
  created_at timestamptz default now()
);

create table public.job_processing_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  status text not null default 'pending',
  priority int default 0,
  retries int default 0,
  max_retries int default 3,
  last_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  scheduled_for timestamptz default now(),
  started_at timestamptz,
  completed_at timestamptz,
  constraint valid_status check (status in ('pending', 'processing', 'completed', 'failed'))
);

-- Create indexes
create index idx_job_processing_errors_user on public.job_processing_errors(user_id);
create index idx_job_processing_errors_type on public.job_processing_errors(error_type);
create index idx_job_processing_errors_created on public.job_processing_errors(created_at);

create index idx_job_processing_logs_user on public.job_processing_logs(user_id);
create index idx_job_processing_logs_created on public.job_processing_logs(created_at);

create index idx_job_processing_queue_status on public.job_processing_queue(status);
create index idx_job_processing_queue_user on public.job_processing_queue(user_id);
create index idx_job_processing_queue_scheduled on public.job_processing_queue(scheduled_for);

-- Enable RLS
alter table public.job_processing_errors enable row level security;
alter table public.job_processing_logs enable row level security;
alter table public.job_processing_queue enable row level security;

-- Create policies with unique names and timestamps
create policy "job_errors_select_20250111" on public.job_processing_errors
  for select using (auth.uid() = user_id);

create policy "job_errors_insert_20250111" on public.job_processing_errors
  for insert with check (auth.uid() = user_id);

create policy "job_logs_select_20250111" on public.job_processing_logs
  for select using (auth.uid() = user_id);

create policy "job_logs_insert_20250111" on public.job_processing_logs
  for insert with check (auth.uid() = user_id);

create policy "job_logs_update_20250111" on public.job_processing_logs
  for update using (auth.uid() = user_id);

create policy "job_queue_select_20250111" on public.job_processing_queue
  for select using (auth.uid() = user_id);

create policy "job_queue_insert_20250111" on public.job_processing_queue
  for insert with check (auth.uid() = user_id);

create policy "job_queue_update_20250111" on public.job_processing_queue
  for update using (auth.uid() = user_id);

-- Create functions
create or replace function check_required_api_keys()
returns table (provider text, configured boolean, required boolean)
security definer
language plpgsql
as $$
begin
  return query
  select 
    p.provider_name as provider,
    (select count(*) > 0 
     from public.api_keys 
     where provider = p.provider_name 
     and is_active = true) as configured,
    p.required as required
  from (
    values 
      ('openai'::text, true::boolean)
  ) as p(provider_name, required);
end;
$$;

create or replace function verify_api_configuration()
returns boolean
security definer
language plpgsql
as $$
declare
  v_error_id uuid;
begin
  -- Check OpenAI configuration
  if not exists (
    select 1 
    from public.api_keys 
    where provider = 'openai'
    and is_active = true
  ) then
    -- Log error
    insert into public.job_processing_errors (
      user_id,
      error_type,
      error_message,
      error_details
    ) values (
      auth.uid(),
      'api_configuration',
      'OpenAI API key not configured',
      jsonb_build_object(
        'timestamp', now(),
        'required_provider', 'openai'
      )
    ) returning id into v_error_id;
    
    raise exception 'OpenAI API key must be configured for job processing. Error ID: %', v_error_id;
  end if;

  return true;
end;
$$;

create or replace function log_processing_error(
  p_user_id uuid,
  p_error_message text,
  p_error_details jsonb default null
)
returns uuid
security definer
language plpgsql
as $$
declare
  v_error_id uuid;
begin
  insert into public.job_processing_errors (
    user_id,
    error_type,
    error_message,
    error_details
  ) values (
    p_user_id,
    'processing_error',
    p_error_message,
    p_error_details
  ) returning id into v_error_id;
  
  return v_error_id;
end;
$$;

create or replace function start_job_processing(p_user_id uuid)
returns uuid
security definer
language plpgsql
as $$
declare
  v_log_id uuid;
  v_queue_id uuid;
  v_error_id uuid;
begin
  -- Verify API configuration
  perform verify_api_configuration();
  
  -- Check if user already has a pending or processing job
  if exists (
    select 1 
    from public.job_processing_queue 
    where user_id = p_user_id 
    and status in ('pending', 'processing')
  ) then
    -- Log error
    select log_processing_error(
      p_user_id,
      'Job processing already in progress',
      jsonb_build_object(
        'timestamp', now(),
        'status', 'duplicate_request'
      )
    ) into v_error_id;
    
    raise exception 'Job processing already in progress. Error ID: %', v_error_id;
  end if;
  
  -- Create queue item
  insert into public.job_processing_queue (user_id)
  values (p_user_id)
  returning id into v_queue_id;
  
  -- Create processing log
  insert into public.job_processing_logs (user_id)
  values (p_user_id)
  returning id into v_log_id;
  
  return v_log_id;
end;
$$;

create or replace function update_job_processing_status(
  p_log_id uuid,
  p_jobs_found int default null,
  p_jobs_processed int default null,
  p_error text default null,
  p_completed boolean default false
)
returns void
security definer
language plpgsql
as $$
declare
  v_user_id uuid;
  v_error_id uuid;
begin
  -- Get user ID from log
  select user_id into v_user_id
  from public.job_processing_logs
  where id = p_log_id;
  
  if not found then
    -- Log error
    select log_processing_error(
      auth.uid(),
      'Invalid log ID provided',
      jsonb_build_object(
        'log_id', p_log_id,
        'timestamp', now()
      )
    ) into v_error_id;
    
    raise exception 'Invalid log ID provided. Error ID: %', v_error_id;
  end if;

  -- Update log
  update public.job_processing_logs
  set
    jobs_found = coalesce(p_jobs_found, jobs_found),
    jobs_processed = coalesce(p_jobs_processed, jobs_processed),
    error = p_error,
    completed_at = case when p_completed then now() else completed_at end
  where id = p_log_id;

  -- If completed, update queue item
  if p_completed then
    update public.job_processing_queue
    set
      status = case when p_error is null then 'completed' else 'failed' end,
      last_error = p_error,
      completed_at = now()
    where id in (
      select id 
      from public.job_processing_queue 
      where user_id = v_user_id
      and status = 'processing'
      order by created_at desc
      limit 1
    );
    
    -- Log error if one occurred
    if p_error is not null then
      perform log_processing_error(
        v_user_id,
        p_error,
        jsonb_build_object(
          'log_id', p_log_id,
          'jobs_found', p_jobs_found,
          'jobs_processed', p_jobs_processed,
          'timestamp', now()
        )
      );
    end if;
  end if;
end;
$$;

commit;