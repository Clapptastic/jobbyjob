import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

async function initDatabase() {
  try {
    console.log('🔄 Initializing database connection...');

    const { VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials. Please configure them in SecretsManager first.');
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY);

    // Test connection
    const { error } = await supabase.from('profiles').select('count');
    
    if (error) {
      throw error;
    }

    console.log('✅ Database connection verified!');
    return true;

  } catch (error) {
    console.error('Failed to initialize database:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Ensure you have configured your Supabase credentials in SecretsManager');
    console.log('2. Verify your service role key has the necessary permissions');
    console.log('3. Check that your Supabase project is running');
    return false;
  }
}

initDatabase().catch(console.error);