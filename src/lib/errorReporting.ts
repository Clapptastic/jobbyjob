import { supabase } from './supabase';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('ErrorReporting');

interface ErrorReport {
  source: string;
  error_code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export const errorReporting = {
  async logError(error: ErrorReport) {
    try {
      if (!supabase) return;

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();

      // First try to insert into error_reports table
      const { error: dbError } = await supabase
        .from('error_reports')
        .insert([{
          user_id: user?.id,
          source: error.source,
          error_code: error.error_code,
          message: error.message,
          details: error.details,
          timestamp: error.timestamp
        }]);

      // If table doesn't exist, create it and retry
      if (dbError?.code === 'PGRST116') {
        await supabase.rpc('create_error_reports_table');
        await supabase
          .from('error_reports')
          .insert([{
            user_id: user?.id,
            source: error.source,
            error_code: error.error_code,
            message: error.message,
            details: error.details,
            timestamp: error.timestamp
          }]);
      }
    } catch (e) {
      // Don't throw or show errors from error reporting
      log.error('Error logging failed:', e);
    }
  },

  handleError(error: Error) {
    const report = {
      source: 'application',
      error_code: error.name,
      message: error.message,
      details: {
        stack: error.stack,
        url: window.location.href,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    this.logError(report);
    toast.error(error.message || 'An unexpected error occurred');
  },

  handleNetworkError(error: any) {
    const report = {
      source: 'network',
      error_code: error.name || 'NetworkError',
      message: error.message || 'Network request failed',
      details: {
        status: error.status,
        url: error.url,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    this.logError(report);
    toast.error('Network error occurred. Please check your connection.');
  },

  handleSupabaseError(error: any) {
    const report = {
      source: 'supabase',
      error_code: error.code || 'DatabaseError',
      message: error.message,
      details: {
        hint: error.hint,
        details: error.details,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    this.logError(report);
    toast.error(error.message || 'Database error occurred');
  }
};