import React from 'react';
import { HelpCircle, Loader2, CheckCircle } from 'lucide-react';

interface VerificationButtonProps {
  verifying: boolean;
  verified: boolean;
  onVerify: () => Promise<void>;
}

export default function VerificationButton({ verifying, verified, onVerify }: VerificationButtonProps) {
  return (
    <button
      onClick={onVerify}
      disabled={verifying}
      className="w-full flex justify-center py-2 px-4 border border-neon-cyan rounded-md shadow-sm text-sm font-medium text-white hover:bg-cyber-darker transition-colors disabled:opacity-50"
    >
      {verifying ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : verified ? (
        <>
          <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
          Credentials Verified
        </>
      ) : (
        <>
          <HelpCircle className="h-5 w-5 mr-2" />
          Verify Credentials
        </>
      )}
    </button>
  );
}