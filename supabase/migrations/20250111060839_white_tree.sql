/*
  # Add resumes column to profiles table

  1. Changes
    - Add JSONB column 'resumes' to profiles table to store multiple resume entries
    - Each resume entry contains url, fileName, and uploadedAt fields
    - Add index for better query performance
  
  2. Security
    - Column inherits existing RLS policies from profiles table
*/

-- Add resumes column to profiles table
alter table public.profiles 
add column if not exists resumes jsonb default '[]'::jsonb;

-- Create index for better performance when querying resumes
create index if not exists idx_profiles_resumes on public.profiles using gin (resumes);

-- Validate resumes column format
create or replace function validate_resumes()
returns trigger as $$
begin
  -- Ensure resumes is an array
  if not jsonb_typeof(new.resumes) = 'array' then
    raise exception 'resumes must be an array';
  end if;

  -- Validate each resume entry
  for i in 0..jsonb_array_length(new.resumes) - 1 loop
    if not (
      jsonb_typeof(new.resumes->i->'url') = 'string' and
      jsonb_typeof(new.resumes->i->'fileName') = 'string' and
      jsonb_typeof(new.resumes->i->'uploadedAt') = 'string'
    ) then
      raise exception 'each resume must have url, fileName, and uploadedAt fields';
    end if;
  end loop;

  return new;
end;
$$ language plpgsql;

-- Create trigger to validate resumes on insert/update
drop trigger if exists validate_resumes_trigger on public.profiles;
create trigger validate_resumes_trigger
  before insert or update of resumes on public.profiles
  for each row
  execute function validate_resumes();