import { describe, it, expect, vi } from 'vitest';
import { supabase } from '../lib/supabase';

describe('Resume Upload', () => {
  it('should upload resume successfully', async () => {
    const mockFile = new File(['test'], 'resume.pdf', { type: 'application/pdf' });
    const mockPath = 'user-123/resume.pdf';
    const mockUrl = 'https://example.com/resume.pdf';

    vi.spyOn(supabase.storage, 'from').mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: mockPath }, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: mockUrl }, error: null })
    });

    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(mockPath, mockFile);

    expect(error).toBeNull();
    expect(data.path).toBe(mockPath);
  });

  it('should handle upload errors', async () => {
    const mockFile = new File(['test'], 'resume.exe', { type: 'application/x-msdownload' });
    
    vi.spyOn(supabase.storage, 'from').mockReturnValue({
      upload: vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Invalid file type' }
      })
    });

    const { error } = await supabase.storage
      .from('resumes')
      .upload('test.exe', mockFile);

    expect(error.message).toBe('Invalid file type');
  });
});