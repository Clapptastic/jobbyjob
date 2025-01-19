// @ts-check
import { execSync } from 'child_process';
import { mkdirSync, copyFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function packageForDeployment() {
  try {
    console.log('📦 Packaging application for deployment...');

    // Create dist directory if it doesn't exist
    const distDir = join(__dirname, '..', 'dist');
    mkdirSync(distDir, { recursive: true });

    // Build the application
    console.log('Building application...');
    execSync('npm run build', { stdio: 'inherit' });

    // Create necessary directories
    const dirs = [
      'supabase',
      'scripts',
      'config'
    ];

    dirs.forEach(dir => {
      mkdirSync(join(distDir, dir), { recursive: true });
    });

    // Copy necessary files
    const filesToCopy = [
      'package.json',
      'README.md',
      'netlify.toml',
      '.env.example'
    ];

    filesToCopy.forEach(file => {
      copyFileSync(join(__dirname, '..', file), join(distDir, file));
    });

    // Copy Supabase migrations
    copyFileSync(
      join(__dirname, '..', 'supabase/migrations/20250111003118_solitary_hall.sql'),
      join(distDir, 'supabase/migrations/20250111003118_solitary_hall.sql')
    );

    // Create deployment config
    const deployConfig = {
      version: '1.0.0',
      environment: {
        NODE_VERSION: '20',
        NPM_VERSION: '10'
      },
      scripts: {
        postinstall: 'npm run db:reset && npm run storage:setup'
      }
    };

    writeFileSync(
      join(distDir, 'config/deploy.json'),
      JSON.stringify(deployConfig, null, 2)
    );

    console.log('✅ Package created successfully in dist/');
    console.log('\nNext steps:');
    console.log('1. Deploy the application: npm run deploy');
    console.log('2. Configure environment variables in deployment platform');
    console.log('3. Run database migrations');

    return true;
  } catch (error) {
    console.error('❌ Packaging failed:', error);
    return false;
  }
}

packageForDeployment().catch(console.error);