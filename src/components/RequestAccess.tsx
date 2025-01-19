import React, { useState } from 'react';
import { Mail, Briefcase, Send, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';

const log = logger('RequestAccess');

export default function RequestAccess() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Database not initialized');
      }

      // Validate input
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      if (!company.trim()) {
        throw new Error('Please enter your company name');
      }
      if (!reason.trim()) {
        throw new Error('Please provide a reason for access');
      }

      // Check if request already exists
      const { data: existing, error: checkError } = await supabase
        .from('access_requests')
        .select('status')
        .eq('email', email)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existing) {
        switch (existing.status) {
          case 'approved':
            throw new Error('Access already approved. Please proceed to sign up.');
          case 'pending':
            throw new Error('Access request already pending. Please wait for approval.');
          case 'rejected':
            throw new Error('Previous request was denied. Please contact support.');
        }
      }

      // Submit new request
      const { error: insertError } = await supabase
        .from('access_requests')
        .insert([{
          email,
          company,
          reason,
          status: 'pending'
        }]);

      if (insertError) {
        throw insertError;
      }

      toast.success('Access request submitted! You will receive an email when approved.');
      navigate('/login');

    } catch (error: any) {
      log.error('Access request failed:', error);
      toast.error(error.message || 'Failed to submit access request');
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
          <h2 className="text-3xl font-bold text-white">Request Access</h2>
          <p className="mt-2 text-sm text-gray-400">
            Submit your details to request access to ClappCode
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neon-pink" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-neon-pink rounded-md bg-cyber-darker text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-transparent"
                  placeholder="Email address"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="company" className="sr-only">Company</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neon-pink" />
                <input
                  id="company"
                  name="company"
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-neon-pink rounded-md bg-cyber-darker text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-transparent"
                  placeholder="Company name"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="reason" className="sr-only">Reason for access</label>
              <textarea
                id="reason"
                name="reason"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="block w-full p-3 border border-neon-pink rounded-md bg-cyber-darker text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-transparent"
                placeholder="Why do you want access to ClappCode?"
                rows={4}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center text-neon-cyan hover:text-neon-pink transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to login
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neon-gradient hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-pink disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Request Access
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}