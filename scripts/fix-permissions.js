import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function fixPermissions() {
  try {
    console.log(chalk.blue('🔧 Fixing database permissions...'));

    const { VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY);

    // Read and execute the SQL file
    const sqlPath = join(__dirname, '..', 'supabase/migrations/036_fix_permissions.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    const { error: sqlError } = await supabase.rpc('exec_sql', { sql });
    
    if (sqlError) {
      throw sqlError;
    }

    // Verify the setup
    const { data: verifyData, error: verifyError } = await supabase.rpc('verify_and_fix_schema');
    
    if (verifyError) {
      throw verifyError;
    }

    if (!verifyData?.valid) {
      throw new Error('Schema verification failed after fixes were applied');
    }

    console.log(chalk.green('\n✅ Database permissions fixed successfully!'));
    console.log(chalk.blue('\nVerified:'));
    console.log('- Required functions created');
    console.log('- Permissions granted');
    console.log('- Storage buckets configured');
    console.log('- Schema validated');

    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Failed to fix permissions:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Verify your Supabase service role key has admin access');
    console.log('2. Check if the required extensions are enabled');
    console.log('3. Ensure all schemas exist in your project');
    return false;
  }
}

fixPermissions().catch(console.error);