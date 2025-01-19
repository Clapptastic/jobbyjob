import { describe, test, expect, vi } from 'vitest';
import { ai } from '../../lib/ai';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase');

describe('AI Module', () => {
  test('parses resume successfully', async () => {
    const mockParsedContent = {
      skills: ['JavaScript', 'React'],
      experience: [{
        title: 'Developer',
        company: 'Tech Co',
        duration: '2020-2024',
        description: 'Full stack development'
      }],
      education: [{
        degree: 'BS Computer Science',
        school: 'University',
        year: '2020'
      }]
    };

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { key_value: 'test-key' },
            error: null
          })
        })
      })
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockParsedContent)
    });

    const result = await ai.parseResume('test content');
    expect(result).toEqual(mockParsedContent);
  });

  test('handles parsing errors gracefully', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('API key not found')
          })
        })
      })
    });

    await expect(ai.parseResume('test content'))
      .rejects.toThrow('API key not found');
  });
});