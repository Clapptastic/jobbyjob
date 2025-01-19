import { supabase } from './supabase';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('DatabaseValidator');

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export const databaseValidator = {
  async validateSchema(): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    try {
      // First check basic connection
      const { error: healthCheck } = await supabase.rpc('exec_sql', {
        sql: 'SELECT 1;'
      });

      if (healthCheck) {
        result.valid = false;
        result.errors.push('Failed to connect to database');
        return result;
      }

      // Check required tables using RPC
      const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT table_name 
          FROM pg_tables 
          WHERE schemaname = 'public';
        `
      });

      if (tablesError) {
        result.valid = false;
        result.errors.push(`Failed to check tables: ${tablesError.message}`);
        return result;
      }

      const requiredTables = ['profiles', 'jobs', 'applications', 'api_keys'];
      const missingTables = requiredTables.filter(
        table => !tables?.some(t => t.table_name === table)
      );

      if (missingTables.length > 0) {
        result.valid = false;
        result.errors.push(`Missing required tables: ${missingTables.join(', ')}`);
      }

      // Check storage buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        result.valid = false;
        result.errors.push(`Failed to check storage buckets: ${bucketsError.message}`);
      } else {
        const requiredBuckets = ['resumes', 'avatars'];
        const missingBuckets = requiredBuckets.filter(
          bucket => !buckets?.some(b => b.name === bucket)
        );

        if (missingBuckets.length > 0) {
          result.valid = false;
          result.errors.push(`Missing storage buckets: ${missingBuckets.join(', ')}`);
        }
      }

      // Check RLS policies
      const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT tablename, policyname
          FROM pg_policies 
          WHERE schemaname IN ('public', 'storage');
        `
      });

      if (policiesError) {
        result.warnings.push(`Could not verify RLS policies: ${policiesError.message}`);
      } else if (!policies?.length) {
        result.warnings.push('No RLS policies found. Security might be misconfigured.');
      }

    } catch (error: any) {
      log.error('Schema validation failed:', error);
      result.valid = false;
      result.errors.push(error.message || 'Failed to validate database schema');
    }

    return result;
  }
};