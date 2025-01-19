import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import { execSync } from 'child_process';

// Load environment variables
dotenv.config();

async function testApplication() {
  try {
    console.log(chalk.blue('🧪 Running comprehensive application tests...'));

    // 1. Verify environment variables
    console.log(chalk.blue('\nChecking environment variables...'));
    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // 2. Initialize Supabase client
    console.log(chalk.blue('\nVerifying database connection...'));
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    // 3. Check database connection and schema
    const { error: dbError } = await supabase.from('profiles').select('count');
    if (dbError) throw dbError;

    // 4. Verify storage setup
    console.log(chalk.blue('\nVerifying storage configuration...'));
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    if (storageError) throw storageError;

    const requiredBuckets = ['resumes', 'avatars'];
    const missingBuckets = requiredBuckets.filter(
      bucket => !buckets?.some(b => b.name === bucket)
    );

    if (missingBuckets.length > 0) {
      throw new Error(`Missing required storage buckets: ${missingBuckets.join(', ')}`);
    }

    // 5. Run unit tests
    console.log(chalk.blue('\nRunning unit tests...'));
    execSync('npm run test:unit', { stdio: 'inherit' });

    // 6. Run integration tests
    console.log(chalk.blue('\nRunning integration tests...'));
    execSync('npm run test:integration', { stdio: 'inherit' });

    // 7. Run E2E tests
    console.log(chalk.blue('\nRunning E2E tests...'));
    execSync('npm run test:e2e', { stdio: 'inherit' });

    console.log(chalk.green('\n✅ All tests passed successfully!'));
    console.log(chalk.blue('\nVerified:'));
    console.log('- Environment variables');
    console.log('- Database connection and schema');
    console.log('- Storage configuration');
    console.log('- Unit tests');
    console.log('- Integration tests');
    console.log('- E2E tests');

    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Tests failed:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Check environment variables in .env file');
    console.log('2. Verify Supabase project status and credentials');
    console.log('3. Run database migrations if needed');
    console.log('4. Check test failures and fix issues');
    return false;
  }
}

testApplication().catch(console.error);