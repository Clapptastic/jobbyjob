// @ts-check
import { execSync } from 'child_process';
import chalk from 'chalk';

async function verifyDeployment() {
  try {
    console.log(chalk.blue('🔍 Verifying deployment...'));

    // Check Supabase connection
    console.log(chalk.blue('\nChecking Supabase connection...'));
    execSync('supabase status', { stdio: 'inherit' });

    // Check Edge Functions
    console.log(chalk.blue('\nChecking Edge Functions...'));
    const functions = execSync('supabase functions list', { encoding: 'utf8' });
    const requiredFunctions = [
      'parse-resume',
      'generate-cover-letter',
      'calculate-job-match',
      'optimize-resume',
      'scrape-jobs',
      'process-applications'
    ];

    const missingFunctions = requiredFunctions.filter(
      func => !functions.includes(func)
    );

    if (missingFunctions.length > 0) {
      throw new Error(`Missing Edge Functions: ${missingFunctions.join(', ')}`);
    }

    // Check application health
    console.log(chalk.blue('\nChecking application health...'));
    execSync('curl -f http://localhost/health', { stdio: 'ignore' });

    console.log(chalk.green('\n✅ Deployment verification successful!'));
    return true;

  } catch (error) {
    console.error(chalk.red('\n❌ Deployment verification failed:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Check service logs');
    console.log('2. Verify environment variables');
    console.log('3. Check network connectivity');
    return false;
  }
}

verifyDeployment().catch(console.error);