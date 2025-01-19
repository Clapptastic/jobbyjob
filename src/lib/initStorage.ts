import { supabase } from './supabase';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('Storage');

export async function initializeStorage() {
  try {
    // Skip if in initial setup
    const secretsConfigured = localStorage.getItem('secretsConfigured') === 'true';
    
    if (!secretsConfigured || !supabase) {
      return false;
    }

    // Create admin client for initialization
    const adminClient = supabase.createAdminClient();

    // First run the storage permissions fix
    const { error: permissionsError } = await adminClient.rpc('exec_sql', {
      sql: `
        -- Start transaction
        begin;

        -- First, ensure we're using the postgres role
        set role postgres;

        -- Drop and recreate storage schema with proper permissions
        drop schema if exists storage cascade;
        create schema storage authorization postgres;

        -- Grant usage to service role and other roles
        grant usage on schema storage to postgres, service_role, authenticated, anon;
        grant create on schema storage to service_role;
        grant all privileges on schema storage to postgres;
        grant all privileges on schema storage to service_role;

        -- Reset role
        reset role;

        commit;
      `
    });

    if (permissionsError) {
      throw permissionsError;
    }

    // Now initialize storage schema and tables
    const { error: schemaError } = await adminClient.rpc('exec_sql', {
      sql: `
        -- Create storage buckets table
        create table storage.buckets (
          id text primary key,
          name text not null unique,
          owner uuid references auth.users,
          created_at timestamptz default now(),
          updated_at timestamptz default now(),
          public boolean default false,
          avif_autodetection boolean default false,
          file_size_limit bigint,
          allowed_mime_types text[]
        );

        -- Create storage objects table
        create table storage.objects (
          id uuid default uuid_generate_v4() primary key,
          bucket_id text references storage.buckets on delete cascade,
          name text not null,
          owner uuid references auth.users on delete cascade,
          created_at timestamptz default now(),
          updated_at timestamptz default now(),
          last_accessed_at timestamptz default now(),
          metadata jsonb default '{}'::jsonb,
          version text default '1',
          size bigint,
          mime_type text,
          path_tokens text[] generated always as (string_to_array(name, '/')) stored
        );

        -- Create indexes
        create index if not exists objects_path_tokens_idx on storage.objects using gin (path_tokens);
        create index if not exists objects_owner_idx on storage.objects (owner);
        create index if not exists objects_bucket_id_idx on storage.objects (bucket_id);

        -- Enable RLS
        alter table storage.buckets enable row level security;
        alter table storage.objects enable row level security;

        -- Create storage buckets
        insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        values 
          ('resumes', 'resumes', false, 5242880, array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
          ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/gif'])
        on conflict (id) do update set
          public = excluded.public,
          file_size_limit = excluded.file_size_limit,
          allowed_mime_types = excluded.allowed_mime_types;

        -- Create storage policies
        create policy "Allow public bucket access"
          on storage.buckets for select
          using (public = true);

        create policy "Allow authenticated bucket access"
          on storage.buckets for select
          using (auth.role() = 'authenticated');

        create policy "Users can upload own resumes"
          on storage.objects for insert
          with check (
            bucket_id = 'resumes'
            and auth.role() = 'authenticated'
            and owner = auth.uid()
          );

        create policy "Users can view own resumes"
          on storage.objects for select
          using (
            bucket_id = 'resumes'
            and owner = auth.uid()
          );

        create policy "Public avatar access"
          on storage.objects for select
          using (bucket_id = 'avatars');

        create policy "Users can upload avatars"
          on storage.objects for insert
          with check (
            bucket_id = 'avatars'
            and auth.role() = 'authenticated'
            and owner = auth.uid()
          );
      `
    });

    if (schemaError) {
      throw schemaError;
    }

    // Verify storage setup
    const { error: verifyError } = await adminClient
      .from('storage.buckets')
      .select('count')
      .single();

    if (verifyError) {
      throw verifyError;
    }

    // Clear service role key after initialization
    localStorage.removeItem('VITE_SUPABASE_SERVICE_ROLE_KEY');

    return true;
  } catch (error: any) {
    log.error('Storage initialization failed:', error);
    toast.error(error.message || 'Failed to initialize storage');
    return false;
  }
}