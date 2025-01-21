import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadResume } from '../../lib/storage';
import { supabase } from '../../lib/supabaseClient';
import * as toast from 'react-hot-toast';

// Mock dependencies
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn()
      }))
    }
  }
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

describe('Storage Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null })
    });
  });

  it('validates file type correctly', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    await expect(uploadResume(file)).rejects.toThrow('Invalid file type');
    expect(toast.default.error).toHaveBeenCalledWith('Error uploading resume: Invalid file type');
  });

  it('validates file size correctly', async () => {
    const largeContent = new ArrayBuffer(6 * 1024 * 1024); // 6MB
    const file = new File([largeContent], 'test.pdf', { type: 'application/pdf' });
    
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: vi.fn().mockRejectedValue(new Error('File size exceeds 5MB limit'))
    } as any);

    await expect(uploadResume(file)).rejects.toThrow('File size exceeds 5MB limit');
    expect(toast.default.error).toHaveBeenCalledWith('Error uploading resume: File size exceeds 5MB limit');
  });

  it('handles upload errors gracefully', async () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: vi.fn().mockRejectedValue(new Error('Upload failed'))
    });

    await expect(uploadResume(file)).rejects.toThrow('Upload failed');
    expect(toast.default.error).toHaveBeenCalledWith('Error uploading resume: Upload failed');
  });

  it('uploads file successfully', async () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'resumes/test.pdf' }, error: null })
    });

    const result = await uploadResume(file);
    expect(result).toEqual({ path: 'resumes/test.pdf' });
    expect(toast.default.success).toHaveBeenCalledWith('Resume uploaded successfully');
  });
});