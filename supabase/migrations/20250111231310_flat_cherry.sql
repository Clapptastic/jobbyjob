-- Drop existing policies and functions
do $$
begin
  -- Drop policies if they exist
  drop policy if exists "Users can view own processing logs" on public.job_processing_logs;
  drop policy if exists "Users can create processing logs" on public.job_processing_logs;
  drop policy if exists "Users can update own processing logs" on public.job_processing_logs;

  -- Drop functions if they exist
  drop function if exists check_required_api_keys();
  drop function if exists verify_api_configuration();
  drop function if exists start_job_processing(uuid);
  drop function if exists update_job_processing_status(uuid, int, int, text, boolean);
exception
  when others then null;
end $$;

-- Create function to check required API keys with proper error handling
create function check_required_api_keys()
returns table (provider text, configured boolean, required boolean) as $$
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
      ('openai'::text, true::boolean)  -- Only OpenAI is required
  ) as providers(provider_name, required);
end;
$$ language plpgsql security definer;

-- Create function to verify API configuration before job processing
create function verify_api_configuration()
returns boolean as $$
declare
  ai_configured boolean;
begin
  -- Check if OpenAI is configured
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
$$ language plpgsql security definer;

-- Create job processing log table if it doesn't exist
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

-- Enable RLS
alter table public.job_processing_logs enable row level security;

-- Create policies
create policy "Users can view own processing logs"
  on public.job_processing_logs
  for select
  using (auth.uid() = user_id);

create policy "Users can create processing logs"
  on public.job_processing_logs
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own processing logs"
  on public.job_processing_logs
  for update
  using (auth.uid() = user_id);

-- Create function to start job processing
create function start_job_processing(p_user_id uuid)
returns uuid as $$
declare
  v_log_id uuid;
begin
  -- Verify API configuration
  perform verify_api_configuration();
  
  -- Create processing log
  insert into public.job_processing_logs (user_id)
  values (p_user_id)
  returning id into v_log_id;
  
  return v_log_id;
end;
$$ language plpgsql security definer;

-- Create function to update job processing status
create function update_job_processing_status(
  p_log_id uuid,
  p_jobs_found int default null,
  p_jobs_processed int default null,
  p_error text default null,
  p_completed boolean default false
)
returns void as $$
begin
  update public.job_processing_logs
  set
    jobs_found = coalesce(p_jobs_found, jobs_found),
    jobs_processed = coalesce(p_jobs_processed, jobs_processed),
    error = p_error,
    completed_at = case when p_completed then now() else completed_at end
  where id = p_log_id;
end;
$$ language plpgsql security definer;