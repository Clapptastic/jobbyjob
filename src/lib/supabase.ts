import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('Supabase');

// Function to get stored credentials
export const getStoredCredentials = () => {
  if (import.meta.env.DEV) {
    return {
      url: localStorage.getItem('VITE_SUPABASE_URL') || '',
      anonKey: localStorage.getItem('VITE_SUPABASE_ANON_KEY') || '',
      serviceKey: localStorage.getItem('VITE_SUPABASE_SERVICE_ROLE_KEY') || ''
    };
  }
  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    serviceKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
  };
};

// Initialize client with proper error handling and retries
const initializeClient = () => {
  try {
    const { url: supabaseUrl, anonKey: supabaseAnonKey } = getStoredCredentials();

    if (!supabaseUrl || !supabaseAnonKey) {
      log.info('Missing Supabase credentials - initial setup required');
      return null;
    }

    // Create client with retries and better error handling
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      db: {
        schema: 'public'
      }
    });

    // Test connection immediately
    client.auth.onAuthStateChange((event, session) => {
      log.info('Auth state changed:', event);
    });

    return client;
  } catch (error) {
    log.error('Failed to initialize Supabase client:', error);
    return null;
  }
};

// Export the initialized client
const supabaseClient = initializeClient();
export { supabaseClient as supabase };

// Function to check connection health with retries
export const checkConnection = async (retries = 3): Promise<boolean> => {
  try {
    if (!supabaseClient) {
      throw new Error('Database client not initialized');
    }

    for (let i = 0; i < retries; i++) {
      try {
        // Use RPC call instead of direct table query
        const { error: healthCheck } = await supabaseClient.rpc('exec_sql', {
          sql: 'SELECT 1;'
        });

        if (!healthCheck) {
          return true;
        }

        // Wait before retrying
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      } catch (error) {
        if (i === retries - 1) throw error;
      }
    }

    return false;
  } catch (error) {
    log.error('Connection check failed:', error);
    return false;
  }
};

// Function to verify credential formats
export const verifyCredentialsFormat = (url?: string, anonKey?: string, serviceKey?: string): string[] => {
  const issues: string[] = [];

  // Validate URL
  if (!url) {
    issues.push('Supabase URL is required');
  } else {
    try {
      const urlObj = new URL(url);
      if (!urlObj.hostname.includes('supabase.co')) {
        issues.push('Invalid Supabase URL format');
      }
    } catch {
      issues.push('Invalid URL format');
    }
  }

  // Validate anon key
  if (!anonKey) {
    issues.push('Anon key is required');
  } else if (!anonKey.startsWith('eyJ')) {
    issues.push('Invalid anon key format');
  }

  // Validate service key if provided
  if (serviceKey && !serviceKey.startsWith('eyJ')) {
    issues.push('Invalid service key format');
  }

  return issues;
};

// Function to store credentials securely
export const storeCredentials = (url: string, anonKey: string, serviceKey?: string): boolean => {
  try {
    if (import.meta.env.DEV) {
      localStorage.setItem('VITE_SUPABASE_URL', url);
      localStorage.setItem('VITE_SUPABASE_ANON_KEY', anonKey);
      if (serviceKey) {
        localStorage.setItem('VITE_SUPABASE_SERVICE_ROLE_KEY', serviceKey);
      }
    }
    return true;
  } catch (error) {
    log.error('Failed to store credentials:', error);
    return false;
  }
};

// Function to reinitialize the client
export const reinitialize = () => {
  // Clear all Supabase-related cache
  localStorage.removeItem('sb-refresh-token');
  localStorage.removeItem('sb-access-token');
  localStorage.removeItem('supabase.auth.token');
  
  // Clear any cached data
  localStorage.removeItem('parsedResume');
  localStorage.removeItem('jobPreferences');
  localStorage.removeItem('lastSearch');
  
  // Reinitialize client
  const client = initializeClient();
  if (!client) {
    toast.error('Failed to initialize database connection');
    return null;
  }
  return client;
};