/*
  # Consolidate Job Processing Setup

  1. Changes
    - Consolidates job processing tables and functions
    - Fixes policy naming conflicts
    - Updates API key verification logic
    - Adds proper error handling
  
  2. New Tables
    - job_processing_logs: Track job processing attempts
    - job_processing_queue: Manage job processing queue
  
  3. Security
    - Enables RLS on all tables
    - Adds policies with unique names
    - Uses security definer functions
*/

-- Start transaction
begin;

-- Drop existing objects to avoid conflicts
do $$
begin
  -- Drop functions if they exist
  drop function if exists check_required_api_keys() cascade;
  drop function if exists verify_api_configuration() cascade;
  drop function if exists start_job_processing(uuid) cascade;
  drop function if exists update_job_processing_status(uuid, int, int, text, boolean) cascade;

  -- Drop policies if they exist
  drop policy if exists "Users can view own processing logs" on public.job_processing_logs;
  drop policy if exists "Users can create processing logs" on public.job_processing_logs;
  drop policy if exists "Users can update own processing logs" on public.job_processing_logs;
  drop policy if exists "Users can view own queue items" on public.job_processing_queue;
  drop policy if exists "Users can create queue items" on public.job_processing_queue;
  drop policy if exists "Users can update own queue items" on public.job_processing_queue;
  drop policy if exists "job_processing_logs_select" on public.job_processing_logs;
  drop policy if exists "job_processing_logs_insert" on public.job_processing_logs;
  drop policy if exists "job_processing_logs_update" on public.job_processing_logs;
  drop policy if exists "job_processing_queue_select" on public.job_processing_queue;
  drop policy if exists "job_processing_queue_insert" on public.job_processing_queue;
  drop policy if exists "job_processing_queue_update" on public.job_processing_queue;
exception
  when others then null;
end $$;

-- Create job processing tables
create table if not exists public.job_processing_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  started_at timestamptz default now(),
  completed_at timestamptz,
  jobs_found int default 0,
  jobs_processed int default 0,
  error text,
  created_at timestamptz default now()
);

create table if not exists public.job_processing_queue (
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
create index if not exists idx_job_processing_queue_status on public.job_processing_queue(status);
create index if not exists idx_job_processing_queue_user on public.job_processing_queue(user_id);
create index if not exists idx_job_processing_queue_scheduled on public.job_processing_queue(scheduled_for);

-- Enable RLS
alter table public.job_processing_logs enable row level security;
alter table public.job_processing_queue enable row level security;

-- Create policies with unique names
create policy "process_logs_select_20250111" on public.job_processing_logs
  for select using (auth.uid() = user_id);

create policy "process_logs_insert_20250111" on public.job_processing_logs
  for insert with check (auth.uid() = user_id);

create policy "process_logs_update_20250111" on public.job_processing_logs
  for update using (auth.uid() = user_id);

create policy "process_queue_select_20250111" on public.job_processing_queue
  for select using (auth.uid() = user_id);

create policy "process_queue_insert_20250111" on public.job_processing_queue
  for insert with check (auth.uid() = user_id);

create policy "process_queue_update_20250111" on public.job_processing_queue
  for update using (auth.uid() = user_id);

-- Create API verification functions
create or replace function check_required_api_keys()
returns table (provider text, configured boolean, required boolean)
security definer
language plpgsql
as $$
begin
  return query
  select 
    providers.provider_name as provider,
    (select count(*) > 0 
     from public.api_keys 
     where api_keys.provider = providers.provider_name 
     and api_keys.is_active = true) as configured,
    providers.required as required
  from (
    values 
      ('openai'::text, true::boolean)
  ) as providers(provider_name, required);
end;
$$;

create or replace function verify_api_configuration()
returns boolean
security definer
language plpgsql
as $$
declare
  ai_configured boolean;
begin
  select exists(
    select 1 
    from public.api_keys 
    where provider = 'openai'
    and is_active = true
  ) into ai_configured;

  if not ai_configured then
    raise exception 'OpenAI API key must be configured for job processing';
  end if;

  return true;
end;
$$;

-- Create job processing functions
create or replace function start_job_processing(p_user_id uuid)
returns uuid
security definer
language plpgsql
as $$
declare
  v_log_id uuid;
  v_queue_id uuid;
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
    raise exception 'Job processing already in progress';
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
begin
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
      where user_id = (
        select user_id 
        from public.job_processing_logs 
        where id = p_log_id
      )
      and status = 'processing'
      order by created_at desc
      limit 1
    );
  end if;
end;
$$;

commit;