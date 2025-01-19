import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResumeUpload from '../../components/ResumeUpload';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

vi.mock('../../lib/supabase');
vi.mock('react-hot-toast');

describe('ResumeUpload Component', () => {
  const mockFile = new File(['test'], 'resume.pdf', { type: 'application/pdf' });

  beforeEach(() => {
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test/resume.pdf' }, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/resume.pdf' }, error: null })
    });
  });

  it('renders upload area correctly', () => {
    render(<ResumeUpload />);
    expect(screen.getByText(/click or drag resume to upload/i)).toBeInTheDocument();
  });

  it('handles file upload successfully', async () => {
    render(<ResumeUpload />);
    
    const dropzone = screen.getByText(/click or drag resume to upload/i).parentElement!;
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [mockFile]
      }
    });

    await waitFor(() => {
      expect(supabase.storage.from).toHaveBeenCalledWith('resumes');
      expect(toast.success).toHaveBeenCalledWith('Resume uploaded successfully!');
    });
  });

  it('validates file size', async () => {
    const largeFile = new File(['test'.repeat(1000000)], 'large.pdf', { type: 'application/pdf' });
    
    render(<ResumeUpload />);
    
    const dropzone = screen.getByText(/click or drag resume to upload/i).parentElement!;
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [largeFile]
      }
    });

    await waitFor(() => {
      expect(screen.getByText(/file size must be less than 5mb/i)).toBeInTheDocument();
    });
  });
});