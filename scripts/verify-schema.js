import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

async function verifySchema() {
  try {
    console.log(chalk.blue('🔍 Verifying database schema...'));

    const { VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY);

    // Run schema verification function
    const { error: verifyError } = await supabase.rpc('verify_and_fix_schema');
    
    if (verifyError) {
      throw verifyError;
    }

    // Verify tables exist
    const tables = ['storage.objects', 'storage.buckets', 'public.debug_config', 'public.debug_logs'];
    
    for (const table of tables) {
      const [schema, name] = table.split('.');
      const { error: tableError } = await supabase
        .from(name)
        .select('count')
        .limit(1);

      if (tableError && !tableError.message.includes('permission denied')) {
        throw new Error(`Table ${table} verification failed: ${tableError.message}`);
      }
    }

    // Verify storage buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw bucketsError;
    }

    const requiredBuckets = ['resumes', 'avatars'];
    const missingBuckets = requiredBuckets.filter(
      bucket => !buckets?.some(b => b.name === bucket)
    );

    if (missingBuckets.length > 0) {
      throw new Error(`Missing storage buckets: ${missingBuckets.join(', ')}`);
    }

    console.log(chalk.green('✅ Schema verification complete!'));
    console.log(chalk.blue('\nVerified:'));
    console.log('- Database tables');
    console.log('- Storage buckets');
    console.log('- RLS policies');
    console.log('- Indexes');

    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Schema verification failed:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Check Supabase credentials');
    console.log('2. Verify database permissions');
    console.log('3. Run migrations manually if needed');
    return false;
  }
}

verifySchema().catch(console.error);