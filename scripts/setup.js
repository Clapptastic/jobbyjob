import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

async function setup() {
  try {
    console.log(chalk.blue('🚀 Setting up project...'));

    // Reset database
    console.log(chalk.blue('\n📦 Resetting database...'));
    await import('./db-reset.js');

    // Verify schema
    console.log(chalk.blue('\n🔍 Verifying schema...'));
    await import('./verify-schema.js');

    // Setup storage
    console.log(chalk.blue('\n📦 Setting up storage...'));
    await import('./storage-setup.js');

    // Verify storage
    console.log(chalk.blue('\n🔍 Verifying storage...'));
    await import('./verify-storage.js');

    console.log(chalk.green('\n✅ Setup complete!'));
    console.log(chalk.blue('\nNext steps:'));
    console.log('1. Start the development server: npm run dev');
    console.log('2. Configure your credentials in SecretsManager');
    console.log('3. Begin development!');

    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Setup failed:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Check your Supabase credentials');
    console.log('2. Verify your service role key has admin access');
    console.log('3. Ensure all required extensions are enabled');
    return false;
  }
}

setup().catch(console.error);