import { describe, it, expect, vi } from 'vitest';
import { auth } from '../lib/auth';
import { supabase } from '../lib/supabase';

describe('Auth', () => {
  it('should sign in user successfully', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({
      data: { user: mockUser, session: {} },
      error: null
    });

    const result = await auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(result.user).toEqual(mockUser);
  });

  it('should handle sign in errors', async () => {
    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' }
    });

    await expect(auth.signInWithPassword({
      email: 'test@example.com',
      password: 'wrong'
    })).rejects.toThrow('Invalid credentials');
  });

  it('should sign up user successfully', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    vi.spyOn(supabase.auth, 'signUp').mockResolvedValue({
      data: { user: mockUser, session: {} },
      error: null
    });

    const result = await auth.signUp({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(result.user).toEqual(mockUser);
  });
});