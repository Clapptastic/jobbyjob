import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Secret } from './types';
import { REQUIRED_SECRETS } from './constants';
import { verifyCredentials as verifyCredentialsUtil } from '../../lib/verifyCredentials';
import { toast } from 'react-hot-toast';
import logger from '../../lib/logger';

const log = logger('SecretsManager');

export function useSecrets() {
  const [secrets, setSecrets] = useState<Secret[]>(REQUIRED_SECRETS);
  const [requireAccessRequest, setRequireAccessRequest] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    initializeState();
  }, []);

  const initializeState = () => {
    try {
      // Clear existing configuration
      localStorage.removeItem('secretsConfigured');
      
      // Load existing values
      const loadedSecrets = REQUIRED_SECRETS.map(secret => ({
        ...secret,
        value: localStorage.getItem(secret.envKey) || secret.value
      }));
      setSecrets(loadedSecrets);
      
      // Load access request setting
      const savedRequireAccess = localStorage.getItem('requireAccessRequest');
      if (savedRequireAccess !== null) {
        setRequireAccessRequest(savedRequireAccess === 'true');
      }
    } catch (error) {
      log.error('Failed to initialize state:', error);
    }
  };

  const validateSecrets = (): boolean => {
    let hasErrors = false;
    const updatedSecrets = secrets.map(secret => {
      // Only validate if required or has a value
      if ((secret.required || secret.value) && secret.validate) {
        const error = secret.validate(secret.value);
        if (error) {
          hasErrors = true;
          return { ...secret, error };
        }
      }
      return { ...secret, error: undefined };
    });

    setSecrets(updatedSecrets);
    return !hasErrors;
  };

  const verifyCredentials = async () => {
    try {
      setVerifying(true);

      // Validate required secrets first
      if (!validateSecrets()) {
        throw new Error('Please fix all validation errors before verifying');
      }

      // Verify credentials
      await verifyCredentialsUtil(secrets);
      setVerified(true);
      toast.success('Credentials verified successfully!');
    } catch (error: any) {
      log.error('Verification failed:', error);
      setVerified(false);
      toast.error(error.message || 'Failed to verify credentials');
      throw error;
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!verified) {
        throw new Error('Please verify your credentials first');
      }

      // Save access request setting
      localStorage.setItem('requireAccessRequest', requireAccessRequest.toString());
      
      // Mark configuration as complete
      localStorage.setItem('secretsConfigured', 'true');

      toast.success('Configuration saved successfully!');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate based on access request setting
      if (requireAccessRequest) {
        navigate('/request-access', { replace: true });
      } else {
        navigate('/signup', { replace: true });
      }
    } catch (error: any) {
      log.error('Failed to save configuration:', error);
      localStorage.removeItem('secretsConfigured');
      toast.error(error.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  return {
    secrets,
    setSecrets,
    requireAccessRequest,
    setRequireAccessRequest,
    saving,
    verifying,
    verified,
    activeTooltip,
    setActiveTooltip,
    verifyCredentials,
    handleSave
  };
}