import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Auth from '../../components/Auth';
import { auth } from '../../lib/auth';
import { toast } from 'react-hot-toast';

vi.mock('../../lib/auth');
vi.mock('react-hot-toast');

describe('Auth Component', () => {
  const mockNavigate = vi.fn();
  
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: () => mockNavigate,
    };
  });

  const renderAuth = (mode: 'login' | 'signup' | 'reset') => {
    return render(
      <BrowserRouter>
        <Auth mode={mode} />
      </BrowserRouter>
    );
  };

  it('renders login form correctly', () => {
    renderAuth('login');
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles login submission', async () => {
    vi.mocked(auth.signInWithPassword).mockResolvedValue({
      user: { id: '123', email: 'test@example.com' }
    });

    renderAuth('login');
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(toast.success).toHaveBeenCalledWith('Welcome back!');
    });
  });

  it('handles login errors', async () => {
    vi.mocked(auth.signInWithPassword).mockRejectedValue(new Error('Invalid credentials'));

    renderAuth('login');
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'wrong' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});