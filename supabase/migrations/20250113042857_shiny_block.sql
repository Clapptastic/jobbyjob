-- Fix API key validation for Affinda
create or replace function validate_api_key()
returns trigger
security definer
language plpgsql
as $$
begin
  -- Validate provider format
  if not new.provider = any(array['openai', 'anthropic', 'cohere', 'google', 'affinda']) then
    raise exception 'Invalid provider. Must be one of: openai, anthropic, cohere, google, affinda';
  end if;

  -- Validate key format based on provider
  case new.provider
    when 'openai' then
      if not new.key_value like 'sk-%' then
        raise exception 'Invalid OpenAI API key format. Must start with sk-';
      end if;
    when 'anthropic' then
      if not new.key_value like 'sk-ant-%' then
        raise exception 'Invalid Anthropic API key format. Must start with sk-ant-';
      end if;
    when 'google' then
      if not new.key_value like 'AI%' then
        raise exception 'Invalid Google AI API key format. Must start with AI';
      end if;
    when 'affinda' then
      -- Affinda API keys are 32-character alphanumeric strings
      if not new.key_value ~ '^[A-Za-z0-9]{32}$' then
        raise exception 'Invalid Affinda API key format. Must be 32 alphanumeric characters';
      end if;
    else
      -- For any other providers, just ensure key is not empty
      if length(new.key_value) < 1 then
        raise exception 'API key cannot be empty';
      end if;
  end case;

  -- Set updated_at timestamp
  new.updated_at := now();
  
  return new;
end;
$$;

-- Add test functions
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
    values ('affinda', 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6');
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

-- Grant execute permissions
grant execute on function test_database_functionality to authenticated;