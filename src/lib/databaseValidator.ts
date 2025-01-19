import { supabase } from './supabaseClient';
import { createLogger } from './logger';

const log = createLogger('DatabaseValidator');

const REQUIRED_TABLES = ['profiles', 'resumes', 'jobs', 'applications'];
const REQUIRED_BUCKETS = ['resumes'];

export class DatabaseValidator {
  async validateConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('profiles').select('count');
      if (error) {
        log.error('Connection validation failed:', error);
        return false;
      }
      return true;
    } catch (error) {
      log.error('Connection validation failed:', error);
      return false;
    }
  }

  async validateSchema(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check tables
      const { data: tables, error: tablesError } = await supabase.from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (tablesError) {
        throw new Error('Failed to fetch tables');
      }

      const tableNames = tables.map(t => t.table_name);
      const missingTables = REQUIRED_TABLES.filter(table => !tableNames.includes(table));

      if (missingTables.length > 0) {
        errors.push(`Missing required tables: ${missingTables.join(', ')}`);
      }

      // Check storage buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        throw new Error('Failed to check storage buckets');
      }

      const bucketNames = buckets.map(b => b.name);
      const missingBuckets = REQUIRED_BUCKETS.filter(bucket => !bucketNames.includes(bucket));

      if (missingBuckets.length > 0) {
        errors.push(`Missing required buckets: ${missingBuckets.join(', ')}`);
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      log.error('Schema validation error:', error);
      return {
        valid: false,
        errors: [(error as Error).message]
      };
    }
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