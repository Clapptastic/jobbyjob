import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import logger from '../lib/logger';

const log = logger('ApproveAccess');

export default function ApproveAccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const navigate = useNavigate();

  useEffect(() => {
    const approveAccess = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) throw new Error('Invalid approval token');

        const { data, error } = await supabase
          .rpc('approve_access_request', { token });

        if (error) throw error;

        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        log.error('Access approval failed:', error);
        setStatus('error');
      }
    };

    approveAccess();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-cyber-gradient flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-cyber-light rounded-lg border border-neon-pink shadow-neon-glow p-6 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 text-neon-pink mx-auto animate-spin mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              Processing Access Request
            </h1>
            <p className="text-gray-400">
              Please wait while we approve the access request...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              Access Approved
            </h1>
            <p className="text-gray-400">
              The user can now create an account. Redirecting to login...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              Approval Failed
            </h1>
            <p className="text-gray-400 mb-4">
              Failed to approve access request. The token may be invalid or expired.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-neon-gradient text-white rounded-md shadow-neon-glow hover:opacity-90"
            >
              Return Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}