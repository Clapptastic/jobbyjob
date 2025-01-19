import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = process.env;

if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
  console.error(chalk.red('Missing Supabase environment variables'));
  process.exit(1);
}

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function initializeStorage() {
  try {
    console.log(chalk.blue('Initializing storage...'));

    // Call the initialize_storage function
    const { error } = await supabase.rpc('initialize_storage');

    if (error) {
      throw error;
    }

    console.log(chalk.green('✅ Storage initialized successfully!'));
    console.log(chalk.blue('\nStorage buckets created:'));
    console.log('- resumes (private)');
    console.log('- avatars (public)');
    
    console.log(chalk.blue('\nPolicies applied:'));
    console.log('Resumes bucket:');
    console.log('- Authenticated users can upload');
    console.log('- Users can only access their own resumes');
    console.log('\nAvatars bucket:');
    console.log('- Public read access');
    console.log('- Authenticated users can upload');

  } catch (error) {
    console.error(chalk.red('Failed to initialize storage:'), error.message);
    console.log(chalk.yellow('\nPlease check:'));
    console.log('1. Your Supabase project is running');
    console.log('2. You have admin access to the project');
    console.log('3. Storage service is enabled');
    process.exit(1);
  }
}

initializeStorage().catch(console.error);