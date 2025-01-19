import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('SetupSupabase');

export async function setupSupabase() {
  try {
    toast.loading('Connecting to Supabase...', { duration: 2000 });

    // Open Supabase dashboard in new tab
    window.open('https://supabase.com/dashboard', '_blank');

    // Wait for user to enter credentials
    const credentials = await new Promise((resolve) => {
      // Show modal or form to collect credentials
      // For now, we'll use localStorage directly
      const checkCredentials = setInterval(() => {
        const url = localStorage.getItem('VITE_SUPABASE_URL');
        const key = localStorage.getItem('VITE_SUPABASE_ANON_KEY');
        if (url && key) {
          clearInterval(checkCredentials);
          resolve({ url, key });
        }
      }, 1000);
    });

    // Initialize client
    const supabase = createClient(credentials.url, credentials.key);

    // Test connection
    const { error } = await supabase.from('profiles').select('count');
    if (error) throw error;

    // Store configured flag
    localStorage.setItem('secretsConfigured', 'true');

    toast.success('Successfully connected to Supabase!');
    return true;
  } catch (error) {
    log.error('Supabase setup failed:', error);
    toast.error('Failed to connect to Supabase');
    throw error;
  }
}