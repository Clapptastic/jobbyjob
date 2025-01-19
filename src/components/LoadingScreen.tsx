import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  error?: string;
  onRetry?: () => void;
}

export default function LoadingScreen({ 
  message = 'Loading your workspace...',
  error,
  onRetry 
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-cyber-gradient flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-cyber-light rounded-lg border border-neon-pink shadow-neon-glow p-6 text-center">
        {error ? (
          <>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-4">
              {error}
            </h1>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-neon-gradient text-white rounded-md shadow-neon-glow hover:opacity-90"
              >
                Try Again
              </button>
            )}
          </>
        ) : (
          <>
            <div className="relative mb-4">
              <Loader2 className="h-12 w-12 text-neon-pink mx-auto animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 bg-neon-cyan rounded-full animate-ping"></div>
              </div>
            </div>
            <p className="text-white text-lg">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}