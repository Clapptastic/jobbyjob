import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { auth } from '../lib/auth';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';
import { supabase } from '../lib/supabaseClient';

const log = logger('Auth');

interface AuthProps {
  mode: 'login' | 'signup' | 'reset';
  onSuccess?: () => void;
}

export default function Auth({ mode = 'login', onSuccess }: AuthProps) {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { user } = await auth.signInWithPassword({ email, password });
        if (user) {
          setUser(user);
          toast.success('Welcome back!');
          navigate('/dashboard');
          if (onSuccess) {
            onSuccess();
          }
        }
      } else if (mode === 'signup') {
        const { user } = await auth.signUp({ email, password });
        if (user) {
          toast.success('Account created! Please check your email to verify.');
          navigate('/login');
        }
      } else if (mode === 'reset') {
        await auth.resetPasswordForEmail(email);
        toast.success('Password reset instructions sent to your email');
        navigate('/login');
      }
    } catch (error: any) {
      log.error('Authentication error:', error);
      
      // Handle specific error cases
      if (error.code === 'user_already_exists') {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (error.code === 'invalid_credentials') {
        setError('Invalid email or password.');
      } else if (error.code === 'too_many_attempts') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(error.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-gradient flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-cyber-light p-8 rounded-lg border border-neon-pink shadow-neon-glow">
        <div className="text-center">
          <div className="arcade-logo text-3xl font-bold mb-2">
            <div>
              <span className="text-neon-pink">CLAPP</span>
              <span className="text-neon-cyan">CODE</span>
            </div>
            <div className="text-sm text-neon-purple mt-1">Sail right in</div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {mode === 'login'
              ? 'Welcome back!'
              : mode === 'signup'
              ? 'Create your account to get started'
              : 'Enter your email to reset your password'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-md p-3">
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neon-pink" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-neon-pink rounded-md bg-cyber-darker text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-transparent"
                  placeholder="Email address"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neon-pink" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-neon-pink rounded-md bg-cyber-darker text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-transparent"
                    placeholder="Password"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neon-gradient hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-pink disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : mode === 'login' ? (
                'Sign In'
              ) : mode === 'signup' ? (
                'Create Account'
              ) : (
                'Reset Password'
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            {mode === 'login' ? (
              <>
                <Link
                  to="/signup"
                  className="text-neon-cyan hover:text-neon-pink transition-colors"
                >
                  Create account
                </Link>
                <Link
                  to="/reset-password"
                  className="text-neon-cyan hover:text-neon-pink transition-colors"
                >
                  Forgot password?
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center text-neon-cyan hover:text-neon-pink transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}