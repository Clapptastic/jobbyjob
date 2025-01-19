import { execSync } from 'child_process';
import chalk from 'chalk';

async function verifyComponents() {
  try {
    console.log(chalk.blue('🔍 Verifying component dependencies...'));

    // Check for circular dependencies
    execSync('npx madge --circular src/components/', { stdio: 'inherit' });

    // Verify imports
    execSync('npx tsc --noEmit', { stdio: 'inherit' });

    // Check component files
    const components = [
      'ApiKeyManager',
      'JobPreferences',
      'ResumeManager',
      'ApplicationStatus'
    ];

    for (const component of components) {
      console.log(chalk.blue(`\nChecking ${component}...`));
      execSync(`npx tsc src/components/${component}.tsx --noEmit`, { stdio: 'inherit' });
    }

    console.log(chalk.green('\n✅ Component verification successful!'));
    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Component verification failed:'), error);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Check for circular dependencies');
    console.log('2. Verify import paths');
    console.log('3. Run TypeScript compiler');
    return false;
  }
}

verifyComponents().catch(console.error);