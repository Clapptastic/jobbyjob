-- Start transaction
begin;

-- Create storage schema if it doesn't exist
create schema if not exists storage;

-- Create storage buckets table
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

-- Create storage objects table
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

-- Create indexes
create index if not exists objects_path_tokens_idx on storage.objects using gin (path_tokens);
create index if not exists objects_owner_idx on storage.objects (owner);
create index if not exists objects_bucket_id_idx on storage.objects (bucket_id);

-- Enable RLS
alter table storage.buckets enable row level security;
alter table storage.objects enable row level security;

-- Create storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
    ('resumes', 'resumes', false, 5242880, array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
    ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/gif'])
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

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

commit;