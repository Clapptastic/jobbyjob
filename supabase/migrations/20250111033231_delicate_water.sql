-- Security policies setup
begin;

-- Drop existing policies to avoid conflicts
do $$
begin
    -- Storage policies
    drop policy if exists "Allow public bucket access" on storage.buckets;
    drop policy if exists "Allow authenticated bucket access" on storage.buckets;
    drop policy if exists "Users can upload own resumes" on storage.objects;
    drop policy if exists "Users can view own resumes" on storage.objects;
    drop policy if exists "Public avatar access" on storage.objects;
    drop policy if exists "Users can upload avatars" on storage.objects;

    -- Application policies
    drop policy if exists "Users can view own profile" on public.profiles;
    drop policy if exists "Users can update own profile" on public.profiles;
    drop policy if exists "Users can view own jobs" on public.jobs;
    drop policy if exists "Users can create jobs" on public.jobs;
    drop policy if exists "Users can view own applications" on public.applications;
    drop policy if exists "Users can create applications" on public.applications;
    drop policy if exists "Anyone can create access request" on public.access_requests;
    drop policy if exists "Users can view own access request" on public.access_requests;
exception
    when others then null;
end $$;

-- Storage policies
create policy "Allow public bucket access"
    on storage.buckets for select
    using (public = true);

create policy "Allow authenticated bucket access"
    on storage.buckets for select
    using (auth.role() = 'authenticated');

create policy "Users can upload own resumes"
    on storage.objects for insert
    with check (
        bucket_id = 'resumes'
        and auth.role() = 'authenticated'
        and owner = auth.uid()
    );

create policy "Users can view own resumes"
    on storage.objects for select
    using (
        bucket_id = 'resumes'
        and owner = auth.uid()
    );

create policy "Public avatar access"
    on storage.objects for select
    using (bucket_id = 'avatars');

create policy "Users can upload avatars"
    on storage.objects for insert
    with check (
        bucket_id = 'avatars'
        and auth.role() = 'authenticated'
        and owner = auth.uid()
    );

-- Application policies
create policy "Users can view own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = id);

create policy "Users can view own jobs"
    on public.jobs for select
    using (auth.uid() = user_id);

create policy "Users can create jobs"
    on public.jobs for insert
    with check (auth.uid() = user_id);

create policy "Users can view own applications"
    on public.applications for select
    using (auth.uid() = user_id);

create policy "Users can create applications"
    on public.applications for insert
    with check (auth.uid() = user_id);

create policy "Anyone can create access request"
    on public.access_requests for insert
    with check (true);

create policy "Users can view own access request"
    on public.access_requests for select
    using (email = auth.email());

commit;