import { existsSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkEnv() {
  try {
    console.log(chalk.blue('📝 Checking environment setup...'));

    const envPath = join(__dirname, '..', '.env');
    const envExamplePath = join(__dirname, '..', '.env.example');

    // Create .env from example if it doesn't exist
    if (!existsSync(envPath) && existsSync(envExamplePath)) {
      writeFileSync(envPath, `# Configure your credentials in SecretsManager
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_SERVICE_ROLE_KEY=
VITE_OPENAI_API_KEY=
VITE_ADMIN_EMAIL=`);
      
      console.log(chalk.green('✅ Created .env file'));
      console.log(chalk.blue('\nNext steps:'));
      console.log('1. Start the development server: npm run dev');
      console.log('2. Configure your credentials in the SecretsManager');
    } else {
      console.log(chalk.green('✅ Environment file exists'));
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Environment setup failed:'), error.message);
    // Don't exit with error - allow installation to complete
  }
}

checkEnv().catch(console.error);