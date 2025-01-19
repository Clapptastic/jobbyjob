import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

async function resetDatabase() {
  try {
    console.log(chalk.blue('🔄 Resetting database and clearing cache...'));

    const { VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY);

    // Drop and recreate schemas
    console.log(chalk.blue('\nResetting schemas...'));
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: `
        drop schema if exists public cascade;
        drop schema if exists storage cascade;
        create schema public;
        create schema storage;
        grant all on schema public to postgres;
        grant all on schema public to public;
      `
    });

    if (schemaError) throw schemaError;

    // Run complete setup SQL
    console.log(chalk.blue('\nApplying database setup...'));
    const { error: setupError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable required extensions
        create extension if not exists "uuid-ossp";
        create extension if not exists "pgcrypto";
        create extension if not exists "pg_net";

        -- Create schemas
        create schema if not exists auth;
        create schema if not exists storage;
        create schema if not exists edge;

        -- Grant schema permissions
        grant usage on schema storage to authenticated, anon;
        grant all on schema storage to service_role;
        grant all on schema storage to postgres;
      `
    });

    if (setupError) throw setupError;

    // Clear application cache
    console.log(chalk.blue('\nClearing application cache...'));
    const { error: cacheError } = await supabase.rpc('clear_cache');
    if (cacheError) throw cacheError;

    // Clear local storage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    // Verify setup
    console.log(chalk.blue('\nVerifying setup...'));
    const { error: verifyError } = await supabase
      .from('storage.buckets')
      .select('count');

    if (verifyError && !verifyError.message.includes('relation "storage.buckets" does not exist')) {
      throw verifyError;
    }

    console.log(chalk.green('\n✅ Database reset and cache clear complete!'));
    return true;

  } catch (error: any) {
    console.error(chalk.red('\n❌ Reset failed:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Check your Supabase credentials');
    console.log('2. Verify your service role key has admin access');
    console.log('3. Try running migrations manually in the Supabase dashboard');
    return false;
  }
}

resetDatabase().catch(console.error);