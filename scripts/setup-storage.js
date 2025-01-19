import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function setupStorage() {
  try {
    console.log(chalk.blue('📦 Setting up storage...'));

    const { VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY);

    // Read and execute storage setup SQL
    const setupSQL = readFileSync(join(__dirname, '..', 'supabase/migrations/026_fix_storage_final.sql'), 'utf8');
    
    const { error: setupError } = await supabase.rpc('exec_sql', { sql: setupSQL });
    if (setupError) throw setupError;

    // Initialize storage
    const { error: initError } = await supabase.rpc('initialize_storage');
    if (initError) throw initError;

    // Verify setup
    const { data: verified, error: verifyError } = await supabase.rpc('verify_storage_setup');
    if (verifyError) throw verifyError;
    if (!verified) throw new Error('Storage setup verification failed');

    console.log(chalk.green('✅ Storage setup complete!'));
    console.log(chalk.blue('\nCreated buckets:'));
    console.log('- resumes (private, 5MB limit)');
    console.log('- avatars (public, 2MB limit)');
    
    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Storage setup failed:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Check your Supabase credentials');
    console.log('2. Verify storage service is enabled');
    console.log('3. Ensure you have admin access');
    return false;
  }
}

setupStorage().catch(console.error);