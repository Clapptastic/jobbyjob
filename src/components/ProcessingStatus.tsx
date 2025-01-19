import React from 'react';
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Step {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  error?: string;
}

interface ProcessingStatusProps {
  startTime: Date;
  estimatedEndTime: Date | null;
  progress: number;
  status: 'processing' | 'complete' | 'error';
  error?: string | null;
  steps: Step[];
}

export default function ProcessingStatus({ 
  startTime, 
  estimatedEndTime, 
  progress, 
  status,
  error,
  steps 
}: ProcessingStatusProps) {
  return (
    <div className="bg-cyber-darker rounded-lg p-4 border border-neon-cyan">
      {/* Overall Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {status === 'processing' && (
            <Loader2 className="h-5 w-5 text-neon-cyan animate-spin" />
          )}
          {status === 'complete' && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {status === 'error' && (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span className="text-white font-medium capitalize">{status}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            Started {formatDistanceToNow(startTime)} ago
          </div>
          {estimatedEndTime && status === 'processing' && (
            <div className="flex items-center gap-2 text-sm text-neon-cyan">
              <Clock className="h-4 w-4" />
              <span>~{formatDistanceToNow(estimatedEndTime)} remaining</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-cyber-light rounded-full overflow-hidden">
          <div 
            className="h-full bg-neon-gradient transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-sm">
          <span className="text-neon-cyan">{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Processing Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`relative pl-8 ${
              step.status === 'pending' ? 'opacity-50' : 'opacity-100'
            }`}
          >
            {/* Step Indicator */}
            <div className="absolute left-0 top-0">
              {step.status === 'complete' && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {step.status === 'error' && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {step.status === 'processing' && (
                <Loader2 className="h-5 w-5 text-neon-cyan animate-spin" />
              )}
              {step.status === 'pending' && (
                <div className="h-5 w-5 rounded-full border-2 border-gray-400" />
              )}
            </div>

            {/* Step Content */}
            <div>
              <h4 className="text-white font-medium">{step.name}</h4>
              <p className="text-sm text-gray-400">{step.description}</p>
              {step.error && (
                <p className="text-sm text-red-500 mt-1">{step.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-md">
          <div className="flex items-center gap-2 text-red-500">
            <XCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}