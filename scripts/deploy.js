// @ts-check
import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import chalk from 'chalk';
import { createInterface } from 'readline';
import dotenv from 'dotenv';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function installCLIs() {
  console.log(chalk.blue('\n📦 Installing required CLIs...'));

  // Install Supabase CLI
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    console.log(chalk.green('✓ Supabase CLI already installed'));
  } catch {
    console.log(chalk.yellow('Installing Supabase CLI...'));
    execSync('npm install -g supabase', { stdio: 'inherit' });
  }

  // Install GitHub CLI
  try {
    execSync('gh --version', { stdio: 'ignore' });
    console.log(chalk.green('✓ GitHub CLI already installed'));
  } catch {
    console.log(chalk.yellow('Installing GitHub CLI...'));
    if (process.platform === 'darwin') {
      execSync('brew install gh', { stdio: 'inherit' });
    } else if (process.platform === 'linux') {
      execSync('curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null && sudo apt update && sudo apt install gh -y', { stdio: 'inherit' });
    } else {
      console.log(chalk.red('❌ Unsupported platform for GitHub CLI installation'));
      process.exit(1);
    }
  }
}

async function deploy() {
  try {
    const environment = process.argv[2];
    if (environment !== 'stage' && environment !== 'prod') {
      throw new Error('Usage: npm run deploy:[stage|prod]');
    }

    // Install required CLIs
    await installCLIs();

    // Load environment variables
    dotenv.config();

    // Verify Supabase login
    try {
      execSync('supabase projects list', { stdio: 'ignore' });
    } catch {
      console.log(chalk.yellow('\n🔑 Please login to Supabase...'));
      execSync('supabase login', { stdio: 'inherit' });
    }

    // Verify GitHub login
    try {
      execSync('gh auth status', { stdio: 'ignore' });
    } catch {
      console.log(chalk.yellow('\n🔑 Please login to GitHub...'));
      execSync('gh auth login', { stdio: 'inherit' });
    }

    // Initialize Supabase project if needed
    if (!existsSync('supabase/config.toml')) {
      console.log(chalk.blue('\n🚀 Initializing Supabase project...'));
      execSync('supabase init', { stdio: 'inherit' });
    }

    // Deploy database changes
    console.log(chalk.blue('\n💾 Deploying database changes...'));
    execSync('supabase db push', { stdio: 'inherit' });

    // Deploy Edge Functions
    console.log(chalk.blue('\n⚡ Deploying Edge Functions...'));
    execSync('node scripts/deploy-functions.js', { stdio: 'inherit' });

    // Build application
    console.log(chalk.blue('\n📦 Building application...'));
    execSync('npm run build', { stdio: 'inherit' });

    // Deploy application
    console.log(chalk.blue('\n🌐 Deploying application...'));
    execSync(`docker-compose -f docker-compose.${environment}.yml up -d --build`, {
      stdio: 'inherit'
    });

    console.log(chalk.green('\n✅ Deployment complete!'));
    console.log(chalk.blue('\nNext steps:'));
    console.log('1. Visit your deployed application');
    console.log('2. Verify all features are working');
    console.log('3. Monitor logs for any issues');

  } catch (error) {
    console.error(chalk.red('\n❌ Deployment failed:'), error.message);
    console.log(chalk.yellow('\nTroubleshooting steps:'));
    console.log('1. Check CLI installations');
    console.log('2. Verify credentials');
    console.log('3. Check environment variables');
    process.exit(1);
  } finally {
    rl.close();
  }
}

deploy().catch(console.error);