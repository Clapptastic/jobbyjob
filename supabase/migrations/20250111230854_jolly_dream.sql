-- Drop existing functions first to avoid return type conflicts
drop function if exists check_required_api_keys();
drop function if exists verify_api_configuration();

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
      ('openai'::text, true::boolean),
      ('affinda'::text, true::boolean),
      ('anthropic'::text, false::boolean),
      ('cohere'::text, false::boolean),
      ('google'::text, false::boolean)
  ) as providers(provider_name, required);
end;
$$ language plpgsql security definer;

-- Create function to verify API configuration before job processing
create function verify_api_configuration()
returns boolean as $$
declare
  missing_keys text[];
begin
  select array_agg(provider)
  into missing_keys
  from check_required_api_keys()
  where required = true and configured = false;

  if array_length(missing_keys, 1) > 0 then
    raise exception 'Missing required API keys: %', array_to_string(missing_keys, ', ');
  end if;

  return true;
end;
$$ language plpgsql security definer;

-- Create function to track job processing attempts
create table if not exists public.job_processing_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  started_at timestamptz default now(),
  completed_at timestamptz,
  jobs_found int,
  jobs_processed int,
  error text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.job_processing_logs enable row level security;

-- Create policy
create policy "Users can view own processing logs"
  on public.job_processing_logs
  for select
  using (auth.uid() = user_id);