import { rimraf } from 'rimraf';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const paths = [
  join(__dirname, '..', 'dist'),
  join(__dirname, '..', 'node_modules/.cache'),
  join(__dirname, '..', '.eslintcache')
];

async function clean() {
  try {
    console.log('🧹 Cleaning project...');
    await Promise.all(paths.map(path => rimraf(path)));
    console.log('✨ Project cleaned successfully!');
  } catch (error) {
    console.error('Error cleaning project:', error);
    process.exit(1);
  }
}