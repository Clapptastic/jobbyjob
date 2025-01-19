import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ai } from '../../lib/ai';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { key_value: 'test-key' },
              error: null
            })
          }))
        }))
      }))
    }))
  }
}));

global.fetch = vi.fn();
global.FormData = vi.fn(() => ({
  append: vi.fn()
}));

describe('AI Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('parses resume using Affinda when API key is available', async () => {
    const mockResponse = {
      data: {
        skills: [{ name: 'JavaScript' }, { name: 'Python' }],
        workExperience: [{
          jobTitle: 'Software Engineer',
          organization: 'Tech Corp',
          startDate: '2020-01',
          endDate: '2023-01',
          jobDescription: 'Full stack development'
        }],
        education: [{
          accreditation: { education: 'Bachelor of Science' },
          organization: 'University',
          dates: { completionDate: '2019-05' }
        }]
      }
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response);

    const result = await ai.parseResume('test resume content');

    expect(result).toEqual({
      skills: ['JavaScript', 'Python'],
      experience: [{
        title: 'Software Engineer',
        company: 'Tech Corp',
        duration: '2020-01 - 2023-01',
        description: 'Full stack development'
      }],
      education: [{
        degree: 'Bachelor of Science',
        school: 'University',
        year: '2019'
      }]
    });
  });

  test('falls back to local parser when Affinda API fails', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('API Error'));

    const result = await ai.parseResume(`
SKILLS
JavaScript, Python, React

EXPERIENCE
Software Engineer 2020
Tech Corp
Development work

EDUCATION
Bachelor of Science 2019
University
    `.trim());

    expect(result.skills).toEqual(['JavaScript', 'Python', 'React']);
    
    expect(result.experience).toEqual([{
      title: 'Software Engineer 2020',
      company: 'Tech Corp',
      description: 'Development work',
      duration: ''
    }]);

    expect(result.education).toEqual([{
      degree: 'Bachelor of Science 2019',
      school: 'University',
      year: '2019'
    }]);
  });

  test('falls back to local parser when no API key is available', async () => {
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('No API key found')
            })
          }))
        }))
      }))
    });

    const result = await ai.parseResume(`
SKILLS
JavaScript, Python

EXPERIENCE
Software Engineer 2020
Tech Corp
Development work

EDUCATION
BS Computer Science 2020
University
    `.trim());

    expect(result.skills).toEqual(['JavaScript', 'Python']);
    
    expect(result.experience).toEqual([{
      title: 'Software Engineer 2020',
      company: 'Tech Corp',
      description: 'Development work',
      duration: ''
    }]);

    expect(result.education).toEqual([{
      degree: 'BS Computer Science 2020',
      school: 'University',
      year: '2020'
    }]);
  });
});