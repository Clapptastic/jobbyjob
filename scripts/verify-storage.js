import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

async function verifyStorage() {
  try {
    console.log(chalk.blue('🔍 Verifying storage setup...'));

    const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = process.env;

    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

    // List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) throw bucketsError;

    // Verify required buckets exist
    const requiredBuckets = ['resumes', 'avatars'];
    const missingBuckets = requiredBuckets.filter(
      bucket => !buckets?.some(b => b.name === bucket)
    );

    if (missingBuckets.length > 0) {
      throw new Error(`Missing required storage buckets: ${missingBuckets.join(', ')}`);
    }

    // Verify bucket configurations
    for (const bucket of buckets) {
      if (bucket.name === 'resumes') {
        if (bucket.public) {
          throw new Error('Resumes bucket should not be public');
        }
        if (!bucket.file_size_limit || bucket.file_size_limit > 5242880) {
          throw new Error('Resumes bucket should have 5MB file size limit');
        }
      }
      if (bucket.name === 'avatars') {
        if (!bucket.public) {
          throw new Error('Avatars bucket should be public');
        }
        if (!bucket.file_size_limit || bucket.file_size_limit > 2097152) {
          throw new Error('Avatars bucket should have 2MB file size limit');
        }
      }
    }

    console.log(chalk.green('✅ Storage verification successful!'));
    console.log(chalk.blue('\nVerified buckets:'));
    console.log('- resumes (private, 5MB limit)');
    console.log('- avatars (public, 2MB limit)');
    
    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Storage verification failed:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Run storage:setup to initialize storage');
    console.log('2. Check Supabase dashboard for storage service status');
    console.log('3. Verify your credentials have admin access');
    return false;
  }
}

verifyStorage().catch(console.error);