import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

export default function ProcessingTimeInfo() {
  return (
    <div className="bg-cyber-darker rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 text-neon-pink mb-4">
        <Clock className="h-5 w-5" />
        <span className="text-sm font-medium">Processing Time Information</span>
      </div>
      <div className="space-y-3 text-sm text-gray-400">
        <p>
          <span className="text-neon-cyan">Average Processing Time:</span> 2-3 minutes
        </p>
        <p>
          <span className="text-neon-cyan">Steps Breakdown:</span>
        </p>
        <ul className="list-disc list-inside pl-4 space-y-2">
          <li>Resume Analysis: ~30 seconds</li>
          <li>Job Search: ~1 minute</li>
          <li>Match Analysis: ~1 minute per 10 jobs</li>
          <li>Saving Results: ~15 seconds</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 text-neon-pink">
          <AlertCircle className="h-4 w-4" />
          <p>Processing time may vary based on the number of jobs found and system load.</p>
        </div>
      </div>
    </div>
  );
}