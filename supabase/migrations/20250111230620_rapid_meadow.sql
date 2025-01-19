-- Fix ambiguous column reference in check_required_api_keys
create or replace function check_required_api_keys()
returns table (provider text, configured boolean) as $$
begin
  return query
  select 
    providers.provider_name as provider,
    (select count(*) > 0 
     from public.api_keys 
     where api_keys.provider = providers.provider_name 
     and api_keys.is_active = true) as configured
  from (
    values 
      ('openai'),
      ('affinda')
  ) as providers(provider_name);
end;
$$ language plpgsql security definer;

-- Update API key validation with better error handling
create or replace function validate_api_key()
returns trigger as $$
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
      if length(new.key_value) != 64 then
        raise exception 'Invalid Affinda API key format. Must be 64 characters long';
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
$$ language plpgsql;

-- Recreate trigger with new validation
drop trigger if exists validate_api_key_trigger on public.api_keys;
create trigger validate_api_key_trigger
  before insert or update on public.api_keys
  for each row
  execute function validate_api_key();