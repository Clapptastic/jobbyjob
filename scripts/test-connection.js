import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

async function testConnection() {
  try {
    console.log(chalk.blue('🔍 Testing Supabase connection...'));

    // Get credentials
    const url = localStorage.getItem('VITE_SUPABASE_URL');
    const anonKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY');

    if (!url || !anonKey) {
      throw new Error('Missing Supabase credentials');
    }

    // Initialize client
    const supabase = createClient(url, anonKey);

    // Test database connection
    const { error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (dbError) throw dbError;

    // Test storage
    const { error: storageError } = await supabase.storage.listBuckets();
    if (storageError) throw storageError;

    // Test auth
    const { error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;

    console.log(chalk.green('\n✅ Connection test successful!'));
    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Connection test failed:'), error);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Verify your Supabase credentials');
    console.log('2. Check project status in dashboard');
    console.log('3. Run npm run fix:setup to reset configuration');
    return false;
  }
}

testConnection().catch(console.error);