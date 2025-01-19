import logger from './logger';

const log = logger('SaveEnv');

export async function saveToEnvFile(credentials: {
  url: string;
  anonKey: string;
  serviceKey?: string;
}) {
  try {
    // Create .env content
    const envContent = `VITE_SUPABASE_URL=${credentials.url}
VITE_SUPABASE_ANON_KEY=${credentials.anonKey}${credentials.serviceKey ? `\nVITE_SUPABASE_SERVICE_ROLE_KEY=${credentials.serviceKey}` : ''}
VITE_DEV_MODE=true
VITE_DOCKER=false`;

    // Make API call to save .env file
    const response = await fetch('/api/save-env', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: envContent })
    });

    if (!response.ok) {
      throw new Error('Failed to save credentials to .env file');
    }

    log.info('Successfully saved credentials to .env file');
    return true;
  } catch (error) {
    log.error('Failed to save credentials to .env:', error);
    throw error;
  }
} 