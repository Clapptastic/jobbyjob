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

commit;