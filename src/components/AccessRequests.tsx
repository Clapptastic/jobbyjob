import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { email } from '../lib/email';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';

const log = logger('AccessRequests');

interface AccessRequest {
  id: string;
  email: string;
  company: string;
  reason: string;
  status: string;
  created_at: string;
}

export default function AccessRequests() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      log.error('Failed to load access requests:', error);
      toast.error('Failed to load access requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: AccessRequest) => {
    try {
      setProcessing(request.id);

      const { error: updateError } = await supabase
        .from('access_requests')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', request.id);

      if (updateError) throw updateError;

      await email.sendAccessApproval(request.email, request.id);
      
      toast.success('Access request approved');
      loadRequests();
    } catch (error) {
      log.error('Failed to approve access request:', error);
      toast.error('Failed to approve access request');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (request: AccessRequest) => {
    try {
      setProcessing(request.id);

      const { error: updateError } = await supabase
        .from('access_requests')
        .update({ status: 'rejected' })
        .eq('id', request.id);

      if (updateError) throw updateError;

      toast.success('Access request rejected');
      loadRequests();
    } catch (error) {
      log.error('Failed to reject access request:', error);
      toast.error('Failed to reject access request');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 text-neon-pink animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-5 w-5 text-neon-pink" />
        <h2 className="text-xl font-semibold text-neon-cyan">Access Requests</h2>
      </div>

      {requests.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No pending access requests</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-cyber-darker p-4 rounded-lg border border-neon-cyan"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-medium">{request.email}</h3>
                  <p className="text-sm text-gray-400">{request.company}</p>
                  <p className="text-sm text-gray-400 mt-2">{request.reason}</p>
                </div>
                {request.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request)}
                      disabled={!!processing}
                      className="p-2 text-green-500 hover:text-green-400 disabled:opacity-50"
                    >
                      {processing === request.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(request)}
                      disabled={!!processing}
                      className="p-2 text-red-500 hover:text-red-400 disabled:opacity-50"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <span className={`text-sm ${
                    request.status === 'approved' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {request.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}