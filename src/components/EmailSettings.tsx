import React, { useState, useEffect } from 'react';
import { Mail, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { email } from '../lib/email';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';

const log = logger('EmailSettings');

export default function EmailSettings() {
  const [provider, setProvider] = useState('sendgrid');
  const [apiKey, setApiKey] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const config = await email.getConfig();
      if (config) {
        setProvider(config.provider);
        setFromEmail(config.from_email);
        setFromName(config.from_name);
      }
    } catch (error) {
      log.error('Failed to load email config:', error);
      toast.error('Failed to load email configuration');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Validate inputs
      if (!fromEmail || !fromName) {
        throw new Error('Please fill in all required fields');
      }

      if (provider !== 'supabase' && !apiKey) {
        throw new Error('API key is required for external email providers');
      }

      // Validate API key format
      if (provider === 'sendgrid' && !apiKey.startsWith('SG.')) {
        throw new Error('Invalid SendGrid API key format');
      }
      if (provider === 'mandrill' && !apiKey.startsWith('md-')) {
        throw new Error('Invalid Mandrill API key format');
      }

      // Setup SMTP configuration
      const { error } = await supabase.rpc('setup_smtp_auth', {
        p_provider: provider,
        p_api_key: apiKey,
        p_from_email: fromEmail,
        p_from_name: fromName
      });

      if (error) throw error;

      toast.success('Email configuration saved successfully');
      setApiKey(''); // Clear API key for security

      // Verify configuration
      const isVerified = await email.verifyConfiguration();
      if (!isVerified) {
        toast.warn('Email configuration saved but verification failed');
      }
    } catch (error: any) {
      log.error('Failed to save email config:', error);
      toast.error(error.message || 'Failed to save email configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setTestStatus('loading');
      const success = await email.verifyConfiguration();
      
      if (success) {
        setTestStatus('success');
        toast.success('Test email sent successfully');
      } else {
        throw new Error('Email verification failed');
      }
    } catch (error) {
      log.error('Failed to send test email:', error);
      setTestStatus('error');
      toast.error('Failed to send test email');
    } finally {
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  return (
    <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow">
      <div className="flex items-center gap-2 mb-6">
        <Mail className="h-5 w-5 text-neon-pink" />
        <h2 className="text-xl font-semibold text-neon-cyan">Email Configuration</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Email Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full rounded-md bg-cyber-darker border-neon-pink focus:border-neon-cyan text-white"
          >
            <option value="sendgrid">SendGrid</option>
            <option value="mandrill">Mandrill</option>
            <option value="supabase">Supabase (Default)</option>
          </select>
        </div>

        {provider !== 'supabase' && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your ${provider} API key`}
              className="w-full rounded-md bg-cyber-darker border-neon-pink focus:border-neon-cyan text-white"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            From Email
          </label>
          <input
            type="email"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="noreply@yourdomain.com"
            className="w-full rounded-md bg-cyber-darker border-neon-pink focus:border-neon-cyan text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            From Name
          </label>
          <input
            type="text"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="ClappCode"
            className="w-full rounded-md bg-cyber-darker border-neon-pink focus:border-neon-cyan text-white"
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            onClick={handleTestEmail}
            disabled={testStatus === 'loading'}
            className="inline-flex items-center px-4 py-2 bg-cyber-darker text-neon-cyan border border-neon-cyan rounded-md hover:bg-cyber-light transition-colors disabled:opacity-50"
          >
            {testStatus === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : testStatus === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : testStatus === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              'Send Test Email'
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-neon-gradient text-white rounded-md shadow-neon-glow hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}