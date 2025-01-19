import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const log = console.log;

async function verifyDatabase() {
  try {
    log(chalk.blue('🔍 Verifying database setup...'));

    const { VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials. Please check your .env file.');
    }

    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY);

    // Check required tables
    log(chalk.blue('\n1. Checking required tables...'));
    const requiredTables = ['profiles', 'jobs', 'applications', 'api_keys'];
    
    for (const table of requiredTables) {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error && !error.message.includes('permission denied')) {
        throw new Error(`Missing required table: ${table}`);
      }
    }

    log(chalk.green('✓ All required tables exist'));

    // Check storage buckets
    log(chalk.blue('\n2. Checking storage buckets...'));
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) throw bucketsError;

    const requiredBuckets = ['resumes', 'avatars'];
    const missingBuckets = requiredBuckets.filter(
      bucket => !buckets?.some(b => b.name === bucket)
    );

    if (missingBuckets.length > 0) {
      throw new Error(`Missing storage buckets: ${missingBuckets.join(', ')}`);
    }

    log(chalk.green('✓ All storage buckets configured'));

    // Check RLS policies
    log(chalk.blue('\n3. Checking RLS policies...'));
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        select tablename, policyname
        from pg_policies
        where schemaname in ('public', 'storage');
      `
    });

    if (policiesError) throw policiesError;
    log(chalk.green('✓ RLS policies verified'));

    log(chalk.green('\n✅ Database verification complete!'));
    return true;
  } catch (error) {
    log(chalk.red('\n❌ Database verification failed:'), error);
    log(chalk.yellow('\nTroubleshooting steps:'));
    log('1. Run npm run db:reset to reset the database');
    log('2. Check the Supabase dashboard for project status');
    log('3. Verify your service role key has admin access');
    return false;
  }
}

verifyDatabase().catch(console.error);