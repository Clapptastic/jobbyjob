// @ts-check
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  try {
    console.log(chalk.blue('🔍 Setting up database...'));

    // Verify environment variables
    const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }

    // Initialize database
    const initSql = readFileSync(join(process.cwd(), 'scripts', 'init-db.sql'), 'utf8');
    
    console.log(chalk.blue('\n📦 Initializing database schema...'));
    execSync(`psql "${process.env.VITE_SUPABASE_URL}" -f -`, {
      input: initSql,
      stdio: ['pipe', 'inherit', 'inherit']
    });

    // Verify setup
    console.log(chalk.blue('\n🔍 Verifying setup...'));
    execSync('supabase db verify', { stdio: 'inherit' });

    console.log(chalk.green('\n✅ Database setup complete!'));
    return true;

  } catch (error) {
    console.error(chalk.red('\n❌ Database setup failed:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Check your Supabase credentials');
    console.log('2. Ensure Supabase CLI is installed');
    console.log('3. Verify database permissions');
    return false;
  }
}

setupDatabase().catch(console.error);