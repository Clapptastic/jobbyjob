import { test, expect } from '@playwright/test';
import { supabase } from '../../lib/supabase';
import { databaseValidator } from '../../lib/databaseValidator';

test.describe('Database Integration', () => {
  test('should connect to Supabase successfully', async () => {
    const isConnected = await databaseValidator.validateConnection();
    expect(isConnected).toBe(true);
  });

  test('should have correct database schema', async () => {
    const result = await databaseValidator.validateSchema();
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should have proper permissions', async () => {
    const result = await databaseValidator.validatePermissions();
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should handle API operations', async () => {
    // Test read operation
    const { data: readData, error: readError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    expect(readError).toBeNull();
    expect(readData).toBeDefined();

    // Test write operation
    const testProfile = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'test@example.com'
    };

    const { error: writeError } = await supabase
      .from('profiles')
      .upsert(testProfile);

    expect(writeError).toBeNull();

    // Test storage operation
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    expect(storageError).toBeNull();
    expect(buckets).toBeDefined();
    expect(buckets?.some(b => b.name === 'resumes')).toBe(true);
    expect(buckets?.some(b => b.name === 'avatars')).toBe(true);
  });
});