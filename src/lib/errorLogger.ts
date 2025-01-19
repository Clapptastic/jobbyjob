import { supabase } from './supabase';
import logger from './logger';

const log = logger('ErrorLogger');

interface ErrorReport {
  source: string;
  error_code: string;
  message: string;
  details?: Record<string, any>;
  user_id?: string;
}

export const errorLogger = {
  async logError(error: Error, source: string, userId?: string) {
    try {
      const errorReport: ErrorReport = {
        source,
        error_code: error.name,
        message: error.message,
        details: {
          stack: error.stack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        },
        user_id: userId
      };

      const { error: dbError } = await supabase
        .from('error_reports')
        .insert([errorReport]);

      if (dbError) {
        log.error('Failed to log error to database:', dbError);
        // Fallback to console logging if database insert fails
        console.error('[Error Report]', errorReport);
      }

      // Log to console in development
      if (import.meta.env.DEV) {
        console.error(`[${source}]`, error);
      }
    } catch (e) {
      // Fallback logging if everything fails
      console.error('Error logging failed:', e);
      console.error('Original error:', error);
    }
  },

  async getErrorStats() {
    try {
      const { data, error } = await supabase
        .from('error_reports')
        .select('source, error_code, count(*)')
        .filter('created_at', 'gte', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .group('source, error_code');

      if (error) throw error;
      return data;
    } catch (error) {
      log.error('Failed to get error stats:', error);
      return [];
    }
  },

  async markResolved(errorId: string, notes?: string) {
    try {
      const { error } = await supabase
        .from('error_reports')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes
        })
        .eq('id', errorId);

      if (error) throw error;
      return true;
    } catch (error) {
      log.error('Failed to mark error as resolved:', error);
      return false;
    }
  }
};