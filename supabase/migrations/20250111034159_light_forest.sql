-- Fix storage schema permissions
begin;

-- Create storage schema if not exists
create schema if not exists storage;

-- Grant necessary permissions
grant usage on schema storage to authenticated, anon;
grant all on schema storage to service_role;
grant all on schema storage to postgres;

-- Create required functions
create or replace function storage.get_size()
returns bigint as $$
  select coalesce(sum(length(metadata::text)), 0) from storage.objects;
$$ language sql;

commit;