-- IMPORTANT: Run this entire file in the Supabase SQL Editor

-- Start transaction
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

-- [Rest of the file remains exactly the same...]