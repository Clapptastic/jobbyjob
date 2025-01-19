-- Add is_active column to api_keys table
alter table public.api_keys
add column if not exists is_active boolean default true;

-- Add updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
drop trigger if exists update_api_keys_updated_at on public.api_keys;
create trigger update_api_keys_updated_at
  before update on public.api_keys
  for each row
  execute function update_updated_at_column();

-- Add validation function
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
  end case;

  return new;
end;
$$ language plpgsql;

-- Create trigger for key validation
drop trigger if exists validate_api_key_trigger on public.api_keys;
create trigger validate_api_key_trigger
  before insert or update on public.api_keys
  for each row
  execute function validate_api_key();

-- Add indexes
create index if not exists idx_api_keys_provider on public.api_keys(provider);
create index if not exists idx_api_keys_is_active on public.api_keys(is_active);