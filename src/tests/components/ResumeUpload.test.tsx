import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ResumeUpload } from '../../components/ResumeUpload';
import { supabase } from '../../lib/supabaseClient';
import { renderWithProviders } from '../utils/test-utils';
import { createMockFile } from '../utils/test-utils';

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn()
      })
    }
  }
}));

describe('ResumeUpload Component', () => {
  it('renders upload area', () => {
    renderWithProviders(<ResumeUpload />);
    expect(screen.getByText(/upload resume/i)).toBeInTheDocument();
  });

  it('handles file upload', async () => {
    const mockUpload = vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null });
    vi.mocked(supabase.storage.from().upload).mockImplementation(mockUpload);

    renderWithProviders(<ResumeUpload />);
    const file = createMockFile('test content', 'test.pdf', 'application/pdf');
    const input = screen.getByLabelText(/upload resume/i);
    
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled();
      expect(screen.getByText(/upload successful/i)).toBeInTheDocument();
    });
  });

  it('handles upload errors', async () => {
    const mockUpload = vi.fn().mockResolvedValue({ data: null, error: { message: 'Upload failed' } });
    vi.mocked(supabase.storage.from().upload).mockImplementation(mockUpload);

    renderWithProviders(<ResumeUpload />);
    const file = createMockFile('test content', 'test.pdf', 'application/pdf');
    const input = screen.getByLabelText(/upload resume/i);
    
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled();
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
    });
  });
});