import React, { useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { jobSync } from '../lib/jobSync';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function JobScraper() {
  const [isSyncing, setIsSyncing] = useState(false);
  const user = useStore((state) => state.user);

  const handleSync = async () => {
    if (!user?.id) return;

    setIsSyncing(true);
    try {
      await jobSync.scheduleSync(user.id);
      toast.success('Job sync scheduled! New matches will appear soon.');
    } catch (error) {
      toast.error('Failed to sync jobs');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-neon-cyan">Job Search</h2>
          <p className="text-sm text-gray-400 mt-1">
            Automatically search multiple job sites based on your preferences
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="inline-flex items-center px-4 py-2 bg-neon-gradient text-sm font-medium rounded-md text-white shadow-neon-glow hover:opacity-90 disabled:opacity-50 transition-all duration-200"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Jobs
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-cyber-darker rounded-lg border border-neon-cyan">
          <h3 className="text-sm font-medium text-white mb-2">Supported Sites</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-neon-cyan rounded-full mr-2" />
              LinkedIn Jobs
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-neon-cyan rounded-full mr-2" />
              Indeed
            </li>
          </ul>
        </div>

        <div className="p-4 bg-cyber-darker rounded-lg border border-neon-pink">
          <h3 className="text-sm font-medium text-white mb-2">Next Sync</h3>
          <p className="text-sm text-gray-400">
            Jobs are automatically synced every 6 hours
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <AlertCircle className="h-4 w-4 text-neon-pink" />
        <p>
          Make sure your job preferences are up to date for better matches
        </p>
      </div>
    </div>
  );
}