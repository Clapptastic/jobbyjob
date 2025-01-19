-- Drop existing functions to avoid conflicts
drop function if exists check_required_api_keys();
drop function if exists verify_api_configuration();

-- Create function to check required API keys with proper error handling
create function check_required_api_keys()
returns table (provider text, configured boolean, required boolean) as $$
begin
  return query
  select 
    providers.provider_name as provider,
    (select count(*) > 0 
     from public.api_keys 
     where api_keys.provider = providers.provider_name 
     and api_keys.is_active = true) as configured,
    providers.required as required
  from (
    values 
      ('openai'::text, true::boolean),  -- Only OpenAI is required
      ('anthropic'::text, false::boolean),
      ('cohere'::text, false::boolean),
      ('google'::text, false::boolean)
  ) as providers(provider_name, required);
end;
$$ language plpgsql security definer;

-- Create function to verify API configuration before job processing
create function verify_api_configuration()
returns boolean as $$
declare
  ai_configured boolean;
begin
  -- Check if at least one AI provider is configured
  select exists(
    select 1 
    from public.api_keys 
    where provider in ('openai', 'anthropic', 'cohere', 'google')
    and is_active = true
  ) into ai_configured;

  if not ai_configured then
    raise exception 'At least one AI provider (OpenAI, Anthropic, Cohere, or Google) must be configured';
  end if;

  return true;
end;
$$ language plpgsql security definer;

-- Update API key validation function
create or replace function validate_api_key()
returns trigger as $$
begin
  -- Validate provider format
  if not new.provider = any(array['openai', 'anthropic', 'cohere', 'google']) then
    raise exception 'Invalid provider. Must be one of: openai, anthropic, cohere, google';
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

-- Update comments
comment on function check_required_api_keys is 'Returns status of AI providers. At least one AI provider must be configured.';
comment on function verify_api_configuration is 'Verifies that at least one AI provider is configured and active.';