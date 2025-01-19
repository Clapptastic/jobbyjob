import React, { useState, useEffect } from 'react';
import { Key, Save, Loader2, AlertCircle, ChevronDown, ChevronUp, Plus, X, ExternalLink, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';

const log = logger('ApiKeySettings');

interface APIKey {
  provider: string;
  is_active: boolean;
  created_at: string;
}

const API_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    url: 'https://platform.openai.com/api-keys',
    description: 'Required for job matching and analysis'
  },
  anthropic: {
    name: 'Anthropic',
    url: 'https://console.anthropic.com/account/keys',
    description: 'Alternative AI provider'
  },
  cohere: {
    name: 'Cohere',
    url: 'https://dashboard.cohere.com/api-keys',
    description: 'Alternative AI provider'
  },
  google: {
    name: 'Google AI',
    url: 'https://makersuite.google.com/app/apikey',
    description: 'Alternative AI provider'
  }
};

export default function ApiKeySettings() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddKey, setShowAddKey] = useState(false);
  const [newKeyProvider, setNewKeyProvider] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('provider, is_active, created_at')
        .order('provider');

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      log.error('Failed to load API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = async () => {
    try {
      setSaving(true);

      // Get provider config
      const provider = API_PROVIDERS[newKeyProvider as keyof typeof API_PROVIDERS];
      if (!provider) {
        throw new Error('Invalid provider selected');
      }

      const { error } = await supabase
        .from('api_keys')
        .upsert({
          provider: newKeyProvider,
          key_value: newKeyValue,
          is_active: true,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('API key saved successfully');
      setNewKeyProvider('');
      setNewKeyValue('');
      setShowAddKey(false);
      await loadApiKeys();
    } catch (error: any) {
      log.error('Failed to save API key:', error);
      toast.error(error.message || 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (provider: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: isActive })
        .eq('provider', provider);

      if (error) throw error;
      await loadApiKeys();
      toast.success(`${isActive ? 'Enabled' : 'Disabled'} ${provider}`);
    } catch (error) {
      log.error('Failed to update API key:', error);
      toast.error('Failed to update API key');
    }
  };

  const handleRemoveKey = async (provider: string) => {
    try {
      setRemoving(provider);

      const { error } = await supabase.rpc('remove_api_key', {
        p_provider: provider
      });

      if (error) throw error;

      toast.success('API key removed successfully');
      setShowDeleteConfirm(null);
      await loadApiKeys();
    } catch (error: any) {
      log.error('Failed to remove API key:', error);
      toast.error(error.message || 'Failed to remove API key');
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 text-neon-pink animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-neon-pink" />
          <h2 className="text-xl font-semibold text-neon-cyan">API Keys</h2>
        </div>
        <div className="flex items-center gap-4">
          {apiKeys.length > 0 && (
            <span className="text-sm text-neon-cyan">
              {apiKeys.filter(k => k.is_active).length} Active Key{apiKeys.filter(k => k.is_active).length !== 1 ? 's' : ''}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-neon-cyan" />
          ) : (
            <ChevronDown className="h-5 w-5 text-neon-cyan" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 space-y-4">
          {/* Existing Keys */}
          {apiKeys.map((key) => {
            const provider = API_PROVIDERS[key.provider as keyof typeof API_PROVIDERS];
            return (
              <div
                key={key.provider}
                className="bg-cyber-darker p-4 rounded-lg border border-neon-cyan"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-white font-medium">{provider?.name || key.provider}</h3>
                    <p className="text-sm text-gray-400">{provider?.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={provider?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-neon-cyan hover:text-neon-pink transition-colors"
                      title="View API Key"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleToggleActive(key.provider, !key.is_active)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        key.is_active 
                          ? 'bg-green-500 bg-opacity-20 text-green-500'
                          : 'bg-red-500 bg-opacity-20 text-red-500'
                      }`}
                    >
                      {key.is_active ? 'Active' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(key.provider)}
                      className="p-2 text-neon-pink hover:text-red-500 transition-colors"
                      title="Remove API Key"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add New Key */}
          {!showAddKey && (
            <button
              onClick={() => setShowAddKey(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-cyber-darker text-neon-cyan border border-neon-cyan rounded-md hover:bg-cyber-light transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add New API Key
            </button>
          )}

          {showAddKey && (
            <div className="bg-cyber-darker p-4 rounded-lg border border-neon-cyan">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Add New API Key</h3>
                <button
                  onClick={() => setShowAddKey(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <select
                    value={newKeyProvider}
                    onChange={(e) => setNewKeyProvider(e.target.value)}
                    className="w-full px-3 py-2 bg-cyber-light border rounded-md text-white border-neon-pink focus:border-neon-cyan focus:outline-none"
                  >
                    <option value="">Select Provider</option>
                    {Object.entries(API_PROVIDERS)
                      .filter(([id]) => !apiKeys.some(k => k.provider === id))
                      .map(([id, provider]) => (
                        <option key={id} value={id}>{provider.name}</option>
                      ))
                    }
                  </select>
                </div>

                {newKeyProvider && (
                  <>
                    <div>
                      <input
                        type="password"
                        value={newKeyValue}
                        onChange={(e) => setNewKeyValue(e.target.value)}
                        placeholder="Enter API Key"
                        className="w-full px-3 py-2 bg-cyber-light border rounded-md text-white border-neon-pink focus:border-neon-cyan focus:outline-none"
                      />
                      <div className="mt-2">
                        <a
                          href={API_PROVIDERS[newKeyProvider as keyof typeof API_PROVIDERS]?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-neon-cyan hover:text-neon-pink"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Get API Key
                        </a>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveKey}
                      disabled={saving || !newKeyValue}
                      className="w-full flex justify-center py-2 px-4 bg-neon-gradient text-white rounded-md shadow-neon-glow hover:opacity-90 disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Save API Key
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-neon-pink" />
              <h3 className="text-lg font-semibold text-white">Remove API Key?</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Are you sure you want to remove this API key? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveKey(showDeleteConfirm)}
                disabled={removing === showDeleteConfirm}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {removing === showDeleteConfirm ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}