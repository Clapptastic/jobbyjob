import { supabase, reinitializeSupabase } from './supabase';
import { initializeDatabaseConnection } from './initDatabase';
import { initializeStorage } from './initStorage';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('VerifyCredentials');

export async function verifyCredentials(secrets: any[]) {
  try {
    // Store credentials in localStorage
    secrets.forEach(secret => {
      if (secret.value) {
        localStorage.setItem(secret.envKey, secret.value);
      }
    });

    // Reinitialize Supabase with new credentials
    const supabaseClient = reinitializeSupabase();
    if (!supabaseClient) {
      throw new Error('Failed to initialize database client. Please check your Supabase credentials.');
    }

    // Test database connection with explicit error handling
    const { error: dbError } = await supabaseClient
      .from('profiles')
      .select('count')
      .limit(1);

    if (dbError) {
      if (dbError.code === 'PGRST116') {
        throw new Error('Database schema not initialized. Please run the setup script.');
      } else if (dbError.code === '42501') {
        throw new Error('Permission denied. Please check your API key permissions.');
      } else if (dbError.code === '28P01') {
        throw new Error('Invalid database credentials. Please verify your Supabase URL and API key.');
      } else {
        throw new Error(`Database connection failed: ${dbError.message}`);
      }
    }

    // Initialize database with proper error handling
    const dbInitialized = await initializeDatabaseConnection();
    if (!dbInitialized) {
      throw new Error('Failed to initialize database. Please check the database logs for details.');
    }

    // Initialize storage with proper error handling
    const storageInitialized = await initializeStorage();
    if (!storageInitialized) {
      throw new Error('Failed to initialize storage. Please verify storage service is enabled.');
    }

    return true;
  } catch (error: any) {
    // Log detailed error information
    log.error('Verification failed:', {
      error: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });

    // Clear credentials if verification fails
    secrets.forEach(secret => localStorage.removeItem(secret.envKey));
    localStorage.removeItem('secretsConfigured');

    // Re-throw with user-friendly message
    throw new Error(error.message || 'Failed to verify credentials. Please check your configuration.');
  }
}