import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ResumeUpload } from '../../components/ResumeUpload';
import { uploadResume } from '../../lib/storage';
import toast from 'react-hot-toast';

// Mock dependencies
vi.mock('../../lib/storage', () => ({
  uploadResume: vi.fn()
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

describe('ResumeUpload Component', () => {
  beforeEach(() => {
    // Mock window.URL
    global.URL = {
      createObjectURL: vi.fn(),
      revokeObjectURL: vi.fn()
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload area', () => {
    const { getByText } = render(<ResumeUpload />);
    expect(getByText(/upload resume/i)).toBeInTheDocument();
  });

  it('handles file upload', async () => {
    const { getByLabelText } = render(<ResumeUpload />);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    vi.mocked(uploadResume).mockResolvedValueOnce({ success: true, url: 'test-url' });
    
    const input = getByLabelText(/upload resume/i);
    await fireEvent.change(input, { target: { files: [file] } });
    
    expect(uploadResume).toHaveBeenCalledWith(file, expect.any(String));
  });

  it('handles upload errors', async () => {
    const { getByLabelText } = render(<ResumeUpload />);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    vi.mocked(uploadResume).mockRejectedValueOnce(new Error('Upload failed'));
    
    const input = getByLabelText(/upload resume/i);
    await fireEvent.change(input, { target: { files: [file] } });
    
    expect(uploadResume).toHaveBeenCalledWith(file, expect.any(String));
  });
});