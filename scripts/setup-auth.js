import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = process.env;

async function setupAuth() {
  try {
    console.log(chalk.blue('🔐 Setting up authentication...'));

    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

    // Check auth setup
    const { data: settings, error: settingsError } = await supabase.rpc('get_auth_settings');
    
    if (settingsError) {
      console.error(chalk.red('\nFailed to check auth settings:'), settingsError);
      console.log(chalk.yellow('\nPlease verify:'));
      console.log('1. Auth service is enabled');
      console.log('2. You have admin access');
      console.log('3. See AUTH.md for manual setup');
      process.exit(1);
    }

    // Initialize auth
    const { error: initError } = await supabase.rpc('initialize_auth');
    if (initError) {
      console.error(chalk.red('\nFailed to initialize auth:'), initError);
      console.log(chalk.yellow('\nPlease check:'));
      console.log('1. Auth service is running');
      console.log('2. You have admin access');
      console.log('3. See AUTH.md for manual setup');
      process.exit(1);
    }

    console.log(chalk.green('✅ Authentication setup complete!'));
    return true;

  } catch (error) {
    console.error(chalk.red('\nAuth setup failed:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Check Supabase dashboard');
    console.log('2. Verify auth settings');
    console.log('3. See AUTH.md for manual setup');
    return false;
  }
}

setupAuth().catch(console.error);