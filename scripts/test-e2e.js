import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { execSync } from 'child_process';

dotenv.config();

async function testE2E() {
  try {
    console.log(chalk.blue('🧪 Starting end-to-end tests...'));

    // 1. Test Database Connection
    console.log(chalk.blue('\nTesting database connection...'));
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    );

    const { error: dbError } = await supabase
      .from('profiles')
      .select('count');
    
    if (dbError) throw dbError;

    // 2. Test Storage
    console.log(chalk.blue('\nTesting storage...'));
    const { error: storageError } = await supabase.storage.getBucket('resumes');
    if (storageError) throw storageError;

    // 3. Test Edge Functions
    console.log(chalk.blue('\nTesting Edge Functions...'));
    const functions = ['parse-resume', 'generate-cover-letter', 'calculate-job-match'];
    for (const func of functions) {
      const { error: funcError } = await supabase.functions.invoke(func, {
        body: { test: true }
      });
      if (funcError && !funcError.message.includes('test')) throw funcError;
    }

    // 4. Test Email Configuration
    console.log(chalk.blue('\nTesting email configuration...'));
    const { error: emailError } = await supabase.rpc('verify_smtp_config');
    if (emailError) throw emailError;

    // 5. Run Unit Tests
    console.log(chalk.blue('\nRunning unit tests...'));
    execSync('npm run test', { stdio: 'inherit' });

    // 6. Build Application
    console.log(chalk.blue('\nTesting build...'));
    execSync('npm run build', { stdio: 'inherit' });

    console.log(chalk.green('\n✅ All tests passed!'));
    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Tests failed:'), error.message);
    return false;
  }
}

testE2E().catch(console.error);