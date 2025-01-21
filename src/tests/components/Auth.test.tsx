import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Auth } from '../../components/Auth';
import { supabase } from '../../lib/supabaseClient';
import { renderWithProviders } from '../utils/test-utils';

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn()
    }
  }
}));

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form by default', () => {
    renderWithProviders(<Auth mode="login" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('toggles between login and signup', () => {
    renderWithProviders(<Auth mode="login" />);
    const toggleButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(toggleButton);
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });

  it('handles login submission', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null });
    vi.mocked(supabase.auth.signInWithPassword).mockImplementation(mockSignIn);

    renderWithProviders(<Auth mode="login" />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('handles login errors', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ data: null, error: { message: 'Invalid credentials' } });
    vi.mocked(supabase.auth.signInWithPassword).mockImplementation(mockSignIn);

    renderWithProviders(<Auth mode="login" />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});