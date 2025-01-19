-- Comprehensive setup and verification script
-- Run this in the Supabase SQL Editor to check and fix any issues

-- Start transaction
begin;

do $$
declare
  admin_email text;
begin
  raise notice 'Starting database verification and setup...';

  -- Enable required extensions
  create extension if not exists "uuid-ossp";
  create extension if not exists "pgcrypto";
  create extension if not exists "pg_net";

  -- Create schemas if they don't exist
  create schema if not exists auth;
  create schema if not exists storage;
  create schema if not exists edge;

  -- Create auth config if it doesn't exist
  create table if not exists auth.config (
    id bigint primary key generated always as identity,
    key text not null unique,
    value text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );

  -- Initialize auth settings
  insert into auth.config (key, value)
  values
    ('SITE_URL', current_setting('app.settings.site_url', true)),
    ('JWT_EXP', '3600'),
    ('DISABLE_SIGNUP', 'false'),
    ('MAILER_AUTOCONFIRM', 'false'),
    ('MAILER_SECURE_EMAIL_CHANGE_ENABLED', 'true'),
    ('MAILER_OTP_EXP', '86400')
  on conflict (key) do update
  set value = excluded.value;

  -- Create storage buckets table if it doesn't exist
  create table if not exists storage.buckets (
    id text primary key,
    name text not null unique,
    owner uuid references auth.users,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    public boolean default false,
    avif_autodetection boolean default false,
    file_size_limit bigint,
    allowed_mime_types text[]
  );

  -- Create storage objects table with correct schema
  drop table if exists storage.objects cascade;
  create table storage.objects (
    id uuid default uuid_generate_v4() primary key,
    bucket_id text references storage.buckets,
    name text,
    owner uuid references auth.users,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    last_accessed_at timestamptz default now(),
    metadata jsonb default '{}'::jsonb,
    version text default '1',
    size bigint,
    mime_type text,
    path_tokens text[] generated always as (string_to_array(name, '/')) stored
  );

  -- Create indexes for storage
  create index if not exists objects_path_tokens_idx on storage.objects using gin (path_tokens);
  create index if not exists objects_owner_idx on storage.objects (owner);
  create index if not exists objects_bucket_id_idx on storage.objects (bucket_id);

  -- Create application tables if they don't exist
  create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    resume_url text,
    resume_content jsonb,
    linkedin_url text,
    personal_website text,
    job_preferences jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );

  create table if not exists public.jobs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade,
    title text not null,
    company text not null,
    location text not null,
    type text,
    salary text,
    description text,
    requirements text[],
    posted_at timestamptz default now(),
    source text not null,
    source_url text unique,
    match_score real,
    match_reasons jsonb,
    active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );

  create table if not exists public.applications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade,
    job_id uuid references public.jobs on delete cascade,
    status text default 'applied'::text,
    applied_at timestamptz default now(),
    last_contact_at timestamptz,
    customized_resume text,
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );

  create table if not exists public.access_requests (
    id uuid default uuid_generate_v4() primary key,
    email text not null unique,
    company text not null,
    reason text not null,
    status text default 'pending'::text,
    approved_at timestamptz,
    approval_token uuid default uuid_generate_v4(),
    created_at timestamptz default now()
  );

  -- Create debug tables
  create table if not exists public.debug_config (
    id uuid primary key default uuid_generate_v4(),
    enabled boolean default false,
    log_level text default 'error'::text,
    show_in_console boolean default true,
    track_performance boolean default false,
    track_network_calls boolean default false,
    track_storage_operations boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );

  create table if not exists public.debug_logs (
    id uuid primary key default uuid_generate_v4(),
    level text not null,
    data jsonb not null,
    created_at timestamptz default now()
  );

  -- Create indexes
  create index if not exists idx_jobs_user_id on public.jobs(user_id);
  create index if not exists idx_jobs_match_score on public.jobs(match_score);
  create index if not exists idx_applications_user_id on public.applications(user_id);
  create index if not exists idx_applications_status on public.applications(status);
  create index if not exists idx_access_requests_email on public.access_requests(email);
  create index if not exists idx_access_requests_status on public.access_requests(status);
  create index if not exists idx_debug_logs_level on public.debug_logs(level);
  create index if not exists idx_debug_logs_created_at on public.debug_logs(created_at);

  -- Enable RLS on all tables
  alter table storage.buckets enable row level security;
  alter table storage.objects enable row level security;
  alter table public.profiles enable row level security;
  alter table public.jobs enable row level security;
  alter table public.applications enable row level security;
  alter table public.access_requests enable row level security;
  alter table public.debug_config enable row level security;
  alter table public.debug_logs enable row level security;

  -- Drop existing policies
  drop policy if exists "Allow public bucket access" on storage.buckets;
  drop policy if exists "Allow authenticated bucket access" on storage.buckets;
  drop policy if exists "Users can upload own resumes" on storage.objects;
  drop policy if exists "Users can view own resumes" on storage.objects;
  drop policy if exists "Public avatar access" on storage.objects;
  drop policy if exists "Users can upload avatars" on storage.objects;

  -- Create storage policies
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

  -- Create application policies
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

  -- Create storage buckets
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values 
    ('resumes', 'resumes', false, 5242880, array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
    ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/gif'])
  on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

  -- Create function to handle file uploads
  create or replace function handle_storage_upload()
  returns trigger as $$
  begin
    -- Set owner to current user if not set
    if new.owner is null then
      new.owner := auth.uid();
    end if;
    
    -- Set metadata if not provided
    if new.metadata is null then
      new.metadata := '{}'::jsonb;
    end if;
    
    -- Set version if not provided
    if new.version is null then
      new.version := '1';
    end if;
    
    return new;
  end;
  $$ language plpgsql security definer;

  -- Create trigger for file uploads
  drop trigger if exists on_storage_upload on storage.objects;
  create trigger on_storage_upload
    before insert on storage.objects
    for each row execute procedure handle_storage_upload();

  -- Create function to handle new users
  create or replace function public.handle_new_user()
  returns trigger as $$
  begin
    insert into public.profiles (id, email)
    values (new.id, new.email);
    return new;
  end;
  $$ language plpgsql security definer;

  -- Create trigger for new users
  drop trigger if exists on_auth_user_created on auth.users;
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

  -- Verify setup
  raise notice 'Verifying setup...';
  
  -- Check tables
  if exists (
    select 1 from information_schema.tables 
    where table_schema in ('public', 'storage') 
    and table_name in ('profiles', 'jobs', 'applications', 'buckets', 'objects')
  ) then
    raise notice 'Required tables exist';
  else
    raise exception 'Missing required tables';
  end if;

  -- Check storage buckets
  if exists (
    select 1 from storage.buckets 
    where id in ('resumes', 'avatars')
  ) then
    raise notice 'Storage buckets configured';
  else
    raise exception 'Storage buckets not configured';
  end if;

  -- Check policies
  if exists (
    select 1 from pg_policies 
    where schemaname in ('public', 'storage')
  ) then
    raise notice 'RLS policies created';
  else
    raise exception 'RLS policies not created';
  end if;

  raise notice 'Setup verification complete!';
end $$;

-- Commit transaction
commit;