import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

async function fixSetup() {
  try {
    console.log(chalk.blue('🔧 Running setup fixes...'));

    // 1. Clear all cached credentials
    console.log(chalk.blue('\nClearing cached credentials...'));
    localStorage.clear();

    // 2. Clear Supabase cache
    console.log(chalk.blue('\nClearing Supabase cache...'));
    localStorage.removeItem('sb-refresh-token');
    localStorage.removeItem('sb-access-token');
    localStorage.removeItem('supabase.auth.token');

    // 3. Reset configuration state
    console.log(chalk.blue('\nResetting configuration state...'));
    localStorage.removeItem('secretsConfigured');

    console.log(chalk.green('\n✅ Setup fixes complete!'));
    console.log(chalk.blue('\nNext steps:'));
    console.log('1. Refresh the page');
    console.log('2. Re-enter your Supabase credentials');
    console.log('3. Run npm run verify:setup to verify');

    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Setup fixes failed:'), error.message);
    return false;
  }
}

fixSetup().catch(console.error);