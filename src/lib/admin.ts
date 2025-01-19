import { supabase } from './supabase';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('Admin');

export const admin = {
  async isAdmin(): Promise<boolean> {
    try {
      // First check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get admin email from config
      const { data: config, error: configError } = await supabase
        .from('auth.config')
        .select('value')
        .eq('key', 'ADMIN_EMAIL')
        .single();

      if (configError) {
        throw new Error('Failed to get admin configuration');
      }

      // Check if user's email matches admin email
      return user.email === config.value;
    } catch (error) {
      log.error('Failed to check admin status:', error);
      return false;
    }
  },

  async getAdminConfig() {
    try {
      const { data: config, error } = await supabase
        .from('auth.admin_users')
        .select('*')
        .single();

      if (error) throw error;
      return config;
    } catch (error) {
      log.error('Failed to get admin config:', error);
      return null;
    }
  },

  async verifyAdminAccess() {
    try {
      // First check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Check if user is in admin_users table
      const { data: adminUser, error: adminError } = await supabase
        .from('auth.admin_users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (adminError) {
        if (adminError.code === 'PGRST116') {
          // Table doesn't exist - try to create it
          await this.initializeAdminTable();
          return this.verifyAdminAccess(); // Retry after initialization
        }
        throw adminError;
      }

      return !!adminUser;
    } catch (error: any) {
      log.error('Failed to verify admin access:', error);
      toast.error('Failed to verify admin access');
      return false;
    }
  },

  async addAdminUser(email: string) {
    try {
      // Get user ID from email
      const { data: user, error: userError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) {
        throw new Error('User not found');
      }

      // Add user to admin_users table
      const { error } = await supabase
        .from('auth.admin_users')
        .insert({
          id: user.id,
          email: email,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Admin user added successfully');
      return true;
    } catch (error: any) {
      log.error('Failed to add admin user:', error);
      toast.error(error.message || 'Failed to add admin user');
      return false;
    }
  },

  async initializeAdminTable() {
    try {
      // Create admin_users table if it doesn't exist
      const { error: tableError } = await supabase.rpc('exec_sql', {
        sql: `
          create table if not exists auth.admin_users (
            id uuid references auth.users on delete cascade primary key,
            email text unique not null,
            created_at timestamptz default now(),
            updated_at timestamptz default now()
          );

          -- Create function to check if user is admin
          create or replace function auth.is_admin()
          returns boolean as $$
          begin
            return exists (
              select 1 
              from auth.admin_users 
              where email = auth.email()
            );
          end;
          $$ language plpgsql security definer;

          -- Create function to add admin user
          create or replace function auth.add_admin_user(admin_email text)
          returns void as $$
          begin
            insert into auth.admin_users (id, email)
            select id, email 
            from auth.users 
            where email = admin_email
            on conflict (email) do nothing;
          end;
          $$ language plpgsql security definer;

          -- Enable RLS
          alter table auth.admin_users enable row level security;

          -- Create policy for admin access
          create policy "Allow admin access"
            on auth.admin_users
            using (auth.email() = email);
        `
      });

      if (tableError) throw tableError;

      // Add initial admin user from environment
      const adminEmail = localStorage.getItem('VITE_ADMIN_EMAIL');
      if (adminEmail) {
        await this.addAdminUser(adminEmail);
      }

      return true;
    } catch (error) {
      log.error('Failed to initialize admin table:', error);
      throw error;
    }
  }
};