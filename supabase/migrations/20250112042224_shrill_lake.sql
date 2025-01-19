-- Initial database setup
begin;

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_net";

-- Create schemas
create schema if not exists auth;
create schema if not exists storage;
create schema if not exists edge;

-- Create auth config table
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
    ('SITE_URL', 'http://localhost:5173'),
    ('JWT_EXP', '3600'),
    ('DISABLE_SIGNUP', 'false'),
    ('MAILER_AUTOCONFIRM', 'false'),
    ('MAILER_SECURE_EMAIL_CHANGE_ENABLED', 'true'),
    ('MAILER_OTP_EXP', '86400')
on conflict (key) do update
set value = excluded.value;

-- Create storage tables
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

create table if not exists storage.objects (
    id uuid default uuid_generate_v4() primary key,
    bucket_id text references storage.buckets on delete cascade,
    name text not null,
    owner uuid references auth.users on delete cascade,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    last_accessed_at timestamptz default now(),
    metadata jsonb default '{}'::jsonb,
    version text default '1',
    size bigint,
    mime_type text,
    path_tokens text[] generated always as (string_to_array(name, '/')) stored
);

-- Create application tables
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    resume_url text,
    resume_content jsonb,
    linkedin_url text,
    personal_website text,
    job_preferences jsonb,
    resumes jsonb default '[]'::jsonb,
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

create table if not exists public.api_keys (
    id uuid primary key default uuid_generate_v4(),
    provider text unique not null,
    key_value text not null,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists public.job_processing_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users not null,
    started_at timestamptz default now(),
    completed_at timestamptz,
    jobs_found int default 0,
    jobs_processed int default 0,
    error text,
    created_at timestamptz default now()
);

create table if not exists public.error_reports (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users,
    source text not null,
    error_code text not null,
    message text,
    details jsonb,
    timestamp timestamptz default now(),
    resolved boolean default false,
    resolved_at timestamptz,
    created_at timestamptz default now()
);

-- Create indexes
create index if not exists idx_jobs_user_id on public.jobs(user_id);
create index if not exists idx_jobs_match_score on public.jobs(match_score);
create index if not exists idx_applications_user_id on public.applications(user_id);
create index if not exists idx_applications_job_id on public.applications(job_id);
create index if not exists idx_api_keys_provider on public.api_keys(provider);
create index if not exists objects_path_tokens_idx on storage.objects using gin (path_tokens);
create index if not exists objects_owner_idx on storage.objects (owner);
create index if not exists objects_bucket_id_idx on storage.objects (bucket_id);
create index if not exists idx_error_reports_source on public.error_reports(source);
create index if not exists idx_error_reports_created_at on public.error_reports(created_at);

-- Enable RLS
alter table storage.buckets enable row level security;
alter table storage.objects enable row level security;
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.api_keys enable row level security;
alter table public.job_processing_logs enable row level security;
alter table public.error_reports enable row level security;

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

create policy "Users can view own error reports"
    on public.error_reports for select
    using (auth.uid() = user_id);

-- Create storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
    ('resumes', 'resumes', false, 5242880, array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
    ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/gif'])
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

commit;