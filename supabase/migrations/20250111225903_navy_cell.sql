/*
  # Fix API key validation function

  1. Changes
    - Add ELSE clause to CASE statement
    - Keep existing provider validations
    - Maintain required provider checks

  2. Security
    - RLS policies remain unchanged
    - Validation for required providers maintained
*/

-- Update API key validation function with ELSE clause
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
    else
      -- No specific validation for other providers
      null;
  end case;

  return new;
end;
$$ language plpgsql;