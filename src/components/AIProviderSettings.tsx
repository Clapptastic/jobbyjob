import React, { useState, useEffect } from 'react';
import { Brain, Save, Loader2, AlertCircle, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';

const log = logger('AIProviderSettings');

interface APIKey {
  provider: string;
  is_active: boolean;
  created_at: string;
}

const AI_PROVIDERS = [
  { 
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-3.5 and GPT-4 models',
    keyFormat: 'sk-',
    docsUrl: 'https://platform.openai.com/api-keys'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude and Claude Instant models',
    keyFormat: 'sk-ant-',
    docsUrl: 'https://console.anthropic.com/account/keys'
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Command and Generate models',
    keyFormat: '',
    docsUrl: 'https://dashboard.cohere.ai/api-keys'
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'PaLM and Gemini models',
    keyFormat: 'AI',
    docsUrl: 'https://makersuite.google.com/app/apikey'
  }
];

export default function AIProviderSettings() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    loadApiKeys();
  }, []);

  // Auto-collapse when we have at least one active key
  useEffect(() => {
    if (apiKeys.some(key => key.is_active)) {
      setIsExpanded(false);
    }
  }, [apiKeys]);

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

      // Validate key format
      const provider = AI_PROVIDERS.find(p => p.id === selectedProvider);
      if (provider?.keyFormat && !newKeyValue.startsWith(provider.keyFormat)) {
        throw new Error(`Invalid API key format for ${provider.name}. Key should start with "${provider.keyFormat}"`);
      }

      const { error } = await supabase
        .from('api_keys')
        .upsert({
          provider: selectedProvider,
          key_value: newKeyValue,
          is_active: true,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('API key saved successfully');
      setSelectedProvider('');
      setNewKeyValue('');
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

  if (loading) {
    return (
      <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow min-h-[100px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-pink"></div>
      </div>
    );
  }

  const activeKeys = apiKeys.filter(key => key.is_active);
  const hasActiveKeys = activeKeys.length > 0;

  return (
    <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-neon-pink" />
          <h2 className="text-xl font-semibold text-neon-cyan">AI Providers</h2>
        </div>
        <div className="flex items-center gap-4">
          {hasActiveKeys && (
            <span className="text-sm text-neon-cyan">
              {activeKeys.length} Active Provider{activeKeys.length !== 1 ? 's' : ''}
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
            const provider = AI_PROVIDERS.find(p => p.id === key.provider);
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
                  </div>
                </div>

                <div className="font-mono text-sm bg-cyber-light p-2 rounded text-gray-400">
                  API key saved on {new Date(key.created_at).toLocaleDateString()}
                </div>
              </div>
            );
          })}

          {/* Add New Key */}
          <div className="bg-cyber-darker p-4 rounded-lg border border-neon-cyan">
            <h3 className="text-white font-medium mb-4">Add New Provider</h3>
            <div className="space-y-4">
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full px-3 py-2 bg-cyber-light border rounded-md text-white border-neon-pink focus:border-neon-cyan focus:outline-none"
              >
                <option value="">Select Provider</option>
                {AI_PROVIDERS.filter(p => !apiKeys.some(k => k.provider === p.id)).map(provider => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>

              {selectedProvider && (
                <>
                  <div>
                    <input
                      type="password"
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      placeholder="Enter API Key"
                      className="w-full px-3 py-2 bg-cyber-light border rounded-md text-white border-neon-pink focus:border-neon-cyan focus:outline-none"
                    />
                    <p className="mt-1 text-sm text-gray-400">
                      Get your key from the{' '}
                      <a
                        href={AI_PROVIDERS.find(p => p.id === selectedProvider)?.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-cyan hover:text-neon-pink"
                      >
                        provider dashboard
                      </a>
                    </p>
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
                        <Plus className="h-5 w-5 mr-2" />
                        Add Provider
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}