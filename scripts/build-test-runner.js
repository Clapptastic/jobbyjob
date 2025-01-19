import { build } from 'esbuild';
import { join } from 'path';

async function buildTestRunner() {
  try {
    await build({
      entryPoints: [join(process.cwd(), 'scripts', 'test-runner.ts')],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'esm',
      outfile: join(process.cwd(), 'dist', 'test-runner.mjs'),
      sourcemap: true,
    });
    console.log('Test runner built successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildTestRunner(); 