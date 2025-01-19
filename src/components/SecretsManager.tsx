import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Database, AlertCircle, Loader2, ExternalLink, RefreshCw, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { supabase, checkConnection, verifyCredentialsFormat, storeCredentials, getStoredCredentials, reinitialize } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';
import { saveToEnvFile } from '../lib/saveEnv';

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
  const isDocker = import.meta.env.VITE_DOCKER === 'true';
  
  // Get stored credentials
  const storedCreds = getStoredCredentials();
  const [url, setUrl] = useState(storedCreds.url);
  const [anonKey, setAnonKey] = useState(storedCreds.anonKey);
  const [serviceKey, setServiceKey] = useState(storedCreds.serviceKey);

  useEffect(() => {
    // Show help by default in Docker environment
    if (isDocker) {
      setShowHelp(true);
    }
  }, []);

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
            'Project URL must be https://<project>.supabase.co',
            'Anon key must start with eyJ',
            'Service role key (if provided) must start with eyJ',
            'Copy credentials directly from Supabase dashboard'
          ]
        });
        return;
      }

      // In Docker mode, we need to set the environment variables
      if (isDocker) {
        // Log the credentials being used
        log.info('Using credentials in Docker mode:', {
          url: url.substring(0, 20) + '...',
          anonKey: 'provided',
          serviceKey: serviceKey ? 'provided' : 'not provided'
        });

        // Set environment variables
        import.meta.env.VITE_SUPABASE_URL = url;
        import.meta.env.VITE_SUPABASE_ANON_KEY = anonKey;
        if (serviceKey) {
          import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY = serviceKey;
        }
      } else {
        // Store credentials securely in non-Docker mode
        try {
          const stored = storeCredentials(url, anonKey, serviceKey);
          if (!stored) {
            throw new Error('Failed to store credentials securely');
          }

          // In development mode, save to .env file
          if (import.meta.env.DEV) {
            try {
              await saveToEnvFile({ url, anonKey, serviceKey });
              toast.success('Credentials saved to .env file');
            } catch (error) {
              log.error('Failed to save to .env file:', error);
              toast.error('Failed to save credentials to .env file');
            }
          }
        } catch (error: any) {
          setError({
            type: 'credentials',
            message: 'Failed to store credentials',
            details: error.message,
            solution: [
              'Clear browser storage and try again',
              'Use a different browser',
              'Check browser storage permissions'
            ]
          });
          return;
        }
      }

      // Initialize Supabase client
      const client = reinitialize();
      if (!client) {
        throw new Error('Failed to initialize Supabase client');
      }

      // Test connection with retry
      let isConnected = false;
      for (let i = 0; i < 3; i++) {
        try {
          isConnected = await checkConnection();
          if (isConnected) break;
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        } catch (error) {
          if (i === 2) throw error;
          continue;
        }
      }

      if (!isConnected) {
        throw new Error('Failed to connect to Supabase. Please check your credentials and try again.');
      }

      // Mark as configured only in non-Docker environment
      if (!isDocker) {
        localStorage.setItem('secretsConfigured', 'true');
      }
      
      toast.success('Successfully connected to Supabase!');
      navigate('/dashboard');
    } catch (error: any) {
      log.error('Connection failed:', error);
      
      // Clear invalid credentials only in non-Docker environment
      if (!isDocker) {
        localStorage.removeItem('VITE_SUPABASE_URL');
        localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
        localStorage.removeItem('VITE_SUPABASE_SERVICE_ROLE_KEY');
        localStorage.removeItem('secretsConfigured');
      }

      setError({
        type: 'unknown',
        message: error.message || 'Failed to connect to Supabase',
        solution: [
          'Check your Supabase project status',
          'Verify your credentials in the dashboard',
          'Ensure your project is active',
          'Try again in a few moments'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center space-x-2">
          <Database className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl font-bold">Database Configuration</h1>
        </div>

        <form onSubmit={handleConnect} className="mt-8 space-y-6">
          <div>
            <label htmlFor="supabase-url" className="block text-sm font-medium text-gray-700 mb-1">
              Project URL
            </label>
            <div className="relative">
              <input
                id="supabase-url"
                name="supabase-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                aria-describedby="url-help"
              />
            </div>
            <p id="url-help" className="mt-1 text-sm text-gray-500">
              Your Supabase project URL from the dashboard
            </p>
          </div>

          <div>
            <label htmlFor="anon-key" className="block text-sm font-medium text-gray-700 mb-1">
              Anon/Public Key
            </label>
            <div className="relative">
              <input
                id="anon-key"
                name="anon-key"
                type={showAnonKey ? 'text' : 'password'}
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="your-anon-key"
                className="block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                aria-describedby="anon-key-help"
              />
              <button
                type="button"
                onClick={() => setShowAnonKey(!showAnonKey)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                aria-label={showAnonKey ? "Hide anon key" : "Show anon key"}
              >
                {showAnonKey ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            <p id="anon-key-help" className="mt-1 text-sm text-gray-500">
              Your project's anon/public key from the API settings
            </p>
          </div>

          <div>
            <label htmlFor="service-key" className="block text-sm font-medium text-gray-700 mb-1">
              Service Role Key (Optional)
            </label>
            <div className="relative">
              <input
                id="service-key"
                name="service-key"
                type={showServiceKey ? 'text' : 'password'}
                value={serviceKey}
                onChange={(e) => setServiceKey(e.target.value)}
                placeholder="your-service-role-key"
                className="block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-describedby="service-key-help"
              />
              <button
                type="button"
                onClick={() => setShowServiceKey(!showServiceKey)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                aria-label={showServiceKey ? "Hide service key" : "Show service key"}
              >
                {showServiceKey ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            <p id="service-key-help" className="mt-1 text-sm text-gray-500">
              Optional: Your project's service role key for admin access
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-500"
              aria-label={showHelp ? "Hide help" : "Show help"}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              {showHelp ? 'Hide Help' : 'Need Help?'}
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={loading ? "Connecting..." : "Connect to Database"}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Terminal className="h-4 w-4 mr-2" />
                  Connect
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-sm">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-red-500 font-medium">{error.message}</p>
                {error.details && (
                  <p className="text-red-400/80">{error.details}</p>
                )}
                {error.solution && (
                  <ul className="list-disc list-inside text-red-400/60 space-y-0.5">
                    {error.solution.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Help Panel */}
        {showHelp && (
          <div className="bg-cyber-dark rounded-lg p-4 text-sm text-gray-300 space-y-2">
            <p>To connect to your Supabase database:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to your Supabase project dashboard</li>
              <li>Navigate to Project Settings → API</li>
              <li>Copy the Project URL and anon/public key</li>
              <li>Paste them in the fields below</li>
            </ol>
            {isDocker && (
              <div className="mt-4 p-2 bg-cyber-light rounded">
                <p className="text-neon-cyan font-medium">Docker Environment Detected</p>
                <p className="text-sm mt-1">
                  You can also set these values using environment variables:
                </p>
                <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                  <li>VITE_SUPABASE_URL</li>
                  <li>VITE_SUPABASE_ANON_KEY</li>
                  <li>VITE_SUPABASE_SERVICE_ROLE_KEY (optional)</li>
                </ul>
              </div>
            )}
            <button
              onClick={handleOpenSupabase}
              className="flex items-center space-x-1 text-neon-cyan hover:text-neon-pink transition-colors mt-2"
            >
              <span>Open Supabase Dashboard</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}