import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';
import logger from './logger';
import { supabase, checkHealth } from './supabaseClient';

const log = logger('Supabase');

// Function to get stored credentials
export function getStoredCredentials() {
  const isDocker = import.meta.env.VITE_DOCKER === 'true';
  
  if (isDocker) {
    // In Docker, only use environment variables
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    // Log the current state of credentials
    log.info('Getting credentials in Docker mode:', {
      url: url ? (url.startsWith('http') ? url.substring(0, 20) + '...' : url) : 'missing',
      anonKey: anonKey ? 'provided' : 'missing',
      serviceKey: serviceKey ? 'provided' : 'missing'
    });

    // Return empty strings if env vars are not set or are placeholder values
    return {
      url: url && url !== 'your-project-url' ? url : '',
      anonKey: anonKey && anonKey !== 'your-anon-key' ? anonKey : '',
      serviceKey: serviceKey && serviceKey !== 'your-service-key' ? serviceKey : ''
    };
  }

  // Not in Docker, use localStorage with env vars as fallback
  const storedUrl = localStorage.getItem('VITE_SUPABASE_URL') || import.meta.env.VITE_SUPABASE_URL || '';
  const storedAnonKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const storedServiceKey = localStorage.getItem('VITE_SUPABASE_SERVICE_ROLE_KEY') || import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

  // Log the current state of credentials
  log.info('Getting credentials in browser mode:', {
    url: storedUrl ? (storedUrl.startsWith('http') ? storedUrl.substring(0, 20) + '...' : storedUrl) : 'missing',
    anonKey: storedAnonKey ? 'provided' : 'missing',
    serviceKey: storedServiceKey ? 'provided' : 'missing'
  });

  return {
    url: storedUrl,
    anonKey: storedAnonKey,
    serviceKey: storedServiceKey
  };
}

// Initialize client with proper error handling and retries
const initializeClient = () => {
  try {
    const { url: supabaseUrl, anonKey: supabaseAnonKey } = getStoredCredentials();

    // Validate URL and key before attempting to create client
    if (!supabaseUrl || !supabaseAnonKey) {
      log.info('Missing Supabase credentials');
      return null;
    }

    // Ensure URL is properly formatted
    try {
      const urlObj = new URL(supabaseUrl);
      if (!urlObj.hostname.includes('supabase.co')) {
        log.error('Invalid Supabase URL format:', supabaseUrl);
        return null;
      }
    } catch (error) {
      log.error('Invalid URL format:', supabaseUrl, error);
      return null;
    }

    // Validate anon key format
    if (!supabaseAnonKey.startsWith('eyJ')) {
      log.error('Invalid anon key format:', supabaseAnonKey.substring(0, 5) + '...');
      return null;
    }

    log.info('Creating Supabase client with URL:', supabaseUrl);
    
    // Create client with retries and better error handling
    try {
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

      log.info('Supabase client created successfully');
      return client;
    } catch (error) {
      log.error('Failed to create Supabase client:', error);
      return null;
    }
  } catch (error) {
    log.error('Failed to initialize Supabase client:', error);
    return null;
  }
};

// Export a mutable reference to the client
let supabaseClient = initializeClient();
export { supabaseClient as supabase };

// Function to check connection health with retries
export const checkConnection = async (retries = 3): Promise<boolean> => {
  try {
    if (!supabase) {
      log.error('Database client not initialized');
      return false;
    }

    for (let i = 0; i < retries; i++) {
      try {
        const isHealthy = await checkHealth();
        
        if (isHealthy) {
          return true;
        }

        // Wait before retrying with exponential backoff
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      } catch (error) {
        log.error('Connection attempt failed:', error);
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
    const isDocker = import.meta.env.VITE_DOCKER === 'true';
    
    // In Docker, we don't store credentials in localStorage
    if (isDocker) {
      return true;
    }
    
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
  const isDocker = import.meta.env.VITE_DOCKER === 'true';
  
  if (!isDocker) {
    // Clear all Supabase-related cache
    localStorage.removeItem('sb-refresh-token');
    localStorage.removeItem('sb-access-token');
    localStorage.removeItem('supabase.auth.token');
    
    // Clear any cached data
    localStorage.removeItem('parsedResume');
    localStorage.removeItem('jobPreferences');
    localStorage.removeItem('lastSearch');
  }
  
  log.info('Reinitializing Supabase client...');
  
  // Reinitialize client
  const newClient = initializeClient();
  if (!newClient) {
    const { url, anonKey } = getStoredCredentials();
    log.error('Failed to initialize database connection. URL:', url ? url.substring(0, 20) + '...' : 'missing', 'Key:', anonKey ? 'provided' : 'missing');
    toast.error('Failed to initialize database connection');
    return null;
  }
  
  // Update the exported client reference
  log.info('Successfully reinitialized Supabase client');
  supabaseClient = newClient;
  return newClient;
};

// Function to clear auth state and cached data
export const clearAuthState = () => {
  const isDocker = import.meta.env.VITE_DOCKER === 'true';
  
  if (!isDocker) {
    // Clear all Supabase-related cache
    localStorage.removeItem('sb-refresh-token');
    localStorage.removeItem('sb-access-token');
    localStorage.removeItem('supabase.auth.token');
    
    // Clear any cached data
    localStorage.removeItem('parsedResume');
    localStorage.removeItem('jobPreferences');
    localStorage.removeItem('lastSearch');
  }
};