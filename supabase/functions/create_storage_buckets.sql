create or replace function create_storage_buckets(buckets json)
returns void
language plpgsql
security definer
as $$
begin
  -- Temporarily disable RLS
  alter table storage.buckets disable row level security;
  alter table storage.objects disable row level security;

  -- Create buckets
  with bucket_data as (
    select 
      value->>'name' as name,
      (value->>'public')::boolean as public,
      (value->>'file_size_limit')::bigint as file_size_limit,
      array(select jsonb_array_elements_text(value->'allowed_mime_types')) as allowed_mime_types
    from json_array_elements(buckets)
  )
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  select name, name, public, file_size_limit, allowed_mime_types
  from bucket_data
  on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

  -- Re-enable RLS
  alter table storage.buckets enable row level security;
  alter table storage.objects enable row level security;
end;
$$;