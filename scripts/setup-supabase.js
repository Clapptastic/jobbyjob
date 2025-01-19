import { execSync } from 'child_process';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

async function setupSupabase() {
  try {
    console.log(chalk.blue('🚀 Starting Supabase setup...'));

    // Check for existing credentials
    if (existsSync('.env')) {
      const envContent = readFileSync('.env', 'utf8');
      const hasCredentials = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
        'VITE_SUPABASE_SERVICE_ROLE_KEY'
      ].every(key => envContent.includes(key));

      if (hasCredentials) {
        console.log(chalk.green('✓ Found existing Supabase credentials'));
        
        // Verify credentials work
        try {
          execSync('supabase db reset', { stdio: 'inherit' });
          console.log(chalk.green('✓ Database reset successful'));
          return true;
        } catch (error) {
          console.log(chalk.yellow('⚠️  Existing credentials invalid, creating new project...'));
        }
      }
    }

    // Install Supabase CLI if not installed
    try {
      execSync('supabase --version', { stdio: 'ignore' });
      console.log(chalk.green('✓ Supabase CLI already installed'));
    } catch {
      console.log(chalk.yellow('Installing Supabase CLI...'));
      execSync('npm install -g supabase', { stdio: 'inherit' });
    }

    // Login to Supabase
    console.log(chalk.blue('\n🔑 Please login to Supabase...'));
    execSync('supabase login', { stdio: 'inherit' });

    // Initialize Supabase project
    console.log(chalk.blue('\n📦 Initializing Supabase project...'));
    if (!existsSync('supabase/config.toml')) {
      execSync('supabase init', { stdio: 'inherit' });
    }

    // Create new project if needed
    console.log(chalk.blue('\n🌟 Creating Supabase project...'));
    const projectName = 'clappcode-' + Math.random().toString(36).substring(7);
    const { stdout: projectOutput } = execSync(`supabase projects create ${projectName}`, { encoding: 'utf8' });
    const projectId = projectOutput.match(/Project ID: ([a-z0-9-]+)/)?.[1];

    if (!projectId) {
      throw new Error('Failed to create Supabase project');
    }

    // Get project credentials
    console.log(chalk.blue('\n🔑 Getting project credentials...'));
    const { stdout: credentialsOutput } = execSync(`supabase projects api-keys --project-ref ${projectId}`, { encoding: 'utf8' });
    
    const anon_key = credentialsOutput.match(/anon key: ([a-zA-Z0-9._-]+)/)?.[1];
    const service_role_key = credentialsOutput.match(/service_role key: ([a-zA-Z0-9._-]+)/)?.[1];
    const project_url = `https://${projectId}.supabase.co`;

    if (!anon_key || !service_role_key) {
      throw new Error('Failed to get project credentials');
    }

    // Save credentials to .env
    console.log(chalk.blue('\n💾 Saving credentials to .env...'));
    const envContent = `VITE_SUPABASE_URL=${project_url}
VITE_SUPABASE_ANON_KEY=${anon_key}
VITE_SUPABASE_SERVICE_ROLE_KEY=${service_role_key}`;

    writeFileSync('.env', envContent);

    // Link project
    console.log(chalk.blue('\n🔗 Linking project...'));
    execSync(`supabase link --project-ref ${projectId}`, { stdio: 'inherit' });

    // Push database changes
    console.log(chalk.blue('\n📤 Pushing database changes...'));
    execSync('supabase db reset', { stdio: 'inherit' });

    // Deploy Edge Functions
    console.log(chalk.blue('\n⚡ Deploying Edge Functions...'));
    execSync('supabase functions deploy', { stdio: 'inherit' });

    console.log(chalk.green('\n✅ Supabase setup complete!'));
    console.log(chalk.blue('\nProject Details:'));
    console.log(`URL: ${project_url}`);
    console.log('Credentials saved to .env file');

    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Setup failed:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Ensure you have admin access to your Supabase organization');
    console.log('2. Check if the project name is unique');
    console.log('3. Verify your authentication token is valid');
    return false;
  }
}

setupSupabase().catch(console.error);