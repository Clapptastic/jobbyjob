// @ts-check
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

async function verifyApplication() {
  try {
    console.log(chalk.blue('🔍 Starting comprehensive application verification...'));

    // 1. Verify dependencies
    console.log(chalk.blue('\nChecking dependencies...'));
    const criticalDeps = [
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'react',
      'react-dom',
      'react-router-dom',
      'zustand'
    ];

    const missingDeps = criticalDeps.filter(dep => {
      try {
        require.resolve(dep);
        return false;
      } catch {
        return true;
      }
    });

    if (missingDeps.length > 0) {
      throw new Error(`Missing critical dependencies: ${missingDeps.join(', ')}`);
    }

    // 2. Verify node_modules
    if (!existsSync(join(process.cwd(), 'node_modules'))) {
      console.log(chalk.yellow('\nnode_modules not found, installing dependencies...'));
      execSync('npm install', { stdio: 'inherit' });
    }

    // 3. Run TypeScript check
    console.log(chalk.blue('\nChecking TypeScript compilation...'));
    execSync('npx tsc --noEmit', { stdio: 'inherit' });

    // 4. Run ESLint
    console.log(chalk.blue('\nRunning ESLint...'));
    execSync('npx eslint src --ext ts,tsx', { stdio: 'inherit' });

    // 5. Run tests
    console.log(chalk.blue('\nRunning tests...'));
    execSync('npm test', { stdio: 'inherit' });

    // 6. Check build
    console.log(chalk.blue('\nVerifying build...'));
    execSync('npm run build', { stdio: 'inherit' });

    console.log(chalk.green('\n✅ Application verification successful!'));
    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Verification failed:'), error);
    return false;
  }
}

verifyApplication().catch(console.error);