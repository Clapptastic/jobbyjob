import React, { useState } from 'react';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { auth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface AuthFormProps {
  mode: 'login' | 'signup' | 'reset';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await auth.signUp(email, password);
        navigate('/auth/verify');
      } else if (mode === 'login') {
        await auth.signIn(email, password);
        navigate('/dashboard');
      } else if (mode === 'reset') {
        await auth.resetPassword(email);
        navigate('/auth/check-email');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-gradient flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-cyber-light p-8 rounded-lg border border-neon-pink shadow-neon-glow">
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
                    minLength={8}
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neon-pink" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-neon-pink rounded-md bg-cyber-darker text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-transparent"
                    placeholder="Confirm Password"
                    minLength={8}
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
                <button
                  type="button"
                  onClick={() => navigate('/auth/signup')}
                  className="text-neon-cyan hover:text-neon-pink transition-colors"
                >
                  Create account
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/auth/reset')}
                  className="text-neon-cyan hover:text-neon-pink transition-colors"
                >
                  Forgot password?
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="text-neon-cyan hover:text-neon-pink transition-colors"
              >
                Back to login
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}