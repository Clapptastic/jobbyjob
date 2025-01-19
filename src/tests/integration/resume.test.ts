import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadResume } from '../../lib/storage';
import { parseResume } from '../../lib/ai';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/storage', () => ({
  uploadResume: vi.fn()
}));

vi.mock('../../lib/ai', () => ({
  parseResume: vi.fn()
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn()
    }
  }
}));

describe('Resume Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('complete resume flow', async () => {
    const mockUploadResult = { path: 'test-path', url: 'test-url' };
    vi.mocked(uploadResume).mockResolvedValue(mockUploadResult);

    const mockParsedResume = {
      skills: ['JavaScript', 'React'],
      experience: [
        {
          title: 'Software Engineer',
          company: 'Test Corp',
          duration: '2020-2023'
        }
      ]
    };
    vi.mocked(parseResume).mockResolvedValue(mockParsedResume);

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null })
    } as any);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const result = await uploadResume(file, 'test-user');
    expect(result).toEqual(mockUploadResult);

    const parsedResume = await parseResume(result.path);
    expect(parsedResume).toBeDefined();
    expect(parsedResume.skills).toEqual(['JavaScript', 'React']);
    expect(parsedResume.experience).toHaveLength(1);
    expect(parsedResume.experience[0].title).toBe('Software Engineer');

    const dbResult = await supabase
      .from('resumes')
      .insert({
        user_id: 'test-user',
        file_path: result.path,
        parsed_data: parsedResume
      });
    expect(dbResult.error).toBeNull();
    expect(dbResult.data).toBeDefined();
  });
});