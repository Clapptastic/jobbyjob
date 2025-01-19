-- Start transaction
begin;

-- Drop existing function
drop function if exists start_job_processing(uuid);

-- Create improved job processing function with proper locking
create or replace function start_job_processing(p_user_id uuid)
returns uuid
security definer
language plpgsql
as $$
declare
  v_log_id uuid;
  v_existing_job record;
begin
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

-- Update job processing status function to handle concurrent updates
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
begin
  -- Get user ID from log with row lock
  select user_id into v_user_id
  from public.job_processing_logs
  where id = p_log_id
  for update;
  
  if not found then
    raise exception 'Invalid log ID provided';
  end if;

  -- Update log
  update public.job_processing_logs
  set
    jobs_found = coalesce(p_jobs_found, jobs_found),
    jobs_processed = coalesce(p_jobs_processed, jobs_processed),
    error = p_error,
    completed_at = case when p_completed then now() else completed_at end,
    updated_at = now()
  where id = p_log_id;

  -- If completed, update queue item
  if p_completed then
    update public.job_processing_queue
    set
      status = case when p_error is null then 'completed' else 'failed' end,
      last_error = p_error,
      completed_at = now(),
      updated_at = now()
    where user_id = v_user_id
    and status in ('pending', 'processing')
    and created_at > now() - interval '1 hour';
  end if;
end;
$$;

-- Create function to clean up stale jobs
create or replace function cleanup_stale_jobs()
returns void
security definer
language plpgsql
as $$
begin
  -- Update stale processing jobs to failed
  update public.job_processing_queue
  set
    status = 'failed',
    last_error = 'Job processing timed out',
    completed_at = now(),
    updated_at = now()
  where status in ('pending', 'processing')
  and created_at < now() - interval '1 hour';

  -- Update corresponding logs
  update public.job_processing_logs
  set
    error = 'Job processing timed out',
    completed_at = now(),
    updated_at = now()
  where completed_at is null
  and created_at < now() - interval '1 hour';
end;
$$;

commit;