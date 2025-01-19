import { describe, it, expect, vi } from 'vitest';
import { supabase } from '../lib/supabase';

describe('Job Preferences', () => {
  it('should save preferences successfully', async () => {
    const preferences = {
      keywords: ['react', 'typescript'],
      location: '94105',
      remote: true
    };

    vi.spyOn(supabase, 'from').mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: preferences, error: null })
      })
    });

    const { error } = await supabase
      .from('profiles')
      .update({ job_preferences: preferences })
      .eq('id', '123');

    expect(error).toBeNull();
  });

  it('should load preferences successfully', async () => {
    const mockPreferences = {
      keywords: ['react', 'typescript'],
      location: '94105',
      remote: true
    };

    vi.spyOn(supabase, 'from').mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: { job_preferences: mockPreferences }, 
            error: null 
          })
        })
      })
    });

    const { data, error } = await supabase
      .from('profiles')
      .select('job_preferences')
      .eq('id', '123')
      .single();

    expect(error).toBeNull();
    expect(data.job_preferences).toEqual(mockPreferences);
  });
});