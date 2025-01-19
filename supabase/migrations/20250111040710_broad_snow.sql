-- Fix tables and policies
begin;

-- Drop existing policies to avoid conflicts
do $$
begin
  -- Drop profile policies
  drop policy if exists "Users can view own profile" on public.profiles;
  drop policy if exists "Users can update own profile" on public.profiles;
  drop policy if exists "Users can insert own profile" on public.profiles;
  
  -- Drop job policies
  drop policy if exists "Users can view own jobs" on public.jobs;
  drop policy if exists "Users can create jobs" on public.jobs;
  
  -- Drop application policies
  drop policy if exists "Users can view own applications" on public.applications;
  drop policy if exists "Users can create applications" on public.applications;
  drop policy if exists "Users can update own applications" on public.applications;
exception
  when others then null;
end $$;

-- Create tables if they don't exist
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
    created_at timestamptz default now()
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
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

-- Create new policies
create policy "Users can view own profile_new"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile_new"
    on public.profiles for update
    using (auth.uid() = id);

create policy "Users can insert own profile_new"
    on public.profiles for insert
    with check (auth.uid() = id);

create policy "Users can view own jobs_new"
    on public.jobs for select
    using (auth.uid() = user_id);

create policy "Users can create jobs_new"
    on public.jobs for insert
    with check (auth.uid() = user_id);

create policy "Users can view own applications_new"
    on public.applications for select
    using (auth.uid() = user_id);

create policy "Users can create applications_new"
    on public.applications for insert
    with check (auth.uid() = user_id);

create policy "Users can update own applications_new"
    on public.applications for update
    using (auth.uid() = user_id);

-- Create indexes
create index if not exists idx_jobs_user_id on public.jobs(user_id);
create index if not exists idx_jobs_match_score on public.jobs(match_score);
create index if not exists idx_applications_user_id on public.applications(user_id);
create index if not exists idx_applications_job_id on public.applications(job_id);
create index if not exists idx_applications_status on public.applications(status);

commit;