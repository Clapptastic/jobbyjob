import { supabase } from './supabase';
import logger from './logger';

const log = logger('Config');

export const config = {
  async saveToEnv(values: Record<string, string>) {
    try {
      // Create .env file content
      const envContent = Object.entries(values)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      // In development, save to .env file
      if (import.meta.env.DEV) {
        const response = await fetch('/_localEnv', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: envContent
        });

        if (!response.ok) {
          throw new Error('Failed to save .env file');
        }
      }

      // Store in localStorage for development
      Object.entries(values).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });

      return true;
    } catch (error) {
      log.error('Failed to save configuration:', error);
      return false;
    }
  },

  async loadFromEnv() {
    try {
      // In development, try to load from .env file
      if (import.meta.env.DEV) {
        const response = await fetch('/_localEnv');
        if (response.ok) {
          const text = await response.text();
          const values: Record<string, string> = {};
          
          text.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
              values[key.trim()] = value.trim();
            }
          });

          return values;
        }
      }

      // Fallback to localStorage in development
      if (import.meta.env.DEV) {
        const values: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('VITE_')) {
            values[key] = localStorage.getItem(key) || '';
          }
        }
        return values;
      }

      return null;
    } catch (error) {
      log.error('Failed to load configuration:', error);
      return null;
    }
  },

  async verifyConfiguration() {
    try {
      // Test Supabase connection
      const { error: dbError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (dbError) throw dbError;

      // Test storage
      const { error: storageError } = await supabase.storage.getBucket('resumes');
      if (storageError) throw storageError;

      // Test OpenAI connection
      const openaiResponse = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        }
      });

      if (!openaiResponse.ok) {
        throw new Error('Failed to connect to OpenAI API');
      }

      return true;
    } catch (error) {
      log.error('Configuration verification failed:', error);
      return false;
    }
  }
};