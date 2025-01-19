import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Database, AlertCircle, Loader2, ExternalLink, RefreshCw, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { supabase, checkConnection, verifyCredentialsFormat, storeCredentials, getStoredCredentials } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';

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
            'Project URL must be https://<project>.supabase.co',
            'Anon key must start with eyJ',
            'Service role key (if provided) must start with eyJ',
            'Copy credentials directly from Supabase dashboard'
          ]
        });
        return;
      }

      // Store credentials securely
      try {
        const stored = storeCredentials(url, anonKey, serviceKey);
        if (!stored) {
          throw new Error('Failed to store credentials securely');
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
          'Verify your credentials in the dashboard',
          'Ensure your project is active',
          'Try again in a few moments'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains unchanged...
}