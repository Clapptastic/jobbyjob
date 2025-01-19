import { supabase } from './supabase';
import { storage } from './storage';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('API');

export const api = {
  async initializeDatabase() {
    try {
      if (!supabase) {
        throw new Error('Database not initialized');
      }

      // First, create the public schema if it doesn't exist
      const { error: schemaError } = await supabase.rpc('exec_sql', {
        sql: `
          create schema if not exists public;
          grant all on schema public to postgres;
          grant all on schema public to public;
        `
      });

      if (schemaError) {
        throw new Error(`Failed to create schema: ${schemaError.message}`);
      }

      // Run complete database setup
      const { error: setupError } = await supabase.rpc('exec_sql', {
        sql: `
          -- Enable required extensions
          create extension if not exists "uuid-ossp";
          create extension if not exists "pgcrypto";
          create extension if not exists "pg_net";

          -- Create schemas
          create schema if not exists auth;
          create schema if not exists storage;

          -- Create profiles table
          create table if not exists public.profiles (
              id uuid references auth.users on delete cascade primary key,
              email text unique not null,
              resume_url text,
              resume_content jsonb,
              linkedin_url text,
              personal_website text,
              job_preferences jsonb,
              created_at timestamptz default now(),
              updated_at timestamptz default now()
          );

          -- Enable RLS
          alter table public.profiles enable row level security;

          -- Create profile policies
          create policy "Users can view own profile"
              on public.profiles for select
              using (auth.uid() = id);

          create policy "Users can update own profile"
              on public.profiles for update
              using (auth.uid() = id);
        `
      });

      if (setupError) {
        throw new Error(`Failed to initialize database: ${setupError.message}`);
      }

      // Verify database setup
      const { error: verifyError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (verifyError) {
        throw new Error(`Failed to verify database setup: ${verifyError.message}`);
      }

      return supabase;
    } catch (error: any) {
      log.error('Database initialization failed:', error);
      throw error;
    }
  },

  async resetDatabase() {
    try {
      if (!supabase) {
        throw new Error('Database not initialized');
      }

      // Run complete setup SQL
      const { error: setupError } = await supabase.rpc('exec_sql', {
        sql: `
          -- Drop existing schemas
          drop schema if exists public cascade;
          drop schema if exists storage cascade;
          
          -- Run complete setup
          \i 'supabase/migrations/000_complete_setup.sql';
        `
      });

      if (setupError) {
        throw setupError;
      }

      // Initialize storage
      await storage.initialize();

      return true;
    } catch (error: any) {
      log.error('Database reset failed:', error);
      throw error;
    }
  },

  // ... rest of the api object implementation
};