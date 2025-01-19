import React, { useState } from 'react';
import { PlayCircle, PauseCircle, Settings, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { automatedApplication } from '../lib/automatedApplication';
import toast from 'react-hot-toast';

export default function AutomatedApplication() {
  const [isActive, setIsActive] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [config, setConfig] = useState({
    maxApplicationsPerDay: 20,
    minimumMatchScore: 75,
    blacklistedCompanies: [] as string[],
    autoFollowUp: true,
    followUpDelay: 5, // days
  });

  const user = useStore((state) => state.user);

  const toggleAutomation = async () => {
    if (!user?.resume?.url) {
      toast.error('Please upload your resume first');
      return;
    }

    if (!user?.jobPreferences?.keywords?.length) {
      toast.error('Please set your job preferences first');
      return;
    }

    try {
      if (!isActive) {
        await automatedApplication.start(config);
        toast.success('Automated applications started');
      } else {
        await automatedApplication.stop();
        toast.success('Automated applications paused');
      }
      setIsActive(!isActive);
    } catch (error) {
      toast.error('Failed to toggle automation');
    }
  };

  const saveConfig = async () => {
    try {
      await automatedApplication.updateConfig(config);
      setIsConfiguring(false);
      toast.success('Configuration saved');
    } catch (error) {
      toast.error('Failed to save configuration');
    }
  };

  return (
    <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-neon-cyan">Automated Applications</h2>
          <p className="text-sm text-gray-400 mt-1">
            Let AI handle your job applications automatically
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsConfiguring(true)}
            className="p-2 text-neon-cyan hover:text-neon-pink transition-colors"
          >
            <Settings className="h-6 w-6" />
          </button>
          <button
            onClick={toggleAutomation}
            className={`inline-flex items-center px-4 py-2 rounded-md text-white shadow-neon-glow transition-all duration-200
              ${isActive 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-neon-gradient hover:opacity-90'}`}
          >
            {isActive ? (
              <>
                <PauseCircle className="h-5 w-5 mr-2" />
                Stop
              </>
            ) : (
              <>
                <PlayCircle className="h-5 w-5 mr-2" />
                Start
              </>
            )}
          </button>
        </div>
      </div>

      {isConfiguring && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Automation Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Maximum Applications per Day
                </label>
                <input
                  type="number"
                  value={config.maxApplicationsPerDay}
                  onChange={(e) => setConfig({
                    ...config,
                    maxApplicationsPerDay: parseInt(e.target.value)
                  })}
                  className="w-full rounded-md bg-cyber-darker border-neon-pink focus:border-neon-cyan text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Minimum Match Score (%)
                </label>
                <input
                  type="number"
                  value={config.minimumMatchScore}
                  onChange={(e) => setConfig({
                    ...config,
                    minimumMatchScore: parseInt(e.target.value)
                  })}
                  className="w-full rounded-md bg-cyber-darker border-neon-pink focus:border-neon-cyan text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Blacklisted Companies
                </label>
                <textarea
                  value={config.blacklistedCompanies.join('\n')}
                  onChange={(e) => setConfig({
                    ...config,
                    blacklistedCompanies: e.target.value.split('\n').filter(Boolean)
                  })}
                  placeholder="Enter company names (one per line)"
                  className="w-full h-24 rounded-md bg-cyber-darker border-neon-pink focus:border-neon-cyan text-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  Automatic Follow-up
                </label>
                <input
                  type="checkbox"
                  checked={config.autoFollowUp}
                  onChange={(e) => setConfig({
                    ...config,
                    autoFollowUp: e.target.checked
                  })}
                  className="rounded bg-cyber-darker border-neon-pink text-neon-cyan focus:ring-neon-cyan"
                />
              </div>

              {config.autoFollowUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Follow-up Delay (days)
                  </label>
                  <input
                    type="number"
                    value={config.followUpDelay}
                    onChange={(e) => setConfig({
                      ...config,
                      followUpDelay: parseInt(e.target.value)
                    })}
                    className="w-full rounded-md bg-cyber-darker border-neon-pink focus:border-neon-cyan text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setIsConfiguring(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveConfig}
                className="px-4 py-2 bg-neon-gradient text-sm font-medium rounded-md text-white shadow-neon-glow hover:opacity-90"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-cyber-darker rounded-lg p-4 mt-6">
        <div className="flex items-center gap-2 text-neon-pink mb-4">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Important Notes</span>
        </div>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>• Applications will only be sent to jobs with match scores above your minimum</li>
          <li>• Each application includes an AI-optimized resume and cover letter</li>
          <li>• The system respects daily application limits to avoid spam detection</li>
          <li>• You can review all automated applications in the tracker</li>
          <li>• Email notifications will be sent for important updates</li>
        </ul>
      </div>
    </div>
  );
}