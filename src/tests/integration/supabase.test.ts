import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { supabase, checkConnection, verifyCredentialsFormat } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

describe('Supabase Integration', () => {
  beforeAll(() => {
    // Mock toast
    vi.mock('react-hot-toast', () => ({
      toast: {
        error: vi.fn(),
        success: vi.fn()
      }
    }));
  });

  test('should validate credentials format', () => {
    const validUrl = 'https://example.supabase.co';
    const validKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    const invalidUrl = 'invalid-url';
    const invalidKey = 'invalid-key';

    const validResult = verifyCredentialsFormat(validUrl, validKey);
    expect(validResult).toHaveLength(0);

    const invalidResult = verifyCredentialsFormat(invalidUrl, invalidKey);
    expect(invalidResult).toContain('Invalid URL format');
    expect(invalidResult).toContain('Invalid anon key format');
  });

  test('should handle connection check with retries', async () => {
    const isConnected = await checkConnection();
    
    if (!isConnected) {
      expect(toast.error).toHaveBeenCalled();
    } else {
      expect(toast.error).not.toHaveBeenCalled();
    }
  });

  test('should verify database schema', async () => {
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    expect(error).toBeNull();
    expect(tables).toBeDefined();

    const requiredTables = ['profiles', 'jobs', 'applications', 'api_keys'];
    requiredTables.forEach(table => {
      expect(tables?.some(t => t.table_name === table)).toBe(true);
    });
  });

  test('should verify storage buckets', async () => {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    expect(error).toBeNull();
    expect(buckets).toBeDefined();

    const requiredBuckets = ['resumes', 'avatars'];
    requiredBuckets.forEach(bucket => {
      expect(buckets?.some(b => b.name === bucket)).toBe(true);
    });
  });

  test('should verify RLS policies', async () => {
    const { data: policies, error } = await supabase
      .from('pg_policies')
      .select('*')
      .in('schemaname', ['public', 'storage']);

    expect(error).toBeNull();
    expect(policies).toBeDefined();
    expect(policies?.length).toBeGreaterThan(0);
  });
});