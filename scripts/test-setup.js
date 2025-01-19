import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

async function testSetup() {
  try {
    console.log(chalk.blue('🧪 Running setup tests...'));

    // 1. Test Environment
    console.log(chalk.blue('\nTesting environment...'));
    const supabaseUrl = localStorage.getItem('VITE_SUPABASE_URL');
    const supabaseAnonKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase credentials');
    }

    // 2. Test Database Connection
    console.log(chalk.blue('\nTesting database connection...'));
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (dbError) throw dbError;

    // 3. Test Storage
    console.log(chalk.blue('\nTesting storage...'));
    const { error: storageError } = await supabase.storage.getBucket('resumes');
    if (storageError) throw storageError;

    // 4. Test Auth
    console.log(chalk.blue('\nTesting authentication...'));
    const { error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;

    console.log(chalk.green('\n✅ All setup tests passed!'));
    console.log(chalk.blue('\nVerified:'));
    console.log('- Environment variables');
    console.log('- Database connection');
    console.log('- Storage access');
    console.log('- Authentication');

    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Setup tests failed:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Run npm run fix:setup to reset configuration');
    console.log('2. Check Supabase project status');
    console.log('3. Verify credentials in dashboard');
    return false;
  }
}

testSetup().catch(console.error);