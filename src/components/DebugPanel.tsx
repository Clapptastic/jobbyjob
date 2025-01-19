import React, { useState, useEffect } from 'react';
import { Bug, Trash2, RefreshCw, Settings, AlertCircle, Database, HardDrive, Zap, ToggleLeft, ToggleRight } from 'lucide-react';
import { debugManager } from '../lib/debugUtils';
import logger from '../lib/logger';
import { toast } from 'react-hot-toast';

const log = logger('DebugPanel');

interface SystemStatus {
  database: boolean;
  storage: boolean;
  edgeFunctions: boolean;
  ai: boolean;
}

export default function DebugPanel() {
  const [isEnabled, setIsEnabled] = useState(debugManager.isEnabled());
  const [config, setConfig] = useState(debugManager.getConfig());
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: false,
    storage: false,
    edgeFunctions: false,
    ai: false
  });

  useEffect(() => {
    loadLogs();
    checkSystem();
  }, []);

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('debug_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      log.error('Failed to load debug logs:', error);
      toast.error('Failed to load debug logs');
    }
  };

  const checkSystem = async () => {
    setIsLoading(true);
    try {
      // Check database connection
      const { error: dbError } = await supabase
        .from('profiles')
        .select('count');
      
      // Check storage
      const { error: storageError } = await supabase.storage.listBuckets();
      
      // Check Edge Functions
      const { error: functionError } = await supabase.functions.invoke('parse-resume', {
        body: { text: 'test' }
      });

      // Check AI integration
      const { error: aiError } = await supabase.functions.invoke('calculate-job-match', {
        body: { resume: { test: true }, jobDescription: 'test' }
      });

      setSystemStatus({
        database: !dbError,
        storage: !storageError,
        edgeFunctions: !functionError,
        ai: !aiError
      });
    } catch (error) {
      log.error('System check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDebug = async () => {
    try {
      await debugManager.saveConfig({ enabled: !config.enabled });
      setConfig(debugManager.getConfig());
      setIsEnabled(debugManager.isEnabled());
      toast.success(`Debug mode ${!config.enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      log.error('Failed to toggle debug mode:', error);
      toast.error('Failed to toggle debug mode');
    }
  };

  const handleClearLogs = async () => {
    try {
      await debugManager.clearLogs();
      await loadLogs();
      toast.success('Debug logs cleared');
    } catch (error) {
      log.error('Failed to clear debug logs:', error);
      toast.error('Failed to clear debug logs');
    }
  };

  const handleConfigChange = async (key: keyof typeof config, value: any) => {
    try {
      await debugManager.saveConfig({ [key]: value });
      setConfig(debugManager.getConfig());
      toast.success('Debug configuration updated');
    } catch (error) {
      log.error('Failed to update debug config:', error);
      toast.error('Failed to update debug config');
    }
  };

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="bg-cyber-light rounded-lg border border-neon-pink shadow-neon-glow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bug className="h-6 w-6 text-neon-pink" />
          <h2 className="text-xl font-semibold text-neon-cyan">Debug Panel</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleDebug}
            className="flex items-center gap-2 text-neon-cyan hover:text-neon-pink transition-colors"
          >
            {config.enabled ? (
              <ToggleRight className="h-6 w-6" />
            ) : (
              <ToggleLeft className="h-6 w-6" />
            )}
            {config.enabled ? 'Enabled' : 'Disabled'}
          </button>
          <button
            onClick={checkSystem}
            disabled={isLoading}
            className="p-2 text-neon-cyan hover:text-neon-pink disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleClearLogs}
            className="p-2 text-neon-cyan hover:text-neon-pink"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {config.enabled && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-4 bg-cyber-darker p-4 rounded-lg">
              <h3 className="text-white font-medium">Configuration</h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-gray-400">Log Level</span>
                  <select
                    value={config.logLevel}
                    onChange={(e) => handleConfigChange('logLevel', e.target.value)}
                    className="bg-cyber-light text-white border border-neon-pink rounded px-2 py-1"
                  >
                    <option value="error">Error</option>
                    <option value="warn">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-400">Show in Console</span>
                  <input
                    type="checkbox"
                    checked={config.showInConsole}
                    onChange={(e) => handleConfigChange('showInConsole', e.target.checked)}
                    className="rounded bg-cyber-light border-neon-pink text-neon-cyan focus:ring-neon-cyan"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-400">Track Performance</span>
                  <input
                    type="checkbox"
                    checked={config.trackPerformance}
                    onChange={(e) => handleConfigChange('trackPerformance', e.target.checked)}
                    className="rounded bg-cyber-light border-neon-pink text-neon-cyan focus:ring-neon-cyan"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-400">Track Network Calls</span>
                  <input
                    type="checkbox"
                    checked={config.trackNetworkCalls}
                    onChange={(e) => handleConfigChange('trackNetworkCalls', e.target.checked)}
                    className="rounded bg-cyber-light border-neon-pink text-neon-cyan focus:ring-neon-cyan"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-400">Track Storage Operations</span>
                  <input
                    type="checkbox"
                    checked={config.trackStorageOperations}
                    onChange={(e) => handleConfigChange('trackStorageOperations', e.target.checked)}
                    className="rounded bg-cyber-light border-neon-pink text-neon-cyan focus:ring-neon-cyan"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-4 bg-cyber-darker p-4 rounded-lg">
              <h3 className="text-white font-medium">System Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Database</span>
                  <span className={systemStatus.database ? 'text-green-500' : 'text-red-500'}>
                    {systemStatus.database ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Storage</span>
                  <span className={systemStatus.storage ? 'text-green-500' : 'text-red-500'}>
                    {systemStatus.storage ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Edge Functions</span>
                  <span className={systemStatus.edgeFunctions ? 'text-green-500' : 'text-red-500'}>
                    {systemStatus.edgeFunctions ? 'Running' : 'Stopped'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">AI Integration</span>
                  <span className={systemStatus.ai ? 'text-green-500' : 'text-red-500'}>
                    {systemStatus.ai ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-cyber-darker rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyber-light">
              <h3 className="text-white font-medium">Debug Logs</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border-b border-cyber-light hover:bg-cyber-light transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {log.level === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                      {log.level === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                      {log.level === 'info' && <AlertCircle className="h-4 w-4 text-blue-500" />}
                      <span className={`text-sm font-medium ${
                        log.level === 'error' ? 'text-red-500' :
                        log.level === 'warning' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}