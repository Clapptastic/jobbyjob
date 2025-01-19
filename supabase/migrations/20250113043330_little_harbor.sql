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
      -- Affinda API keys start with 'aff_' and are followed by 40 hex characters
      if not new.key_value ~ '^aff_[a-f0-9]{40}$' then
        raise exception 'Invalid Affinda API key format. Must start with aff_ followed by 40 hex characters';
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

-- Recreate trigger with new validation
drop trigger if exists validate_api_key_trigger on public.api_keys;
create trigger validate_api_key_trigger
  before insert or update on public.api_keys
  for each row
  execute function validate_api_key();