/*
  # Add API Keys Table

  1. New Tables
    - `api_keys`
      - `id` (uuid, primary key)
      - `provider` (text, unique)
      - `key_value` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `api_keys` table
    - Add policies for authenticated users to manage their API keys
*/

-- Create API keys table
create table if not exists public.api_keys (
    id uuid primary key default uuid_generate_v4(),
    provider text unique not null,
    key_value text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.api_keys enable row level security;

-- Create policies
create policy "Users can view API keys"
    on public.api_keys for select
    using (auth.role() = 'authenticated');

create policy "Users can insert API keys"
    on public.api_keys for insert
    with check (auth.role() = 'authenticated');

create policy "Users can update API keys"
    on public.api_keys for update
    using (auth.role() = 'authenticated');

-- Create index
create index if not exists idx_api_keys_provider on public.api_keys(provider);