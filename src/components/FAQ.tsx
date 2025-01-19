import React from 'react';
import { ArrowLeft, Database, Code, CheckCircle2, Copy } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ai } from '../lib/ai';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';

const log = logger('FAQ');

interface FAQProps {
  error?: string;
  sql?: string;
}

export default function FAQ({ error, sql }: FAQProps) {
  const [loading, setLoading] = React.useState(false);
  const [solution, setSolution] = React.useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (error) {
      generateSolution();
    }
  }, [error]);

  const generateSolution = async () => {
    try {
      setLoading(true);
      const completion = await ai.generateDatabaseSolution(error || 'Database error');
      setSolution(completion);
    } catch (err) {
      log.error('Failed to generate solution:', err);
      toast.error('Failed to generate solution');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-cyber-gradient p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-neon-cyan hover:text-neon-pink transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">Database Setup Guide</h1>
        </div>

        {error && (
          <div className="bg-cyber-light rounded-lg p-6 border border-red-500 shadow-neon-glow">
            <h2 className="text-xl font-semibold text-red-500 mb-4">Error Details</h2>
            <pre className="bg-cyber-darker p-4 rounded-lg text-white overflow-x-auto">
              {error}
            </pre>
          </div>
        )}

        <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow">
          <h2 className="text-xl font-semibold text-neon-cyan mb-4">Solution Steps</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-pink"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {solution && (
                <div className="prose prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: solution }} />
                </div>
              )}

              {sql && (
                <div className="relative mt-4">
                  <h3 className="text-lg font-medium text-white mb-2">SQL Fix</h3>
                  <pre className="bg-cyber-darker p-4 rounded-lg text-white overflow-x-auto">
                    {sql}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(sql)}
                    className="absolute top-2 right-2 p-2 text-neon-cyan hover:text-neon-pink transition-colors"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                  className="flex items-center px-4 py-2 bg-neon-gradient text-white rounded-md shadow-neon-glow hover:opacity-90"
                >
                  <Database className="h-5 w-5 mr-2" />
                  Open Supabase Dashboard
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center px-4 py-2 border border-neon-cyan text-neon-cyan rounded-md hover:bg-cyber-darker transition-colors"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}