import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

async function setupStorage() {
  try {
    console.log(chalk.blue('📦 Setting up storage...'));

    const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = process.env;

    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase credentials in .env');
    }

    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

    // Create resumes bucket
    console.log(chalk.blue('\nCreating resumes bucket...'));
    const { error: resumesError } = await supabase.storage.createBucket('resumes', {
      public: false,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    });

    if (resumesError && !resumesError.message.includes('already exists')) {
      throw resumesError;
    }

    // Create avatars bucket
    console.log(chalk.blue('Creating avatars bucket...'));
    const { error: avatarsError } = await supabase.storage.createBucket('avatars', {
      public: true,
      fileSizeLimit: 2097152, // 2MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
    });

    if (avatarsError && !avatarsError.message.includes('already exists')) {
      throw avatarsError;
    }

    // Verify buckets were created
    console.log(chalk.blue('\nVerifying storage setup...'));
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) throw listError;

    const requiredBuckets = ['resumes', 'avatars'];
    const missingBuckets = requiredBuckets.filter(
      bucket => !buckets?.some(b => b.name === bucket)
    );

    if (missingBuckets.length > 0) {
      throw new Error(`Failed to create buckets: ${missingBuckets.join(', ')}`);
    }

    console.log(chalk.green('\n✅ Storage setup complete!'));
    console.log(chalk.blue('\nCreated buckets:'));
    console.log('- resumes (private, 5MB limit)');
    console.log('- avatars (public, 2MB limit)');

    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Storage setup failed:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Check your Supabase credentials in .env');
    console.log('2. Verify storage service is enabled in your project');
    console.log('3. Check if you have admin access to the project');
    console.log('4. Try running setup from the Supabase dashboard');
    return false;
  }
}

setupStorage().catch(console.error);