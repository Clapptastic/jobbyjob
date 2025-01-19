import { execSync } from 'child_process';
import { mkdirSync, copyFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

async function exportApplication() {
  try {
    console.log(chalk.blue('📦 Exporting application...'));

    // Create export directory
    const exportDir = 'clappcode-export';
    mkdirSync(exportDir, { recursive: true });

    // Copy necessary files
    const filesToCopy = [
      'package.json',
      'docker-compose.prod.yml',
      'Dockerfile.prod',
      'nginx/nginx.conf',
      '.env.example',
      'README.md'
    ];

    filesToCopy.forEach(file => {
      copyFileSync(file, join(exportDir, file));
    });

    // Create deployment instructions
    const instructions = `# ClappCode Deployment Instructions

1. Copy .env.example to .env and fill in your credentials
2. Run: docker-compose -f docker-compose.prod.yml up -d
3. Access the application at http://localhost

For detailed setup instructions, see README.md`;

    writeFileSync(join(exportDir, 'DEPLOY.md'), instructions);

    // Create archive
    execSync(`tar -czf clappcode.tar.gz ${exportDir}`);
    execSync(`rm -rf ${exportDir}`);

    console.log(chalk.green('\n✅ Export complete!'));
    console.log(chalk.blue('\nExported files:'));
    console.log('- clappcode.tar.gz');

    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Export failed:'), error.message);
    return false;
  }
}

exportApplication().catch(console.error);