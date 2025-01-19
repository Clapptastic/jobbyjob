import { supabase } from './supabase';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('Database');

export async function initializeDatabaseConnection() {
  try {
    // Skip if in initial setup
    const secretsConfigured = localStorage.getItem('secretsConfigured') === 'true';
    if (!secretsConfigured) {
      log.info('Skipping database initialization - Initial setup in progress');
      return false;
    }

    // Test connection with retries
    let isConnected = false;
    for (let i = 0; i < 3; i++) {
      try {
        const { error: healthCheck } = await supabase.rpc('exec_sql', {
          sql: 'SELECT 1;'
        });

        if (!healthCheck) {
          isConnected = true;
          break;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      } catch (error) {
        if (i === 2) throw error;
      }
    }

    if (!isConnected) {
      throw new Error('Unable to connect to the database');
    }

    // Initialize database schema
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: readFileSync(join(__dirname, '../../supabase/setup.sql'), 'utf8')
    });

    if (schemaError) {
      throw schemaError;
    }

    log.info('Database initialization successful');
    return true;
  } catch (error: any) {
    log.error('Database initialization failed:', error);
    toast.error('Database initialization failed. Please check your credentials.');
    
    // Store error for troubleshooting
    localStorage.setItem('lastDatabaseError', error.message);
    
    return false;
  }
}