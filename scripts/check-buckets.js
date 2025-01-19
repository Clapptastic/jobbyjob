// @ts-check
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

async function checkBuckets() {
  try {
    console.log(chalk.blue('Checking storage buckets...'));

    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error(chalk.red('\nFailed to list buckets:'), listError);
      process.exit(1);
    }

    const hasResumes = buckets?.some(b => b.name === 'resumes');
    const hasAvatars = buckets?.some(b => b.name === 'avatars');

    // If both buckets exist, we're done
    if (hasResumes && hasAvatars) {
      console.log(chalk.green('✅ Storage buckets verified!'));
      return true;
    }

    // Create missing buckets
    console.log(chalk.yellow('Creating missing buckets...'));

    if (!hasResumes) {
      const { error: resumesError } = await supabase.storage.createBucket('resumes', {
        public: false,
        fileSizeLimit: 5242880,
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
      });

      if (resumesError) {
        console.error(chalk.red('\nFailed to create resumes bucket:'), resumesError);
        process.exit(1);
      }
    }

    if (!hasAvatars) {
      const { error: avatarsError } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 2097152,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
      });

      if (avatarsError) {
        console.error(chalk.red('\nFailed to create avatars bucket:'), avatarsError);
        process.exit(1);
      }
    }

    // Apply storage policies
    console.log(chalk.blue('Applying storage policies...'));
    const { error: policyError } = await supabase.rpc('apply_storage_policies');

    if (policyError) {
      console.error(chalk.red('\nFailed to apply storage policies:'), policyError);
      process.exit(1);
    }

    console.log(chalk.green('✅ Storage setup complete!'));
    return true;

  } catch (error) {
    console.error(chalk.red('\nStorage setup failed:'), error);
    console.log(chalk.yellow('\nPlease check:'));
    console.log('1. Storage service is enabled in Supabase dashboard');
    console.log('2. You have admin access to the project');
    console.log('3. See SUPABASE.md for manual setup steps');
    process.exit(1);
  }
}

checkBuckets().catch(console.error);