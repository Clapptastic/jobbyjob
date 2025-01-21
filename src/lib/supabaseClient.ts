import { createClient } from '@supabase/supabase-js';
import createLogger from './logger';

const log = createLogger('SupabaseClient');

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  log.error('Missing required environment variables');
  throw new Error('Missing Supabase credentials. Please check your environment variables.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
  if (!supabaseUrl.includes('supabase.co')) {
    throw new Error('Invalid Supabase URL format');
  }
} catch (error) {
  log.error('Invalid Supabase URL:', error);
  throw new Error('Invalid Supabase URL format. Please check your configuration.');
}

// Validate anon key format
if (!supabaseAnonKey.startsWith('eyJ')) {
  log.error('Invalid anon key format');
  throw new Error('Invalid Supabase anon key format. Please check your configuration.');
}

log.info('Initializing Supabase client with URL:', supabaseUrl.slice(0, 20) + '...');

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

// Improved health check function that verifies both auth and database connection
export const checkHealth = async () => {
  try {
    // Check database connection
    const { data: dbCheck, error: dbError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (dbError) {
      log.error('Database health check failed:', dbError);
      return false;
    }

    // Check auth service
    const { data: authCheck, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      log.error('Auth health check failed:', authError);
      return false;
    }

    log.info('Health check passed successfully');
    return true;
  } catch (err) {
    log.error('Health check failed with exception:', err);
    return false;
  }
};

log.info('Supabase client created successfully'); 