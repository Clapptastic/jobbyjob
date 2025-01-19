import { toast } from 'react-hot-toast';

// Add debug logging
const DEBUG = true;

function log(...args: any[]) {
  if (DEBUG) {
    console.log('[Supabase Error Debug]', ...args);
  }
}

interface DatabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

const ERROR_MESSAGES: Record<string, { message: string; solution: string[] }> = {
  // Auth Errors
  'auth/invalid-credentials': {
    message: 'Invalid email or password',
    solution: [
      'Check your email and password',
      'Reset your password if needed'
    ]
  },
  'auth/email-not-confirmed': {
    message: 'Please verify your email address',
    solution: [
      'Check your email for verification link',
      'Request a new verification email'
    ]
  },

  // Storage Errors
  'storage/not-enabled': {
    message: 'Storage service is not enabled',
    solution: [
      'Enable storage in Supabase dashboard',
      'Check project configuration'
    ]
  },
  'storage/bucket-not-found': {
    message: 'Storage bucket not found',
    solution: [
      'Create required storage buckets',
      'Check bucket configuration'
    ]
  },
  'storage/quota-exceeded': {
    message: 'Storage quota exceeded',
    solution: [
      'Check storage usage',
      'Upgrade storage plan if needed'
    ]
  },

  // Database Errors
  '23505': {
    message: 'This record already exists',
    solution: [
      'Try updating instead of creating',
      'Check for duplicate entries'
    ]
  },
  '42P01': {
    message: 'Database table not found',
    solution: [
      'Run database migrations',
      'Check table names and schema'
    ]
  },
  '23503': {
    message: 'Referenced record does not exist',
    solution: [
      'Check foreign key relationships',
      'Ensure referenced record exists'
    ]
  },

  // Network Errors
  'network-error': {
    message: 'Network connection failed',
    solution: [
      'Check internet connection',
      'Try again in a few moments'
    ]
  }
};

export function handleDatabaseError(error: DatabaseError) {
  log('Handling database error:', error);

  // Log detailed error information
  console.error('Database Error:', {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
    timestamp: new Date().toISOString(),
    stack: new Error().stack
  });

  // Check for specific error types
  const errorInfo = ERROR_MESSAGES[error.code] || {
    message: 'An unexpected database error occurred',
    solution: [
      'Check Supabase dashboard',
      'Verify environment variables',
      'Check database connection'
    ]
  };

  // Show user-friendly error message
  toast.error(errorInfo.message, {
    duration: 5000,
    position: 'top-right',
  });

  // Return structured error information
  return {
    type: 'database_error',
    code: error.code,
    message: error.message,
    userMessage: errorInfo.message,
    solution: errorInfo.solution,
    timestamp: new Date().toISOString(),
    details: {
      hint: error.hint,
      details: error.details,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        supabaseUrl: !!process.env.VITE_SUPABASE_URL,
        hasAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY
      }
    }
  };
}

// Add function to check database connection
export async function checkDatabaseConnection(supabase: any) {
  try {
    log('Checking database connection...');

    const start = Date.now();
    const { data, error } = await supabase.from('profiles').select('count');
    const duration = Date.now() - start;

    if (error) {
      log('Database connection failed:', error);
      throw error;
    }

    log(`Database connection successful (${duration}ms)`);
    return true;
  } catch (error) {
    log('Database connection check failed:', error);
    handleDatabaseError(error as DatabaseError);
    return false;
  }
}

// Add function to validate environment
export function validateEnvironment() {
  log('Validating environment...');

  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    const error = `Missing environment variables: ${missing.join(', ')}`;
    log('Environment validation failed:', error);
    throw new Error(error);
  }

  log('Environment validation successful');
  return true;
}

// Add function to check storage status
export async function checkStorageStatus(supabase: any) {
  try {
    log('Checking storage status...');

    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      log('Storage check failed:', error);
      throw error;
    }

    const required = ['resumes', 'avatars'];
    const missing = required.filter(name => !buckets?.some(b => b.name === name));

    if (missing.length > 0) {
      const error = `Missing storage buckets: ${missing.join(', ')}`;
      log('Storage check failed:', error);
      throw new Error(error);
    }

    log('Storage check successful');
    return true;
  } catch (error) {
    log('Storage check failed:', error);
    handleDatabaseError(error as DatabaseError);
    return false;
  }
}