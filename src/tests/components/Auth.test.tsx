import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Auth } from '../../components/Auth';
import { supabase } from '../../lib/supabaseClient';

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn()
    }
  }
}));

describe('Auth Component', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.setAttribute('id', 'root');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(<Auth mode="login" />, { container });
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('toggles between login and signup', () => {
    render(<Auth mode="login" />, { container });
    const toggleButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(toggleButton);
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });

  it('handles login submission', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null });
    vi.mocked(supabase.auth.signInWithPassword).mockImplementation(mockSignIn);

    render(<Auth mode="login" />, { container });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('handles login errors', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ data: null, error: { message: 'Invalid credentials' } });
    vi.mocked(supabase.auth.signInWithPassword).mockImplementation(mockSignIn);

    render(<Auth mode="login" />, { container });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});