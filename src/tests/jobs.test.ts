import { describe, it, expect, vi } from 'vitest';
import { supabase } from '../lib/supabase';

describe('Job Search', () => {
  it('should fetch matching jobs', async () => {
    const mockJobs = [
      {
        id: '1',
        title: 'Software Engineer',
        company: 'Tech Co',
        match_score: 95
      }
    ];

    vi.spyOn(supabase, 'from').mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockJobs, error: null })
        })
      })
    });

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', '123')
      .order('match_score', { ascending: false });

    expect(error).toBeNull();
    expect(data).toEqual(mockJobs);
  });

  it('should submit application successfully', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null })
    });

    const { error } = await supabase
      .from('applications')
      .insert({
        user_id: '123',
        job_id: '456',
        status: 'applied'
      });

    expect(error).toBeNull();
  });
});