import { describe, test, expect, vi } from 'vitest';
import { databaseValidator } from '../../lib/databaseValidator';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase');

describe('Database Validator', () => {
  test('validates schema successfully', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            { table_name: 'profiles' },
            { table_name: 'jobs' },
            { table_name: 'applications' },
            { table_name: 'api_keys' }
          ],
          error: null
        })
      })
    });

    vi.mocked(supabase.storage.listBuckets).mockResolvedValue({
      data: [
        { name: 'resumes' },
        { name: 'avatars' }
      ],
      error: null
    });

    const result = await databaseValidator.validateSchema();
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('detects missing tables', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ table_name: 'profiles' }],
          error: null
        })
      })
    });

    const result = await databaseValidator.validateSchema();
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Missing required tables');
  });

  test('validates connection with retries', async () => {
    let attempts = 0;
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockImplementation(() => {
          attempts++;
          if (attempts < 2) {
            throw new Error('Connection failed');
          }
          return { error: null };
        })
      })
    });

    const isConnected = await databaseValidator.validateConnection();
    expect(isConnected).toBe(true);
    expect(attempts).toBe(2);
  });

  test('validates permissions', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ error: null })
      }),
      upsert: vi.fn().mockResolvedValue({ error: null })
    });

    vi.mocked(supabase.storage.from).mockReturnValue({
      list: vi.fn().mockResolvedValue({ error: null })
    });

    const result = await databaseValidator.validatePermissions();
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});