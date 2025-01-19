/*
  # Add Affinda API key requirement

  1. Changes
    - Add validation for Affinda API key format
    - Update API key validation function
    - Add Affinda to required providers list

  2. Security
    - Maintains existing RLS policies
    - No destructive operations
*/

-- Update API key validation function to include Affinda
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
  end case;

  return new;
end;
$$ language plpgsql;

-- Create function to check required API keys
create or replace function check_required_api_keys()
returns table (provider text, configured boolean) as $$
begin
  return query
  select 
    p.provider,
    (select count(*) > 0 from public.api_keys where provider = p.provider and is_active = true) as configured
  from (
    values 
      ('openai'),
      ('affinda')
  ) as p(provider);
end;
$$ language plpgsql security definer;

-- Add comment explaining required providers
comment on function check_required_api_keys is 'Returns status of required API providers: OpenAI and Affinda';