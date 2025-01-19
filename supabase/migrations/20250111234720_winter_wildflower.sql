-- Start transaction
begin;

-- Drop existing policy if it exists
do $$
begin
  drop policy if exists "Users can delete API keys" on public.api_keys;
exception
  when others then null;
end $$;

-- Create policy for API key deletion with unique name
create policy "api_keys_delete_20250111" 
  on public.api_keys
  for delete
  using (auth.role() = 'authenticated');

-- Create or replace function to safely remove API key
create or replace function remove_api_key(p_provider text)
returns boolean
security definer
language plpgsql
as $$
declare
  v_key_exists boolean;
begin
  -- Check if key exists
  select exists(
    select 1 
    from public.api_keys 
    where provider = p_provider
  ) into v_key_exists;

  if not v_key_exists then
    raise exception 'API key not found for provider: %', p_provider;
  end if;

  -- Delete the API key
  delete from public.api_keys
  where provider = p_provider;
  
  return true;
end;
$$;

commit;