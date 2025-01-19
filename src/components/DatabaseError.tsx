import React from 'react';
import { Database, RefreshCw, AlertCircle, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DatabaseErrorProps {
  error: string;
  onRetry: () => void;
}

export default function DatabaseError({ error, onRetry }: DatabaseErrorProps) {
  const navigate = useNavigate();

  const handleShowInstructions = () => {
    navigate('/faq', { 
      state: { 
        error,
        sql: localStorage.getItem('lastDatabaseError')
      }
    });
  };

  return (
    <div className="min-h-screen bg-cyber-gradient flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-cyber-light rounded-lg border border-neon-pink shadow-neon-glow p-6 text-center">
        <Database className="h-12 w-12 text-neon-pink mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white mb-4">
          Database Connection Error
        </h1>
        <p className="text-gray-400 mb-6">
          {error}
        </p>
        <div className="space-y-4">
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center px-4 py-2 bg-neon-gradient text-white rounded-md shadow-neon-glow hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Database
          </button>
          
          <button
            onClick={handleShowInstructions}
            className="w-full flex items-center justify-center px-4 py-2 border border-neon-cyan text-neon-cyan rounded-md hover:bg-cyber-darker transition-colors"
          >
            <Code className="h-4 w-4 mr-2" />
            Show Setup Instructions
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-400 mt-4">
            <AlertCircle className="h-4 w-4 text-neon-pink" />
            <p>
              Check the FAQ for detailed setup instructions and common solutions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}