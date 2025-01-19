-- Application schema setup
begin;

-- Create application tables
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
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
    title text not null check (length(title) between 2 and 200),
    company text not null check (length(company) between 2 and 200),
    location text not null,
    type text check (type in ('full-time', 'part-time', 'contract', 'internship', 'remote')),
    salary text,
    description text not null,
    requirements text[] not null,
    posted_at timestamptz default now(),
    source text not null,
    source_url text unique,
    match_score real check (match_score between 0 and 100),
    match_reasons jsonb,
    active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists public.applications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade,
    job_id uuid references public.jobs on delete cascade,
    status text default 'applied' check (status in ('applied', 'contacted', 'rejected', 'accepted')),
    applied_at timestamptz default now(),
    last_contact_at timestamptz,
    customized_resume text,
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    constraint valid_contact_date check (last_contact_at >= applied_at)
);

create table if not exists public.access_requests (
    id uuid default uuid_generate_v4() primary key,
    email text not null unique check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    company text not null check (length(company) between 2 and 200),
    reason text not null,
    status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
    approved_at timestamptz,
    approval_token uuid default uuid_generate_v4(),
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.access_requests enable row level security;

commit;