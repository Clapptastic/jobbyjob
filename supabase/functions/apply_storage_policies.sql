create or replace function apply_storage_policies() returns void as $$
begin
  -- Temporarily disable RLS
  alter table storage.buckets disable row level security;
  alter table storage.objects disable row level security;

  -- Drop existing policies
  drop policy if exists "Allow public bucket access" on storage.buckets;
  drop policy if exists "Allow authenticated bucket access" on storage.buckets;
  drop policy if exists "Users can upload their own resumes" on storage.objects;
  drop policy if exists "Users can view their own resumes" on storage.objects;
  drop policy if exists "Anyone can view public avatars" on storage.objects;
  drop policy if exists "Authenticated users can upload avatars" on storage.objects;

  -- Create bucket policies
  create policy "Allow public bucket access"
    on storage.buckets for select
    using ( public = true );

  create policy "Allow authenticated bucket access"
    on storage.buckets for select
    using ( auth.role() = 'authenticated' );

  -- Create object policies
  create policy "Users can upload their own resumes"
    on storage.objects for insert
    with check (
      bucket_id = 'resumes'
      and auth.role() = 'authenticated'
      and (owner = auth.uid() or owner is null)
    );

  create policy "Users can view their own resumes"
    on storage.objects for select
    using (
      bucket_id = 'resumes'
      and (owner = auth.uid() or owner is null)
    );

  create policy "Anyone can view public avatars"
    on storage.objects for select
    using (
      bucket_id = 'avatars'
    );

  create policy "Authenticated users can upload avatars"
    on storage.objects for insert
    with check (
      bucket_id = 'avatars'
      and auth.role() = 'authenticated'
      and (owner = auth.uid() or owner is null)
    );

  -- Re-enable RLS
  alter table storage.buckets enable row level security;
  alter table storage.objects enable row level security;
end;
$$ language plpgsql security definer;