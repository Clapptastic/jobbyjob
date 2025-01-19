-- Start transaction
begin;

-- Create schemas if they don't exist
create schema if not exists public;
create schema if not exists auth;
create schema if not exists edge;

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_net";

-- Create auth config table
create table if not exists auth.config (
    id bigint primary key generated always as identity,
    key text not null unique,
    value text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Initialize auth settings with explicit values
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

-- Create auth users table
create table if not exists auth.users (
    id uuid primary key default gen_random_uuid(),
    email text unique not null,
    encrypted_password text not null,
    email_confirmed_at timestamptz,
    invited_at timestamptz,
    confirmation_token text,
    confirmation_sent_at timestamptz,
    recovery_token text,
    recovery_sent_at timestamptz,
    email_change_token text,
    email_change text,
    email_change_sent_at timestamptz,
    last_sign_in_at timestamptz,
    raw_app_meta_data jsonb default '{}'::jsonb,
    raw_user_meta_data jsonb default '{}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create admin users table
create table if not exists auth.admin_users (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create application tables
create table public.profiles (
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

-- Grant necessary permissions
grant all privileges on all tables in schema public to postgres, service_role;
grant all privileges on all tables in schema auth to postgres, service_role;
grant all privileges on all tables in schema edge to postgres, service_role;

grant all privileges on all sequences in schema public to postgres, service_role;
grant all privileges on all sequences in schema auth to postgres, service_role;
grant all privileges on all sequences in schema edge to postgres, service_role;

commit;