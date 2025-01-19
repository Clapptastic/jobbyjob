-- Create or replace the clear_cache function with proper SQL syntax
create or replace function clear_cache()
returns void
security definer
language plpgsql
as $$
begin
  -- Clear cache table with proper WHERE clause
  delete from public.cache 
  where expires_at < now() or expires_at is null;
  
  -- Clear job processing logs older than 1 hour
  delete from public.job_processing_logs
  where created_at < now() - interval '1 hour';
  
  -- Reset processing status for stale jobs
  update public.job_processing_queue
  set status = 'failed',
      last_error = 'Job processing timed out',
      completed_at = now()
  where status in ('pending', 'processing')
  and created_at < now() - interval '1 hour';

  -- Notify of cache clear
  notify cache_cleared;
end;
$$;

-- Grant execute permission
grant execute on function clear_cache to authenticated;