create or replace function create_storage_bucket(
  bucket_name text,
  is_public boolean,
  size_limit bigint,
  mime_types text[]
) returns void as $$
begin
  -- Temporarily disable RLS
  alter table storage.buckets disable row level security;
  alter table storage.objects disable row level security;

  -- Create bucket
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (bucket_name, bucket_name, is_public, size_limit, mime_types)
  on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

  -- Re-enable RLS
  alter table storage.buckets enable row level security;
  alter table storage.objects enable row level security;
end;
$$ language plpgsql security definer;