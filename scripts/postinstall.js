import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

async function postInstall() {
  try {
    console.log('📦 Running post-installation setup...');

    // Create .env if it doesn't exist
    const envPath = join(process.cwd(), '.env');
    if (!existsSync(envPath)) {
      writeFileSync(envPath, `
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
`);
      console.log('✓ Created .env file');
    }

    console.log('✅ Post-installation complete!');
  } catch (error) {
    console.error('❌ Post-installation failed:', error);
    process.exit(1);
  }
}

postInstall().catch(console.error);