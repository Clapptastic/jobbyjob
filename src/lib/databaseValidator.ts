import { supabase } from './supabaseClient';
import { createLogger } from './logger';

const log = createLogger('DatabaseValidator');

const REQUIRED_TABLES = ['profiles', 'resumes', 'jobs', 'applications'];
const REQUIRED_BUCKETS = ['resumes'];

export class DatabaseValidator {
  async validateConnection(): Promise<void> {
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      if (error) {
        throw error;
      }
      return;
    } catch (error) {
      log.error('Connection validation failed:', error);
      throw error;
    }
  }

  async validateSchema(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check tables
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (tablesError) {
        throw tablesError;
      }

      const tableNames = tables.map(t => t.table_name);
      const missingTables = REQUIRED_TABLES.filter(t => !tableNames.includes(t));

      if (missingTables.length > 0) {
        errors.push(`Missing required tables: ${missingTables.join(', ')}`);
      }

      // Check storage buckets
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) {
        errors.push(`Failed to check storage buckets: ${error.message}`);
        return { valid: false, errors };
      }

      const bucketNames = buckets.map(b => b.name);
      const missingBuckets = REQUIRED_BUCKETS.filter(b => !bucketNames.includes(b));

      if (missingBuckets.length > 0) {
        errors.push(`Missing required storage buckets: ${missingBuckets.join(', ')}`);
      }

    } catch (error) {
      log.error('Schema validation error:', error);
      errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async testInsert(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      if (!data.id || !data.name || !data.email) {
        return { success: false, error: 'Invalid data format' };
      }

      const { error } = await supabase.from('profiles').insert(data);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      log.error('Insert operation failed:', err);
      return { success: false, error: 'Insert operation failed' };
    }
  }

  async testRetrieve(id: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err) {
      log.error('Retrieve operation failed:', err);
      return { success: false, error: 'Retrieve operation failed' };
    }
  }

  async testDelete(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      log.error('Delete operation failed:', err);
      return { success: false, error: 'Delete operation failed' };
    }
  }
}

export const databaseValidator = new DatabaseValidator();