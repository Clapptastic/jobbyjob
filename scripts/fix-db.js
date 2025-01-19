import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function fixDatabase() {
  try {
    console.log(chalk.blue('🔧 Fixing database issues...'));

    const { VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY);

    // Fix cron extension and jobs
    const cronSql = readFileSync(join(__dirname, '..', 'supabase/migrations/040_fix_cron.sql'), 'utf8');
    const { error: cronError } = await supabase.rpc('exec_sql', { sql: cronSql });
    if (cronError) throw cronError;

    // Fix vault extension
    const vaultSql = readFileSync(join(__dirname, '..', 'supabase/migrations/041_fix_vault.sql'), 'utf8');
    const { error: vaultError } = await supabase.rpc('exec_sql', { sql: vaultSql });
    if (vaultError) throw vaultError;

    // Verify fixes
    const { error: verifyError } = await supabase
      .from('cron.job')
      .select('count')
      .single();

    if (verifyError && !verifyError.message.includes('permission denied')) {
      throw verifyError;
    }

    console.log(chalk.green('✅ Database fixes applied successfully!'));
    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Database fixes failed:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Check your Supabase credentials');
    console.log('2. Verify you have admin access to the project');
    console.log('3. Ensure all required extensions are available');
    return false;
  }
}

fixDatabase().catch(console.error);