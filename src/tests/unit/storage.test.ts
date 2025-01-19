import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadResume } from '../../lib/storage';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

// Mock dependencies
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    storage: {
      from: vi.fn()
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
  });

  it('validates file type correctly', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    await expect(uploadResume(file, 'test-user')).rejects.toThrow('Invalid file type');
    expect(toast.error).toHaveBeenCalledWith('Invalid file type. Please upload a PDF file.');
  });

  it('validates file size correctly', async () => {
    // Create a file larger than 5MB
    const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
    const file = new File([largeContent], 'test.pdf', { type: 'application/pdf' });
    
    await expect(uploadResume(file, 'test-user')).rejects.toThrow('File size exceeds 5MB limit');
    expect(toast.error).toHaveBeenCalledWith('File size exceeds 5MB limit');
  });

  it('handles upload errors gracefully', async () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const mockUpload = vi.fn().mockRejectedValue(new Error('Upload failed'));
    const mockFrom = vi.fn().mockReturnValue({ upload: mockUpload });
    vi.mocked(supabase.storage.from).mockImplementation(mockFrom);

    await expect(uploadResume(file, 'test-user')).rejects.toThrow('Upload failed');
    expect(toast.error).toHaveBeenCalledWith('Error uploading resume: Upload failed');
  });
});