import { DatabaseValidator } from '../../lib/databaseValidator';
import { supabase } from '../../lib/supabaseClient';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [{ id: 1 }], error: null }))
      }))
    })),
    storage: {
      listBuckets: vi.fn()
    }
  }
}));

describe('Database Validator', () => {
  let databaseValidator: DatabaseValidator;

  beforeEach(() => {
    databaseValidator = new DatabaseValidator();
    vi.clearAllMocks();
  });

  it('validates schema successfully', async () => {
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: () => ({
        eq: () => Promise.resolve({ 
          data: [
            { table_name: 'profiles' },
            { table_name: 'resumes' },
            { table_name: 'jobs' },
            { table_name: 'applications' }
          ], 
          error: null 
        })
      })
    }));

    vi.mocked(supabase.storage.listBuckets).mockResolvedValue({ 
      data: [{ name: 'resumes' }], 
      error: null 
    });

    const result = await databaseValidator.validateSchema();
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects missing tables', async () => {
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: () => ({
        eq: () => Promise.resolve({ 
          data: [{ table_name: 'profiles' }], 
          error: null 
        })
      })
    }));

    vi.mocked(supabase.storage.listBuckets).mockResolvedValue({ 
      data: [{ name: 'resumes' }], 
      error: null 
    });

    const result = await databaseValidator.validateSchema();
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Missing required tables');
  });

  it('handles connection errors', async () => {
    vi.mocked(supabase.from).mockImplementation(() => {
      throw new Error('Failed to connect to database');
    });

    await expect(databaseValidator.validateConnection()).rejects.toThrow('Failed to connect to database');
  });

  it('handles storage bucket errors', async () => {
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: () => ({
        eq: () => Promise.resolve({ 
          data: [
            { table_name: 'profiles' },
            { table_name: 'resumes' },
            { table_name: 'jobs' },
            { table_name: 'applications' }
          ], 
          error: null 
        })
      })
    }));

    vi.mocked(supabase.storage.listBuckets).mockResolvedValue({ 
      data: null, 
      error: { message: 'Failed to check storage buckets' } 
    });

    const result = await databaseValidator.validateSchema();
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Failed to check storage buckets');
  });
});