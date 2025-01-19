import { supabase } from './supabase';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('Auth');

export const auth = {
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      if (!supabase) {
        throw new Error('Database not initialized');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      log.error('Login error:', error);
      throw error;
    }
  },

  async signUp({ email, password }: { email: string; password: string }) {
    try {
      if (!supabase) {
        throw new Error('Database not initialized');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      log.error('Signup error:', error);
      throw error;
    }
  },

  async resetPasswordForEmail(email: string) {
    try {
      if (!supabase) {
        throw new Error('Database not initialized');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      log.error('Password reset error:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      if (!supabase) {
        throw new Error('Database not initialized');
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      log.error('Sign out error:', error);
      throw error;
    }
  },

  async getSession() {
    try {
      if (!supabase) {
        throw new Error('Database not initialized');
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error: any) {
      log.error('Get session error:', error);
      return null;
    }
  }
};