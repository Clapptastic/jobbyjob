import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

async function verifySetup() {
  try {
    console.log(chalk.blue('🔍 Running setup verification...'));

    // 1. Check Environment Variables
    console.log(chalk.blue('\nChecking environment variables...'));
    const supabaseUrl = localStorage.getItem('VITE_SUPABASE_URL');
    const supabaseAnonKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase credentials. Please run through the setup process again.');
    }

    // 2. Verify URL format
    try {
      const url = new URL(supabaseUrl);
      if (!url.hostname.includes('.supabase.co')) {
        throw new Error('Invalid Supabase URL format');
      }
    } catch {
      throw new Error('Invalid URL format');
    }

    // 3. Verify key format
    if (!supabaseAnonKey.startsWith('eyJ')) {
      throw new Error('Invalid anon key format');
    }

    // 4. Test connection
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (connectionError) throw connectionError;

    console.log(chalk.green('\n✅ Setup verification successful!'));
    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Setup verification failed:'), error.message);
    return false;
  }
}

verifySetup().catch(console.error);