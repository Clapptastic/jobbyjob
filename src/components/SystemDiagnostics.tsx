import React, { useState } from 'react';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';

const log = logger('SystemDiagnostics');

export default function SystemDiagnostics() {
  const [status, setStatus] = useState({
    database: false,
    storage: false,
    edgeFunctions: false,
    ai: false
  });

  const checkSystem = async () => {
    try {
      // Check database connection
      const { error: dbError } = await supabase
        .from('profiles')
        .select('count');
      
      // Check storage
      const { error: storageError } = await supabase.storage.listBuckets();
      
      // Check Edge Functions
      const { error: functionError } = await supabase.functions.invoke('parse-resume', {
        body: { text: 'test' }
      });

      // Check AI integration
      const { error: aiError } = await supabase.functions.invoke('calculate-job-match', {
        body: { resume: { test: true }, jobDescription: 'test' }
      });

      setStatus({
        database: !dbError,
        storage: !storageError,
        edgeFunctions: !functionError,
        ai: !aiError
      });
    } catch (error) {
      log.error('System check failed:', error);
      toast.error('Failed to check system status');
    }
  };

  const { refresh } = useAutoRefresh(checkSystem, {
    interval: 30000, // Check every 30 seconds
    immediate: true
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-cyber-darker p-4 rounded-lg border border-neon-cyan">
        <h3 className="text-white font-medium mb-2">System Status</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Database</span>
            <span className={status.database ? 'text-green-500' : 'text-red-500'}>
              {status.database ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Storage</span>
            <span className={status.storage ? 'text-green-500' : 'text-red-500'}>
              {status.storage ? 'Available' : 'Unavailable'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Edge Functions</span>
            <span className={status.edgeFunctions ? 'text-green-500' : 'text-red-500'}>
              {status.edgeFunctions ? 'Running' : 'Stopped'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">AI Integration</span>
            <span className={status.ai ? 'text-green-500' : 'text-red-500'}>
              {status.ai ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}