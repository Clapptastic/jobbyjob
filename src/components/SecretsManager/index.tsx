import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Database, AlertCircle, Loader2, ExternalLink, RefreshCw, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { supabase, checkConnection, verifyCredentialsFormat, storeCredentials } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import logger from '../../lib/logger';

const log = logger('SecretsManager');

interface ConnectionError {
  type: 'credentials' | 'network' | 'storage' | 'unknown';
  message: string;
  details?: string;
  solution?: string[];
}

export default function SecretsManager() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ConnectionError | null>(null);
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [showServiceKey, setShowServiceKey] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Get stored credentials
  const storedCreds = getStoredCredentials();
  const [url, setUrl] = useState(storedCreds.url);
  const [anonKey, setAnonKey] = useState(storedCreds.anonKey);
  const [serviceKey, setServiceKey] = useState(storedCreds.serviceKey);

  const handleOpenSupabase = () => {
    window.open('https://supabase.com/dashboard/project/_/settings/api', '_blank');
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate credentials format
      const issues = verifyCredentialsFormat(url, anonKey, serviceKey);
      if (issues.length > 0) {
        setError({
          type: 'credentials',
          message: 'Invalid Credentials Format',
          details: issues.join('\n'),
          solution: [
            'Check your Supabase project URL format',
            'Verify your API key formats',
            'Copy credentials directly from Supabase dashboard'
          ]
        });
        return;
      }

      // Store credentials securely
      const stored = storeCredentials(url, anonKey, serviceKey);
      if (!stored) {
        throw new Error('Failed to store credentials securely');
      }

      // Test connection with retry
      let isConnected = false;
      for (let i = 0; i < 3; i++) {
        isConnected = await checkConnection();
        if (isConnected) break;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }

      if (!isConnected) {
        throw new Error('Failed to connect to Supabase. Please check your credentials.');
      }

      // Mark as configured
      localStorage.setItem('secretsConfigured', 'true');
      
      toast.success('Successfully connected to Supabase!');
      navigate('/dashboard');
    } catch (error: any) {
      log.error('Connection failed:', error);
      
      // Clear invalid credentials
      localStorage.removeItem('VITE_SUPABASE_URL');
      localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
      localStorage.removeItem('VITE_SUPABASE_SERVICE_ROLE_KEY');
      localStorage.removeItem('secretsConfigured');

      setError({
        type: 'unknown',
        message: error.message || 'Failed to connect to Supabase',
        solution: [
          'Check your Supabase project status',
          'Verify your credentials',
          'Try again in a few moments'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-gradient flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-cyber-light rounded-lg border border-neon-pink shadow-neon-glow p-6">
        {/* Logo and title section */}
        <div className="text-center mb-8">
          <div className="arcade-logo">
            <div>
              <span className="text-neon-pink">CLAPP</span>
              <span className="text-neon-cyan">CODE</span>
            </div>
            <div className="text-sm text-neon-purple mt-1">Sail right in</div>
          </div>
        </div>

        {/* Header section */}
        <div className="flex items-center gap-3 mb-6">
          <Terminal className="h-6 w-6 text-neon-pink" />
          <h1 className="text-2xl font-bold text-white">
            Connect to Supabase
          </h1>
        </div>

        {/* Main content */}
        <div className="space-y-6">
          {/* Error display */}
          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-md p-3">
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">{error.message}</p>
                  {error.details && <p className="mt-1 text-xs">{error.details}</p>}
                  {error.solution && (
                    <ul className="mt-2 list-disc list-inside text-xs space-y-1">
                      {error.solution.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick setup guide */}
          <div className="bg-cyber-darker p-4 rounded-lg border border-neon-cyan">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium text-white">Quick Setup</h2>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="p-1 text-neon-cyan hover:text-neon-pink transition-colors"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
            </div>
            {showHelp ? (
              <ol className="list-decimal list-inside space-y-2 text-gray-400">
                <li>Click the button below to open Supabase API settings</li>
                <li>Copy your project URL from "Project URL"</li>
                <li>Copy anon/public key from "Project API keys"</li>
                <li>Copy service role key from "Project API keys"</li>
                <li>Paste the values in the fields below</li>
              </ol>
            ) : (
              <button
                onClick={handleOpenSupabase}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-cyber-light text-neon-cyan border border-neon-cyan rounded-md hover:bg-cyber-darker transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open Supabase API Settings
              </button>
            )}
          </div>

          {/* Credentials input */}
          <div className="space-y-4">
            {/* Project URL */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Project URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2 bg-cyber-darker border rounded-md text-white border-neon-pink focus:border-neon-cyan focus:outline-none"
              />
            </div>

            {/* Anon Key */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Anon/Public Key
              </label>
              <div className="relative">
                <input
                  type={showAnonKey ? "text" : "password"}
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="your-anon-key"
                  className="w-full px-3 py-2 bg-cyber-darker border rounded-md text-white border-neon-pink focus:border-neon-cyan focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowAnonKey(!showAnonKey)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neon-cyan hover:text-neon-pink"
                >
                  {showAnonKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Service Role Key */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Service Role Key (Optional)
              </label>
              <div className="relative">
                <input
                  type={showServiceKey ? "text" : "password"}
                  value={serviceKey}
                  onChange={(e) => setServiceKey(e.target.value)}
                  placeholder="your-service-role-key"
                  className="w-full px-3 py-2 bg-cyber-darker border rounded-md text-white border-neon-pink focus:border-neon-cyan focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowServiceKey(!showServiceKey)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neon-cyan hover:text-neon-pink"
                >
                  {showServiceKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Connect button */}
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-neon-gradient text-white rounded-md shadow-neon-glow hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Database className="h-5 w-5" />
                Connect to Supabase
              </>
            )}
          </button>

          {/* Help text */}
          <div className="text-sm text-gray-400">
            <p>Need help? Check out the <a href="https://supabase.com/docs/guides/api" target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:text-neon-pink">API documentation</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}