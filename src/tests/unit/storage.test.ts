import { describe, test, expect, vi } from 'vitest';
import { storage } from '../../lib/storage';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase');

describe('Storage Module', () => {
  test('validates file type correctly', async () => {
    const validFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    await expect(storage.uploadResume(validFile, 'test-user'))
      .resolves.toBeDefined();

    await expect(storage.uploadResume(invalidFile, 'test-user'))
      .rejects.toThrow('Invalid file type');
  });

  test('validates file size correctly', async () => {
    const smallFile = new File(['test'], 'small.pdf', { type: 'application/pdf' });
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });

    await expect(storage.uploadResume(smallFile, 'test-user'))
      .resolves.toBeDefined();

    await expect(storage.uploadResume(largeFile, 'test-user'))
      .rejects.toThrow('File size must be less than 5MB');
  });

  test('handles upload errors gracefully', async () => {
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: vi.fn().mockRejectedValue(new Error('Upload failed')),
      getPublicUrl: vi.fn()
    });

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    await expect(storage.uploadResume(file, 'test-user'))
      .rejects.toThrow('Upload failed');
  });
});