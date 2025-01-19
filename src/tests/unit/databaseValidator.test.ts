import { describe, it, expect, vi, beforeEach } from 'vitest';
import { databaseValidator } from '../../lib/databaseValidator';
import { supabase } from '../../lib/supabaseClient';

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      getBucket: vi.fn(),
      listBuckets: vi.fn()
    }
  }
}));

describe('Database Validator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates connection successfully', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [{ count: 1 }], error: null })
    } as any);

    const result = await databaseValidator.validateConnection();
    expect(result).toBe(true);
  });

  it('validates schema successfully', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: ['profiles', 'resumes', 'jobs', 'applications'] })
    } as any);

    vi.mocked(supabase.storage.listBuckets).mockResolvedValue({
      data: [{ name: 'resumes' }],
      error: null
    });

    const result = await databaseValidator.validateSchema();
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects missing tables', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: ['profiles'] })
    } as any);

    vi.mocked(supabase.storage.listBuckets).mockResolvedValue({
      data: [{ name: 'resumes' }],
      error: null
    });

    const result = await databaseValidator.validateSchema();
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Missing required tables');
  });

  it('handles connection errors', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Failed to connect to database')
      })
    } as any);

    const result = await databaseValidator.validateConnection();
    expect(result).toBe(false);
  });

  it('handles storage bucket errors', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: ['profiles', 'resumes', 'jobs', 'applications'] })
    } as any);

    vi.mocked(supabase.storage.listBuckets).mockRejectedValue(new Error('Failed to check storage buckets'));

    const result = await databaseValidator.validateSchema();
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Failed to check storage buckets');
  });
});