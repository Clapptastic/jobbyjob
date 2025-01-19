-- Start transaction
begin;

-- Drop existing function
drop function if exists start_job_processing(uuid);

-- Create improved job processing function with proper locking and rate limiting
create or replace function start_job_processing(p_user_id uuid)
returns uuid
security definer
language plpgsql
as $$
declare
  v_log_id uuid;
  v_existing_job record;
  v_last_job record;
begin
  -- Check rate limiting
  select * into v_last_job
  from public.job_processing_logs
  where user_id = p_user_id
  and created_at > now() - interval '5 minutes'
  order by created_at desc
  limit 1;

  if found then
    raise exception 'Please wait 5 minutes between job processing requests';
  end if;

  -- Get existing job with advisory lock to prevent race conditions
  select * into v_existing_job
  from public.job_processing_queue
  where user_id = p_user_id
  and status in ('pending', 'processing')
  and created_at > now() - interval '1 hour'
  for update skip locked;

  -- If there's an existing recent job, return its log ID
  if found then
    select id into v_log_id
    from public.job_processing_logs
    where user_id = p_user_id
    and created_at > now() - interval '1 hour'
    order by created_at desc
    limit 1;
    
    return v_log_id;
  end if;

  -- Verify API configuration
  perform verify_api_configuration();
  
  -- Create queue item
  insert into public.job_processing_queue (
    user_id,
    status,
    created_at,
    scheduled_for
  ) values (
    p_user_id,
    'pending',
    now(),
    now()
  );
  
  -- Create processing log
  insert into public.job_processing_logs (
    user_id,
    started_at,
    created_at
  ) values (
    p_user_id,
    now(),
    now()
  ) returning id into v_log_id;
  
  return v_log_id;
end;
$$;

commit;