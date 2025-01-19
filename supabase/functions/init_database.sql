create or replace function init_database()
returns void
language plpgsql
security definer
as $$
begin
  -- Enable required extensions
  create extension if not exists "uuid-ossp";
  create extension if not exists "pgcrypto";
  create extension if not exists "pg_net";

  -- Create schemas if they don't exist
  create schema if not exists auth;
  create schema if not exists storage;
  create schema if not exists edge;

  -- Create required tables
  create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    resume_url text,
    resume_content jsonb,
    linkedin_url text,
    personal_website text,
    job_preferences jsonb,
    created_at timestamptz default timezone('utc'::text, now()) not null,
    updated_at timestamptz default timezone('utc'::text, now()) not null
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
    posted_at timestamptz default timezone('utc'::text, now()) not null,
    source text not null,
    source_url text unique,
    match_score real,
    match_reasons jsonb,
    active boolean default true,
    created_at timestamptz default timezone('utc'::text, now()) not null
  );

  create table if not exists public.applications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade,
    job_id uuid references public.jobs on delete cascade,
    status text default 'applied'::text,
    applied_at timestamptz default timezone('utc'::text, now()) not null,
    last_contact_at timestamptz,
    customized_resume text,
    notes text,
    created_at timestamptz default timezone('utc'::text, now()) not null
  );

  -- Enable RLS
  alter table public.profiles enable row level security;
  alter table public.jobs enable row level security;
  alter table public.applications enable row level security;

  -- Create policies
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

  create policy "Users can update own applications"
    on public.applications for update
    using (auth.uid() = user_id);
end;
$$;