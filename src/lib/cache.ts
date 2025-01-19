import { supabase } from './supabase';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('Cache');

export const cache = {
  async clear() {
    try {
      // Clear Supabase cache
      const { error } = await supabase.rpc('clear_cache');
      if (error) throw error;

      // Clear local storage
      const cacheKeys = [
        'sb-refresh-token',
        'sb-access-token',
        'supabase.auth.token',
        'jobProcessingStatus',
        'parsedResume',
        'lastSearch',
        'preferences',
        'apiConfig'
      ];
      
      cacheKeys.forEach(key => localStorage.removeItem(key));

      // Clear any in-memory cache
      if (window.caches) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map(key => window.caches.delete(key)));
      }

      // Force reload application state
      window.location.reload();

      toast.success('Cache cleared successfully');
      return true;
    } catch (error) {
      log.error('Failed to clear cache:', error);
      toast.error('Failed to clear cache. Please try again.');
      return false;
    }
  }
};