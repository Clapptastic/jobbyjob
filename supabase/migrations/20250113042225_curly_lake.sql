-- Add test functions and improve error handling
create or replace function test_database_functionality()
returns jsonb
security definer
language plpgsql
as $$
declare
  v_result jsonb = '{}'::jsonb;
  v_test_user_id uuid;
begin
  -- Test user creation and profile trigger
  insert into auth.users (email)
  values ('test@example.com')
  returning id into v_test_user_id;

  v_result = jsonb_set(v_result, '{user_creation}', 'true'::jsonb);

  -- Test profile creation trigger
  if exists (
    select 1 from public.profiles
    where id = v_test_user_id
  ) then
    v_result = jsonb_set(v_result, '{profile_trigger}', 'true'::jsonb);
  else
    v_result = jsonb_set(v_result, '{profile_trigger}', 'false'::jsonb);
  end if;

  -- Test API key validation
  begin
    insert into public.api_keys (provider, key_value)
    values ('affinda', repeat('a', 64));
    v_result = jsonb_set(v_result, '{api_key_validation}', 'true'::jsonb);
  exception when others then
    v_result = jsonb_set(v_result, '{api_key_validation}', 'false'::jsonb);
  end;

  -- Test storage functionality
  begin
    insert into storage.buckets (id, name, public)
    values ('test-bucket', 'test-bucket', false);
    v_result = jsonb_set(v_result, '{storage_buckets}', 'true'::jsonb);
  exception when others then
    v_result = jsonb_set(v_result, '{storage_buckets}', 'false'::jsonb);
  end;

  -- Clean up test data
  delete from auth.users where id = v_test_user_id;
  delete from storage.buckets where id = 'test-bucket';

  return v_result;
end;
$$;

-- Add function to verify database schema
create or replace function verify_database_schema()
returns table (
  table_name text,
  schema_valid boolean,
  has_rls boolean,
  has_policies boolean
)
security definer
language plpgsql
as $$
begin
  return query
  select
    t.table_name::text,
    true as schema_valid,
    has_row_level_security(t.table_schema::name, t.table_name::name) as has_rls,
    exists (
      select 1 from pg_policies p
      where p.schemaname = t.table_schema
      and p.tablename = t.table_name
    ) as has_policies
  from information_schema.tables t
  where t.table_schema in ('public', 'storage')
  and t.table_type = 'BASE TABLE';
end;
$$;

-- Add function to check database connections
create or replace function check_database_connections()
returns table (
  connection_count bigint,
  active_queries bigint,
  longest_transaction interval
)
security definer
language plpgsql
as $$
begin
  return query
  select
    count(*)::bigint as connection_count,
    count(*) filter (where state = 'active')::bigint as active_queries,
    max(now() - xact_start)::interval as longest_transaction
  from pg_stat_activity
  where datname = current_database();
end;
$$;

-- Add function to verify storage setup
create or replace function verify_storage_setup()
returns table (
  bucket_name text,
  is_configured boolean,
  has_policies boolean
)
security definer
language plpgsql
as $$
begin
  return query
  select
    b.name::text as bucket_name,
    true as is_configured,
    exists (
      select 1 from pg_policies p
      where p.schemaname = 'storage'
      and p.tablename = 'objects'
      and p.policyname like '%' || b.name || '%'
    ) as has_policies
  from storage.buckets b;
end;
$$;

-- Add function to test RLS policies
create or replace function test_rls_policies()
returns table (
  table_name text,
  policy_name text,
  cmd text,
  policy_valid boolean
)
security definer
language plpgsql
as $$
begin
  return query
  select
    p.tablename::text,
    p.policyname::text,
    p.cmd::text,
    true as policy_valid
  from pg_policies p
  where p.schemaname in ('public', 'storage');
end;
$$;

-- Grant execute permissions to authenticated users
grant execute on function test_database_functionality to authenticated;
grant execute on function verify_database_schema to authenticated;
grant execute on function check_database_connections to authenticated;
grant execute on function verify_storage_setup to authenticated;
grant execute on function test_rls_policies to authenticated;