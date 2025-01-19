import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const { VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!VITE_SUPABASE_URL || !VITE_SUPABASE_SERVICE_ROLE_KEY) {
  console.error(chalk.red('Missing Supabase credentials'));
  process.exit(1);
}

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY);

async function resetDatabase() {
  try {
    console.log(chalk.blue('🔄 Resetting database...'));

    // Drop and recreate schemas
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

    // Run migrations
    const { error: migrationsError } = await supabase.rpc('exec_sql', {
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

    if (migrationsError) throw migrationsError;

    console.log(chalk.green('✅ Database reset complete!'));
    return true;

  } catch (error) {
    console.error(chalk.red('\n❌ Database reset failed:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Check your Supabase credentials');
    console.log('2. Verify your service role key has admin access');
    console.log('3. Try running migrations manually in the Supabase dashboard');
    return false;
  }
}

resetDatabase().catch(console.error);