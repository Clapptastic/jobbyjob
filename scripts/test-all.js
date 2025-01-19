import chalk from 'chalk';
import { execSync } from 'child_process';

async function runAllTests() {
  try {
    console.log(chalk.blue('🧪 Running all tests...'));

    // 1. Test Supabase connection
    console.log(chalk.blue('\nTesting Supabase connection...'));
    await import('./test-connection.js');

    // 2. Verify components
    console.log(chalk.blue('\nVerifying components...'));
    await import('./verify-components.js');

    // 3. Test database
    console.log(chalk.blue('\nTesting database...'));
    await import('./verify-db.js');

    // 4. Test storage
    console.log(chalk.blue('\nTesting storage...'));
    await import('./verify-storage.js');

    // 5. Run unit tests
    console.log(chalk.blue('\nRunning unit tests...'));
    execSync('npm run test', { stdio: 'inherit' });

    console.log(chalk.green('\n✅ All tests passed successfully!'));
    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Tests failed:'), error);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Run npm run fix:setup to reset configuration');
    console.log('2. Check individual test outputs');
    console.log('3. Verify Supabase project status');
    return false;
  }
}

runAllTests().catch(console.error);