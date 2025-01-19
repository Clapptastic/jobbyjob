import React from 'react';
import { Database, RefreshCw, AlertTriangle, Code, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';

const log = logger('DatabaseErrorModal');

interface DatabaseErrorModalProps {
  error: string;
  onClose: () => void;
  onRetry: () => void;
}

export default function DatabaseErrorModal({ error, onClose, onRetry }: DatabaseErrorModalProps) {
  const [resetting, setResetting] = React.useState(false);
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      setResetting(true);
      await api.resetDatabase();
      toast.success('Database reset successfully');
      onRetry();
    } catch (error: any) {
      log.error('Database reset failed:', error);
      toast.error(error.message || 'Failed to reset database');
    } finally {
      setResetting(false);
    }
  };

  const handleShowInstructions = () => {
    navigate('/faq', { 
      state: { 
        error,
        sql: localStorage.getItem('lastDatabaseError')
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-cyber-light rounded-lg border border-neon-pink shadow-neon-glow max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="h-6 w-6 text-neon-pink" />
          <h2 className="text-xl font-semibold text-white">Database Error</h2>
        </div>

        <div className="bg-cyber-darker rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <p className="font-medium">Error Details</p>
          </div>
          <p className="text-gray-300 break-words">{error}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Terminal className="h-5 w-5" />
            <p className="text-sm">Choose an action to resolve the issue:</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center justify-center px-4 py-2 bg-neon-gradient text-white rounded-md shadow-neon-glow hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {resetting ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Resetting Database...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Reset Database
                </>
              )}
            </button>

            <button
              onClick={handleShowInstructions}
              className="flex items-center justify-center px-4 py-2 border border-neon-cyan text-neon-cyan rounded-md hover:bg-cyber-darker transition-colors"
            >
              <Code className="h-5 w-5 mr-2" />
              Show Manual Instructions
            </button>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}