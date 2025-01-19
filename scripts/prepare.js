// @ts-check
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

function ensureDirectories() {
  const dirs = [
    'scripts',
    'supabase/migrations',
    'supabase/functions'
  ];

  dirs.forEach(dir => {
    const path = join(projectRoot, dir);
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
  });
}

async function prepare() {
  try {
    console.log('🔧 Preparing project...');

    // Ensure required directories exist
    ensureDirectories();

    // Check if node_modules exists and is valid
    const needsInstall = !existsSync(join(projectRoot, 'node_modules')) || 
                        !existsSync(join(projectRoot, 'node_modules/.package-lock.json'));

    if (needsInstall) {
      console.log('📦 Installing dependencies...');
      execSync('npm install --no-package-lock', { stdio: 'inherit' });
      execSync('npm install', { stdio: 'inherit' });
    }

    // Verify critical dependencies
    const criticalDeps = [
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'react',
      'react-dom',
      'react-router-dom',
      'zustand'
    ];

    for (const dep of criticalDeps) {
      try {
        require.resolve(dep);
      } catch (e) {
        console.log(`Missing critical dependency: ${dep}, installing...`);
        execSync(`npm install ${dep}`, { stdio: 'inherit' });
      }
    }

    // Verify dev dependencies
    const criticalDevDeps = [
      'vite',
      'vitest',
      '@testing-library/react',
      '@testing-library/jest-dom',
      'typescript'
    ];

    for (const dep of criticalDevDeps) {
      try {
        require.resolve(dep);
      } catch (e) {
        console.log(`Missing critical dev dependency: ${dep}, installing...`);
        execSync(`npm install -D ${dep}`, { stdio: 'inherit' });
      }
    }

    console.log('✅ Project prepared successfully!');
  } catch (error) {
    console.error('❌ Preparation failed:', error);
    process.exit(1);
  }
}

prepare().catch(console.error);