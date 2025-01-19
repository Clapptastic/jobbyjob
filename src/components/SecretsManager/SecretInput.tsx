import React from 'react';
import { Eye, EyeOff, HelpCircle, AlertCircle } from 'lucide-react';
import { Secret } from './types';

interface SecretInputProps {
  secret: Secret;
  onToggleVisibility: (name: string) => void;
  onValueChange: (name: string, value: string) => void;
  onTooltipChange: (name: string | null) => void;
  activeTooltip: string | null;
  allSecrets: Secret[];
}

export default function SecretInput({
  secret,
  onToggleVisibility,
  onValueChange,
  onTooltipChange,
  activeTooltip,
  allSecrets
}: SecretInputProps) {
  // Get selected email provider
  const emailProvider = allSecrets.find(s => s.name === 'Email Provider')?.value;

  // Hide API key fields if they don't match the selected provider
  if ((secret.name === 'SendGrid API Key' && emailProvider !== 'sendgrid') ||
      (secret.name === 'Mandrill API Key' && emailProvider !== 'mandrill')) {
    return null;
  }

  if (secret.name === 'Email Provider') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <span className="text-white font-medium">{secret.name}</span>
            {secret.required && (
              <span className="ml-2 text-xs text-neon-pink">Required</span>
            )}
          </label>
          <div className="relative">
            <button
              onMouseEnter={() => onTooltipChange(secret.name)}
              onMouseLeave={() => onTooltipChange(null)}
              className="p-1 text-neon-cyan hover:text-neon-pink transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            {activeTooltip === secret.name && (
              <div className="absolute z-10 right-0 mt-2 p-4 bg-cyber-darker border border-neon-cyan rounded-lg shadow-lg w-80">
                <p className="text-sm text-white mb-2">{secret.description}</p>
                <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                  {secret.instructions.map((instruction, i) => (
                    <li key={i}>{instruction}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
        <select
          value={secret.value}
          onChange={(e) => onValueChange(secret.name, e.target.value)}
          className="w-full px-3 py-2 bg-cyber-darker border rounded-md text-white border-neon-pink focus:border-neon-cyan focus:outline-none transition-colors"
        >
          <option value="sendgrid">SendGrid (Recommended)</option>
          <option value="mandrill">Mandrill</option>
          <option value="supabase">Supabase (Basic)</option>
        </select>
        {secret.error && (
          <div className="mt-1 flex items-center text-red-500 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {secret.error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <span className="text-white font-medium">{secret.name}</span>
          {secret.required && (
            <span className="ml-2 text-xs text-neon-pink">Required</span>
          )}
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleVisibility(secret.name)}
            className="p-1 text-neon-cyan hover:text-neon-pink transition-colors"
          >
            {secret.visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          <div className="relative">
            <button
              onMouseEnter={() => onTooltipChange(secret.name)}
              onMouseLeave={() => onTooltipChange(null)}
              className="p-1 text-neon-cyan hover:text-neon-pink transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            {activeTooltip === secret.name && (
              <div className="absolute z-10 right-0 mt-2 p-4 bg-cyber-darker border border-neon-cyan rounded-lg shadow-lg w-80">
                <p className="text-sm text-white mb-2">{secret.description}</p>
                <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                  {secret.instructions.map((instruction, i) => (
                    <li key={i}>{instruction}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="relative">
        <input
          type={secret.visible ? "text" : "password"}
          value={secret.value}
          onChange={(e) => onValueChange(secret.name, e.target.value)}
          className={`w-full px-3 py-2 bg-cyber-darker border rounded-md text-white placeholder-gray-500 focus:outline-none transition-colors ${
            secret.error ? 'border-red-500' : 'border-neon-pink focus:border-neon-cyan'
          }`}
          placeholder={`Enter ${secret.name}`}
        />
        {secret.error && (
          <div className="mt-1 flex items-center text-red-500 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {secret.error}
          </div>
        )}
      </div>
    </div>
  );
}