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

-- Initialize auth config
insert into auth.config (key, value)
values
  ('SITE_URL', 'http://localhost:5173'),
  ('JWT_EXP', '3600'),
  ('DISABLE_SIGNUP', 'false')
on conflict (key) do update
set value = excluded.value;

-- Create storage buckets
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

-- Create storage objects
create table if not exists storage.objects (
    id uuid default uuid_generate_v4() primary key,
    bucket_id text references storage.buckets,
    name text,
    owner uuid references auth.users,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    last_accessed_at timestamptz default now(),
    metadata jsonb,
    path_tokens text[] generated always as (string_to_array(name, '/')) stored
);

-- Create default buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
    ('resumes', 'resumes', false, 5242880, array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
    ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/gif'])
on conflict (id) do nothing;

-- Enable RLS
alter table storage.buckets enable row level security;
alter table storage.objects enable row level security;

-- Create storage policies
create policy "Allow public bucket access"
    on storage.buckets for select
    using (public = true);

create policy "Allow authenticated bucket access"
    on storage.buckets for select
    using (auth.role() = 'authenticated');

create policy "Users can upload own resumes"
    on storage.objects for insert
    with check (bucket_id = 'resumes' and auth.role() = 'authenticated');

create policy "Users can view own resumes"
    on storage.objects for select
    using (bucket_id = 'resumes' and auth.uid() = owner);

create policy "Public avatar access"
    on storage.objects for select
    using (bucket_id = 'avatars');

create policy "Users can upload avatars"
    on storage.objects for insert
    with check (bucket_id = 'avatars' and auth.role() = 'authenticated');