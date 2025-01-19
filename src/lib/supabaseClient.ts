import { createClient } from '@supabase/supabase-js';
import createLogger from './logger';

const log = createLogger('SupabaseClient');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

log.info('Getting credentials in Docker mode:', {
  url: supabaseUrl.slice(0, 15) + '...',
  anonKey: 'provided',
  serviceKey: 'provided'
});

log.info('Creating Supabase client with URL:', supabaseUrl);

// Create a single client instance with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'jobbyjob@1.0.0'
    }
  }
});

// Export a health check function that uses a simple query instead of _health
export const checkHealth = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();
    
    return !error;
  } catch (err) {
    log.error('Health check failed:', err);
    return false;
  }
};

log.info('Supabase client created successfully'); 