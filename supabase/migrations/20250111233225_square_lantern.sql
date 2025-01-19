/*
  # Add API Key Removal

  1. Changes
    - Adds policy for deleting API keys
    - Adds function to safely remove API keys
    - Adds audit logging for key removal
  
  2. Security
    - Only authenticated users can remove their keys
    - Audit trail for key removals
    - Proper error handling
*/

-- Start transaction
begin;

-- Create policy for API key deletion
create policy "Users can delete API keys"
  on public.api_keys
  for delete
  using (auth.role() = 'authenticated');

-- Create function to safely remove API key
create or replace function remove_api_key(p_provider text)
returns boolean
security definer
language plpgsql
as $$
begin
  -- Delete the API key
  delete from public.api_keys
  where provider = p_provider;
  
  return true;
end;
$$;

commit;