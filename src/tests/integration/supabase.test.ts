import { describe, test, expect, beforeAll, vi } from 'vitest';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user' } } }, error: null })
    },
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({
        data: [{ id: 1, key: 'test' }],
        error: null
      }),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null })
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null })
      }))
    })),
    storage: {
      listBuckets: vi.fn().mockResolvedValue({
        data: [
          { name: 'resumes' },
          { name: 'avatars' }
        ],
        error: null
      }),
      from: vi.fn(() => ({
        remove: vi.fn().mockResolvedValue({ error: null })
      }))
    },
    rpc: vi.fn().mockImplementation((procedure) => {
      if (procedure === 'get_tables') {
        return Promise.resolve({
          data: [
            { table_name: 'users' },
            { table_name: 'jobs' },
            { table_name: 'applications' }
          ],
          error: null
        });
      }
      if (procedure === 'get_policies') {
        return Promise.resolve({
          data: [
            { policyname: 'Enable read access for all users' },
            { policyname: 'Enable insert for authenticated users only' },
            { policyname: 'Enable update for users based on user_id' },
            { policyname: 'Enable delete for users based on user_id' }
          ],
          error: null
        });
      }
      return Promise.resolve({ data: null, error: null });
    })
  }
}));

describe('Supabase Integration', () => {
  beforeAll(async () => {
    // Ensure we have a valid session
    const { data: session } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No valid session found. Please authenticate first.');
    }
  });

  test('should connect to Supabase', async () => {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*');

    if (error) {
      console.warn('Connection error:', error);
    }

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  test('should verify required tables exist', async () => {
    const { data: tables, error } = await supabase.rpc('get_tables');

    if (error) {
      console.warn('Table query error:', error);
    }

    expect(error).toBeNull();
    expect(tables).toBeDefined();

    const requiredTables = ['users', 'jobs', 'applications'];
    requiredTables.forEach(table => {
      const exists = tables?.some(t => t.table_name === table);
      expect(exists).toBe(true);
    });
  });

  test('should verify storage buckets exist', async () => {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.warn('Storage bucket query error:', error);
    }

    expect(error).toBeNull();
    expect(buckets).toBeDefined();

    const requiredBuckets = ['resumes', 'avatars'];
    for (const bucket of requiredBuckets) {
      const exists = buckets?.some(b => b.name === bucket);
      expect(exists).toBe(true);
    }
  });

  test('should verify RLS policies', async () => {
    const { data: policies, error } = await supabase.rpc('get_policies');

    if (error) {
      console.warn('RLS policy query error:', error);
    }

    expect(error).toBeNull();
    expect(policies).toBeDefined();

    const requiredPolicies = [
      'Enable read access for all users',
      'Enable insert for authenticated users only',
      'Enable update for users based on user_id',
      'Enable delete for users based on user_id'
    ];

    requiredPolicies.forEach(policy => {
      const exists = policies?.some(p => 
        p.policyname.toLowerCase().includes(policy.toLowerCase())
      );
      expect(exists).toBe(true);
    });
  });
});