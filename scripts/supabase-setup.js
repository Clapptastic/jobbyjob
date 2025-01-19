import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import chalk from 'chalk';

dotenv.config();

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = process.env;

async function setupSupabase() {
  try {
    console.log(chalk.blue('🔍 Verifying Supabase configuration...'));

    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

    // Test connection
    const { error: connectionError } = await supabase.from('profiles').select('count');
    if (connectionError) {
      throw connectionError;
    }

    // Check required extensions
    console.log(chalk.blue('📦 Checking database extensions...'));
    const { error: extensionsError } = await supabase.rpc('check_extensions', {
      required_extensions: ['uuid-ossp', 'pgcrypto', 'pg_net']
    });

    if (extensionsError) {
      console.log(chalk.yellow('⚠️  Missing required extensions. Installing...'));
      await supabase.rpc('install_extensions');
    }

    // Apply migrations
    console.log(chalk.blue('💾 Applying database migrations...'));
    execSync('supabase db reset', { stdio: 'inherit' });

    // Setup storage
    console.log(chalk.blue('📦 Setting up storage...'));
    const { error: storageError } = await supabase.storage.getBucket('resumes');
    
    if (storageError?.message.includes('Bucket not found')) {
      console.log(chalk.yellow('⚠️  Creating required storage buckets...'));
      await setupStorageBuckets(supabase);
    }

    console.log(chalk.green('✅ Supabase setup complete!'));
    return true;

  } catch (error) {
    console.error(chalk.red('❌ Supabase setup failed:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    
    if (error.message.includes('connect')) {
      console.log('1. Check your Supabase URL and API key');
      console.log('2. Ensure your project is running');
      console.log('3. Visit https://supabase.com/dashboard to verify project status');
    } else if (error.message.includes('permission')) {
      console.log('1. Check your API key permissions');
      console.log('2. Ensure you\'re using the correct key type');
      console.log('3. Visit Project Settings > API to review your keys');
    } else if (error.message.includes('bucket')) {
      console.log('1. Check storage service status');
      console.log('2. Verify storage permissions');
      console.log('3. Visit Storage settings to configure buckets');
    }

    return false;
  }
}

async function setupStorageBuckets(supabase) {
  const buckets = [
    {
      id: 'resumes',
      public: false,
      fileSizeLimit: 5242880,
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    },
    {
      id: 'avatars',
      public: true,
      fileSizeLimit: 2097152,
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif'
      ]
    }
  ];

  for (const bucket of buckets) {
    const { error } = await supabase.storage.createBucket(bucket.id, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: bucket.allowedMimeTypes
    });

    if (error) throw error;
  }
}

setupSupabase().catch(console.error);