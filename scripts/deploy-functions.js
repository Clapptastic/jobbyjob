import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function deployFunctions() {
  try {
    console.log(chalk.blue('⚡ Deploying Edge Functions...'));

    // Load environment variables
    const envPath = join(__dirname, '..', '.env');
    const envContent = readFileSync(envPath, 'utf8');
    const env = Object.fromEntries(
      envContent.split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(line => line.split('='))
    );

    // Initialize Supabase client
    const supabase = createClient(
      env.VITE_SUPABASE_URL,
      env.VITE_SUPABASE_SERVICE_ROLE_KEY
    );

    // Functions to deploy
    const functions = [
      {
        name: 'parse-resume',
        path: join(__dirname, '..', 'supabase', 'functions', 'parse-resume', 'index.ts')
      },
      {
        name: 'calculate-job-match',
        path: join(__dirname, '..', 'supabase', 'functions', 'calculate-job-match', 'index.ts')
      }
    ];

    // Deploy each function
    for (const func of functions) {
      console.log(chalk.blue(`\nDeploying ${func.name}...`));
      
      const code = readFileSync(func.path, 'utf8');

      // Deploy function using REST API
      const response = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/functions/${func.name}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/javascript'
        },
        body: code
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to deploy ${func.name}: ${error.message || 'Unknown error'}`);
      }

      console.log(chalk.green(`✅ ${func.name} deployed successfully`));
    }

    console.log(chalk.green('\n✨ All functions deployed successfully!'));
    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Function deployment failed:'), error);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Check your Supabase credentials in .env');
    console.log('2. Verify function code is valid');
    console.log('3. Check network connectivity');
    return false;
  }
}

deployFunctions().catch(console.error);