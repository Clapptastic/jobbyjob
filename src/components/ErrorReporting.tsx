import React, { useState } from 'react';
import { AlertCircle, Bug, Camera, Copy, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

export default function ErrorReporting({ error }: { error?: Error }) {
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useStore((state) => state.user);

  // Auto-capture error details
  const errorDetails = {
    message: error?.message || '',
    stack: error?.stack || '',
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  const handleScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ preferCurrentTab: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      
      const screenshot = canvas.toDataURL('image/png');
      setScreenshot(screenshot);
      
      stream.getTracks().forEach(track => track.stop());
      toast.success('Screenshot captured!');
    } catch (error) {
      toast.error('Failed to capture screenshot');
    }
  };

  const copyErrorDetails = () => {
    const details = JSON.stringify(errorDetails, null, 2);
    navigator.clipboard.writeText(details);
    toast.success('Error details copied to clipboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const report = {
        user_id: user?.id,
        error_details: errorDetails,
        description,
        steps_to_reproduce: steps,
        screenshot,
        severity: error ? 'error' : 'bug',
      };

      await fetch('/api/error-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });

      toast.success('Report submitted successfully! Our team will investigate.');
      setDescription('');
      setSteps('');
      setScreenshot(null);
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow">
      <div className="flex items-center gap-2 mb-6">
        <Bug className="h-6 w-6 text-neon-pink" />
        <h2 className="text-xl font-semibold text-neon-cyan">
          Report an Issue
        </h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-cyber-darker rounded-lg border border-neon-pink">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-neon-pink" />
              <p className="text-sm font-medium text-white">Error Detected</p>
            </div>
            <button
              onClick={copyErrorDetails}
              className="inline-flex items-center text-xs text-neon-cyan hover:text-neon-pink"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy Details
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-400 font-mono break-all">
            {error.message}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            What happened?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you were trying to do and what went wrong..."
            className="w-full h-32 rounded-md bg-cyber-darker border-neon-pink focus:border-neon-cyan text-white placeholder-gray-500 focus:ring-1 focus:ring-neon-cyan transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Steps to Reproduce
          </label>
          <textarea
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="1. First, I clicked on...
2. Then, I entered...
3. Finally, I tried to..."
            className="w-full h-32 rounded-md bg-cyber-darker border-neon-pink focus:border-neon-cyan text-white placeholder-gray-500 focus:ring-1 focus:ring-neon-cyan transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-white">
              Screenshot
            </label>
            <button
              type="button"
              onClick={handleScreenshot}
              className="inline-flex items-center px-3 py-1 text-xs bg-cyber-darker text-neon-cyan border border-neon-cyan rounded-md hover:bg-cyber-light transition-colors"
            >
              <Camera className="h-4 w-4 mr-1" />
              Capture Screen
            </button>
          </div>
          {screenshot && (
            <div className="relative mt-2 rounded-lg overflow-hidden">
              <img
                src={screenshot}
                alt="Screenshot"
                className="w-full h-auto rounded-lg"
              />
              <button
                type="button"
                onClick={() => setScreenshot(null)}
                className="absolute top-2 right-2 p-1 bg-cyber-darker rounded-full text-neon-pink hover:text-white transition-colors"
              >
                <AlertCircle className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-gray-400">
            Our team will investigate and get back to you soon
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 bg-neon-gradient text-sm font-medium rounded-md text-white shadow-neon-glow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:ring-offset-2 focus:ring-offset-cyber-dark transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}