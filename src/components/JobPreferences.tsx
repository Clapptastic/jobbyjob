import React, { useState, useEffect } from 'react';
import { Settings, X, Search, MapPin, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';

const log = logger('JobPreferences');

export default function JobPreferences() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState(50);
  const [includeRemote, setIncludeRemote] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  
  const user = useStore((state) => state.user);

  useEffect(() => {
    loadPreferences();
  }, [user?.id]);

  // Auto-collapse when we have preferences set
  useEffect(() => {
    if (keywords.length > 0 || zipCode || includeRemote) {
      setIsExpanded(false);
    }
  }, [keywords, zipCode, includeRemote]);

  const loadPreferences = async () => {
    try {
      if (!supabase || !user?.id) {
        throw new Error('Not initialized');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('job_preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.job_preferences) {
        const prefs = data.job_preferences;
        setKeywords(prefs.keywords || []);
        setZipCode(prefs.zipCode || '');
        setRadius(prefs.radius || 50);
        setIncludeRemote(prefs.remote ?? true);
      }
    } catch (error) {
      log.error('Failed to load preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!keywords.includes(inputValue.trim())) {
        setKeywords([...keywords, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
  };

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);

      if (!supabase || !user?.id) {
        throw new Error('Not initialized');
      }

      const preferences = {
        keywords,
        zipCode,
        radius,
        remote: includeRemote
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          job_preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Preferences saved successfully!');
    } catch (error: any) {
      log.error('Error saving preferences:', error);
      toast.error(error.message || 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow min-h-[100px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-pink"></div>
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
          <Settings className="h-5 w-5 text-neon-pink" />
          <h2 className="text-xl font-semibold text-neon-cyan">Job Preferences</h2>
        </div>
        <div className="flex items-center gap-4">
          {keywords.length > 0 && (
            <span className="text-sm text-neon-cyan">
              {keywords.length} Keyword{keywords.length !== 1 ? 's' : ''} Set
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
        <div className="mt-6 space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Search className="h-4 w-4 text-neon-pink" />
              <label className="block text-sm font-medium text-white">
                Job Keywords
              </label>
            </div>
            <p className="text-sm text-gray-400 mb-2">
              Enter skills, job titles, or any keywords relevant to your job search
            </p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type and press Enter (e.g., React, Project Manager)"
              className="w-full rounded-md bg-cyber-darker border-neon-pink focus:border-neon-cyan text-white placeholder-gray-500 focus:ring-1 focus:ring-neon-cyan transition-colors"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cyber-darker text-neon-cyan border border-neon-cyan animate-fadeIn"
                >
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="ml-2 focus:outline-none hover:text-neon-pink"
                    aria-label={`Remove ${keyword}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-neon-pink" />
                <label className="block text-sm font-medium text-white">
                  Location Preferences
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    maxLength={5}
                    placeholder="Enter ZIP code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-md bg-cyber-darker border-neon-pink focus:border-neon-cyan text-white placeholder-gray-500 focus:ring-1 focus:ring-neon-cyan transition-colors"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="w-full h-2 bg-cyber-darker rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-neon-cyan">{radius} mi</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-neon-pink" />
                <label className="flex items-center space-x-2 text-sm font-medium text-white">
                  <input
                    type="checkbox"
                    checked={includeRemote}
                    onChange={(e) => setIncludeRemote(e.target.checked)}
                    className="rounded bg-cyber-darker border-neon-pink text-neon-cyan focus:ring-neon-cyan transition-colors"
                  />
                  <span>Include remote positions</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-neon-gradient text-sm font-medium rounded-md text-white shadow-neon-glow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:ring-offset-2 focus:ring-offset-cyber-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}