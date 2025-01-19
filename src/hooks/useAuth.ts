import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { auth } from '../lib/auth';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';
import { supabase } from '../lib/supabase';

const log = logger('useAuth');

export function useAuth() {
  const setUser = useStore((state) => state.setUser);

  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      try {
        return await auth.getSession();
      } catch (error) {
        log.error('Failed to get session:', error);
        return null;
      }
    },
    retry: false,
  });

  const { mutate: signIn, isLoading: isSigningIn } = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return await auth.signIn(email, password);
    },
    onSuccess: (data) => {
      setUser(data.user);
      toast.success('Welcome back!');
    },
    onError: (error: any) => {
      log.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
    },
  });

  const { mutate: signOut, isLoading: isSigningOut } = useMutation({
    mutationFn: async () => {
      return await auth.signOut();
    },
    onSuccess: () => {
      setUser(null);
      toast.success('Signed out successfully');
    },
    onError: (error: any) => {
      log.error('Sign out error:', error);
      toast.error(error.message || 'Failed to sign out');
    },
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return {
    session,
    signIn,
    signOut,
    isAuthenticated: !!session,
    isLoading: isSessionLoading || isSigningIn || isSigningOut
  };
}