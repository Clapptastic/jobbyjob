import React, { useState, useEffect } from 'react';
import { BarChart2, Users, Briefcase, CheckCircle2, Loader2 } from 'lucide-react';
import ResumeUpload from './ResumeUpload';
import ResumeManager from './ResumeManager';
import JobPreferences from './JobPreferences';
import ApiKeyManager from './ApiKeyManager';
import JobSearch from './JobSearch';
import ApplicationStatus from './ApplicationStatus';
import AutomatedJobProcess from './AutomatedJobProcess';
import SystemDiagnostics from './SystemDiagnostics';
import Metrics from './Metrics';
import { supabase, checkConnection } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';

const log = logger('Dashboard');

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('manage');
  const user = useStore((state) => state.user);

  useEffect(() => {
    if (user?.id) {
      initializeDashboard();
    }
  }, [user]);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check database connection
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error('Unable to connect to the database. Please check your connection.');
      }

    } catch (error: any) {
      log.error('Dashboard initialization failed:', error);
      setError(error.message || 'Failed to load dashboard');
      toast.error(error.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    initializeDashboard();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-gradient p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-neon-pink animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cyber-gradient p-8 flex items-center justify-center">
        <div className="bg-cyber-light rounded-lg p-6 border border-red-500 max-w-md w-full">
          <div className="flex items-center gap-2 text-red-500 mb-4">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="w-full px-4 py-2 bg-neon-gradient text-white rounded-md hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* System Diagnostics */}
      <SystemDiagnostics />

      {/* Metrics */}
      <Metrics />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Resume Section */}
          <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neon-cyan">Resume Management</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('manage')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'manage'
                      ? 'bg-neon-gradient text-white shadow-neon-glow'
                      : 'border border-neon-cyan text-neon-cyan hover:bg-cyber-darker'
                  }`}
                >
                  Manage
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'upload'
                      ? 'bg-neon-gradient text-white shadow-neon-glow'
                      : 'border border-neon-cyan text-neon-cyan hover:bg-cyber-darker'
                  }`}
                >
                  Upload
                </button>
              </div>
            </div>
            {activeTab === 'upload' ? <ResumeUpload /> : <ResumeManager />}
          </div>
          <JobPreferences />
          <ApiKeyManager />
        </div>
        <div className="space-y-8">
          <JobSearch />
          <ApplicationStatus />
          <AutomatedJobProcess />
        </div>
      </div>
    </div>
  );
}