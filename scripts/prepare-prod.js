import { execSync } from 'child_process';
import { mkdirSync, copyFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

async function prepareProd() {
  try {
    console.log(chalk.blue('📦 Preparing production package...'));

    // Create dist directory
    const distDir = join(process.cwd(), 'dist');
    mkdirSync(distDir, { recursive: true });

    // Run tests
    console.log(chalk.blue('\nRunning tests...'));
    execSync('npm run test:all', { stdio: 'inherit' });

    // Build application
    console.log(chalk.blue('\nBuilding application...'));
    execSync('npm run build', { stdio: 'inherit' });

    // Copy production files
    console.log(chalk.blue('\nCopying production files...'));
    const filesToCopy = [
      'package.json',
      'docker-compose.prod.yml',
      'Dockerfile.prod',
      'nginx/nginx.conf',
      '.env.example',
      'README.md',
      'DEPLOYMENT.md'
    ];

    filesToCopy.forEach(file => {
      copyFileSync(file, join(distDir, file));
    });

    // Create production package
    console.log(chalk.blue('\nCreating production package...'));
    execSync('tar -czf clappcode-prod.tar.gz dist/', { stdio: 'inherit' });

    console.log(chalk.green('\n✅ Production package created successfully!'));
    console.log(chalk.blue('\nProduction package contents:'));
    console.log('- Built application');
    console.log('- Docker configuration');
    console.log('- Nginx configuration');
    console.log('- Deployment documentation');

    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Production preparation failed:'), error);
    return false;
  }
}

prepareProd().catch(console.error);