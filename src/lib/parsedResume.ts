import { supabase } from './supabase';
import { toast } from './toast';
import logger from './logger';

const log = logger('ParsedResume');

export const parsedResume = {
  async get(userId: string) {
    try {
      // First try to get from localStorage
      const cached = localStorage.getItem(`parsedResume_${userId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // If not in cache, get from database
      const { data, error } = await supabase
        .from('profiles')
        .select('resume_content')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found error - return null without error
          return null;
        }
        throw error;
      }

      // Cache the result
      if (data?.resume_content) {
        localStorage.setItem(`parsedResume_${userId}`, JSON.stringify(data.resume_content));
      }

      return data?.resume_content;
    } catch (error: any) {
      log.error('Failed to get parsed resume:', error);
      // Only show error toast for network/server errors
      if (error.message?.includes('Network') || error.code?.startsWith('5')) {
        toast.error('Failed to load resume. Please check your connection.');
      }
      return null;
    }
  },

  async save(userId: string, content: any) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          resume_content: content,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Update cache
      localStorage.setItem(`parsedResume_${userId}`, JSON.stringify(content));
      return true;
    } catch (error) {
      log.error('Failed to save parsed resume:', error);
      toast.error('Failed to save parsed resume');
      return false;
    }
  },

  clearCache(userId: string) {
    localStorage.removeItem(`parsedResume_${userId}`);
  }
};