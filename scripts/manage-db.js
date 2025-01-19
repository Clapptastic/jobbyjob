import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const log = console.log;

async function manageDatabase() {
  try {
    log(chalk.blue('🔄 Database Management Script'));

    // Get credentials
    const { VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials. Please check your .env file.');
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY);

    log(chalk.blue('\n1. Dropping existing schemas...'));
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `
        drop schema if exists public cascade;
        drop schema if exists storage cascade;
        create schema public;
        create schema storage;
        grant all on schema public to postgres;
        grant all on schema public to public;
      `
    });

    if (dropError) throw dropError;

    log(chalk.green('✓ Schemas reset successfully'));

    // Read and execute setup SQL
    log(chalk.blue('\n2. Applying database setup...'));
    const setupSql = readFileSync(join(__dirname, '..', 'supabase/setup.sql'), 'utf8');
    
    const { error: setupError } = await supabase.rpc('exec_sql', {
      sql: setupSql
    });

    if (setupError) throw setupError;

    log(chalk.green('✓ Database setup applied successfully'));

    // Initialize storage
    log(chalk.blue('\n3. Setting up storage...'));
    const { error: storageError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create storage buckets
        insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        values 
          ('resumes', 'resumes', false, 5242880, array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
          ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/gif'])
        on conflict (id) do update set
          public = excluded.public,
          file_size_limit = excluded.file_size_limit,
          allowed_mime_types = excluded.allowed_mime_types;
      `
    });

    if (storageError) throw storageError;

    log(chalk.green('✓ Storage setup complete'));

    // Verify setup
    log(chalk.blue('\n4. Verifying setup...'));

    // Check tables
    const { data: tables, error: tablesError } = await supabase
      .from('profiles')
      .select('count');

    if (tablesError && !tablesError.message.includes('permission denied')) {
      throw new Error('Failed to verify tables');
    }

    // Check storage
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) throw bucketsError;

    const requiredBuckets = ['resumes', 'avatars'];
    const missingBuckets = requiredBuckets.filter(
      bucket => !buckets?.some(b => b.name === bucket)
    );

    if (missingBuckets.length > 0) {
      throw new Error(`Missing storage buckets: ${missingBuckets.join(', ')}`);
    }

    log(chalk.green('✓ Setup verification complete'));

    log(chalk.green('\n✅ Database management completed successfully!'));
    log(chalk.blue('\nNext steps:'));
    log('1. Start the development server: npm run dev');
    log('2. Verify the application loads correctly');
    log('3. Test core functionality');

    return true;
  } catch (error) {
    log(chalk.red('\n❌ Database management failed:'), error);
    log(chalk.yellow('\nTroubleshooting steps:'));
    log('1. Check your Supabase credentials in .env');
    log('2. Verify you have admin access to the project');
    log('3. Check the Supabase dashboard for project status');
    return false;
  }
}

manageDatabase().catch(console.error);