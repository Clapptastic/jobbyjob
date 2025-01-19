import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

async function fixStorage() {
  try {
    console.log(chalk.blue('🔧 Fixing storage configuration...'));

    const { VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY);

    // Drop and recreate storage schema
    const setupSQL = `
      -- Drop existing schema
      drop schema if exists storage cascade;
      
      -- Create schema
      create schema storage;

      -- Create buckets table
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

      -- Create objects table
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
    `;

    // Execute schema setup
    const { error: setupError } = await supabase.rpc('exec_sql', { sql: setupSQL });
    if (setupError) throw setupError;

    // Create storage buckets
    const { error: bucketsError } = await supabase
      .from('storage.buckets')
      .upsert([
        {
          id: 'resumes',
          name: 'resumes',
          public: false,
          file_size_limit: 5242880,
          allowed_mime_types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        },
        {
          id: 'avatars',
          name: 'avatars',
          public: true,
          file_size_limit: 2097152,
          allowed_mime_types: ['image/jpeg', 'image/png', 'image/gif']
        }
      ]);

    if (bucketsError) throw bucketsError;

    // Create storage policies
    const policiesSQL = `
      -- Create bucket policies
      create policy "Allow public bucket access"
          on storage.buckets for select
          using (public = true);

      create policy "Allow authenticated bucket access"
          on storage.buckets for select
          using (auth.role() = 'authenticated');

      -- Create object policies
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
    `;

    // Execute policies setup
    const { error: policiesError } = await supabase.rpc('exec_sql', { sql: policiesSQL });
    if (policiesError) throw policiesError;

    console.log(chalk.green('✅ Storage configuration fixed successfully!'));
    return true;

  } catch (error) {
    console.error(chalk.red('\n❌ Failed to fix storage:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Verify your service role key has admin access');
    console.log('2. Check if storage service is enabled in your project');
    console.log('3. Try running the setup from the Supabase dashboard');
    return false;
  }
}

fixStorage().catch(console.error);