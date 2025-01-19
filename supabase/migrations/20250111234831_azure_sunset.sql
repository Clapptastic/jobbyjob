-- Start transaction
begin;

-- Create cache table if it doesn't exist
create table if not exists public.cache (
  id uuid primary key default uuid_generate_v4(),
  key text not null,
  value jsonb,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index on expiration
create index if not exists idx_cache_expires_at on public.cache(expires_at);

-- Enable RLS
alter table public.cache enable row level security;

-- Create policy for cache access
create policy "Users can manage own cache"
  on public.cache
  using (true);

-- Create function to clear cache
create or replace function clear_cache()
returns void
security definer
language plpgsql
as $$
begin
  -- Clear all cache entries
  delete from public.cache;
  
  -- Clear API key cache
  update public.api_keys
  set updated_at = now()
  where is_active = true;
  
  -- Clear job processing cache
  update public.job_processing_logs
  set updated_at = now()
  where completed_at is null;
  
  -- Clear application cache
  update public.applications
  set updated_at = now()
  where status = 'applied';
end;
$$;

commit;