import React from 'react';
import { FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Step {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  error?: string;
}

interface ResumeParsingProgressProps {
  steps: Step[];
  currentStep: number;
  progress: number;
}

export default function ResumeParsingProgress({ steps, currentStep, progress }: ResumeParsingProgressProps) {
  return (
    <div className="bg-cyber-darker rounded-lg p-4 border border-neon-cyan">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-neon-cyan" />
        <h3 className="text-white font-medium">Parsing Progress</h3>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Overall Progress</span>
          <span className="text-neon-cyan">{progress}%</span>
        </div>
        <div className="w-full bg-cyber-light rounded-full h-2">
          <div
            className="bg-neon-gradient rounded-full h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`relative pl-8 ${
              index === currentStep ? 'opacity-100' : 'opacity-60'
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
    </div>
  );
}