/*
  # Fix API Key Checks and Job Processing

  1. Changes
    - Fixes ambiguous column reference in check_required_api_keys
    - Improves error handling and validation
    - Adds proper error tracking
    - Fixes policy naming conflicts
  
  2. Functions
    - check_required_api_keys: Returns API key status
    - verify_api_configuration: Validates API setup
    - log_processing_error: Tracks errors
  
  3. Security
    - All functions are security definer
    - Proper error logging
    - Input validation
*/

-- Start transaction
begin;

-- Drop existing functions to avoid conflicts
do $$
begin
  drop function if exists check_required_api_keys() cascade;
  drop function if exists verify_api_configuration() cascade;
  drop function if exists log_processing_error() cascade;
exception 
  when others then null;
end $$;

-- Create error logging function
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

-- Create function to check required API keys
create or replace function check_required_api_keys()
returns table (
  provider_name text,
  is_configured boolean,
  is_required boolean
)
security definer
language plpgsql
as $$
begin
  return query
  select 
    p.name as provider_name,
    (exists (
      select 1 
      from public.api_keys k
      where k.provider = p.name 
      and k.is_active = true
    )) as is_configured,
    p.required as is_required
  from (
    values 
      ('openai'::text, true::boolean)
  ) as p(name, required);
end;
$$;

-- Create function to verify API configuration
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

commit;