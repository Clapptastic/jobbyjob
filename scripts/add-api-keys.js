import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

async function addApiKeysTable() {
  try {
    console.log(chalk.blue('🔑 Adding API keys table...'));

    const { VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY);

    // Create API keys table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create API keys table
        create table if not exists public.api_keys (
            id uuid primary key default uuid_generate_v4(),
            provider text unique not null,
            key_value text not null,
            created_at timestamptz default now(),
            updated_at timestamptz default now()
        );

        -- Enable RLS
        alter table public.api_keys enable row level security;

        -- Create policies
        create policy "Users can view API keys"
            on public.api_keys for select
            using (auth.role() = 'authenticated');

        create policy "Users can insert API keys"
            on public.api_keys for insert
            with check (auth.role() = 'authenticated');

        create policy "Users can update API keys"
            on public.api_keys for update
            using (auth.role() = 'authenticated');

        -- Create index
        create index if not exists idx_api_keys_provider on public.api_keys(provider);
      `
    });

    if (tableError) throw tableError;

    // Verify table was created
    const { error: verifyError } = await supabase
      .from('api_keys')
      .select('count')
      .limit(1);

    if (verifyError && !verifyError.message.includes('permission denied')) {
      throw verifyError;
    }

    console.log(chalk.green('✅ API keys table created successfully!'));
    return true;

  } catch (error) {
    console.error(chalk.red('\n❌ Failed to create API keys table:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Check your Supabase credentials');
    console.log('2. Verify your service role key has admin access');
    console.log('3. Try running the SQL manually in the Supabase dashboard');
    return false;
  }
}

addApiKeysTable().catch(console.error);