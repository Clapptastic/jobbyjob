import { execSync } from 'child_process';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function initializeSupabase() {
  try {
    console.log(chalk.blue('🚀 Initializing Supabase...'));

    // Initialize Supabase project using local installation
    console.log(chalk.blue('\n📦 Initializing Supabase project...'));
    execSync('npm run supabase init', { stdio: 'inherit' });

    // Link to existing project if credentials exist
    if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
      console.log(chalk.blue('\n🔗 Linking to Supabase project...'));
      const projectRef = new URL(process.env.VITE_SUPABASE_URL).hostname.split('.')[0];
      execSync(`npm run supabase link --project-ref ${projectRef} --password ${process.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`, {
        stdio: 'inherit'
      });

      // Push database changes
      console.log(chalk.blue('\n💾 Pushing database changes...'));
      execSync('npm run supabase db push', { stdio: 'inherit' });

      // Deploy Edge Functions
      console.log(chalk.blue('\n⚡ Deploying Edge Functions...'));
      execSync('npm run supabase functions deploy', { stdio: 'inherit' });

      // Set secrets
      if (process.env.VITE_OPENAI_API_KEY) {
        console.log(chalk.blue('\n🔐 Setting secrets...'));
        execSync(`npm run supabase secrets set OPENAI_API_KEY=${process.env.VITE_OPENAI_API_KEY}`, {
          stdio: 'inherit'
        });
      }
    }

    console.log(chalk.green('\n✅ Supabase initialization complete!'));
    return true;

  } catch (error) {
    console.error(chalk.red('\n❌ Supabase initialization failed:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Ensure you have admin access to the Supabase project');
    console.log('2. Verify your credentials in .env file');
    console.log('3. Check network connectivity');
    return false;
  }
}

initializeSupabase().catch(console.error);