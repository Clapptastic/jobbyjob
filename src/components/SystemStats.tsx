import React, { useState, useEffect } from 'react';
import { BarChart2, Users, Database, Server } from 'lucide-react';
import { supabase } from '../lib/supabase';
import logger from '../lib/logger';

const log = logger('SystemStats');

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalApplications: number;
  storageUsed: number;
  databaseSize: number;
  errorRate: number;
}

export default function SystemStats() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [
        { count: totalUsers },
        { count: activeUsers },
        { count: totalApplications },
        { size: storageUsed },
        { size: databaseSize },
        { rate: errorRate },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gt('last_sign_in', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.rpc('get_storage_size'),
        supabase.rpc('get_database_size'),
        supabase.rpc('get_error_rate'),
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalApplications: totalApplications || 0,
        storageUsed: storageUsed || 0,
        databaseSize: databaseSize || 0,
        errorRate: errorRate || 0,
      });
    } catch (error) {
      log.error('Failed to load system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow animate-pulse">
        <div className="h-40"></div>
      </div>
    );
  }

  return (
    <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow">
      <div className="flex items-center gap-2 mb-6">
        <BarChart2 className="h-5 w-5 text-neon-pink" />
        <h2 className="text-xl font-semibold text-neon-cyan">System Statistics</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-cyber-darker p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Total Users</span>
            <Users className="h-4 w-4 text-neon-cyan" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats?.totalUsers}</p>
          <p className="text-sm text-gray-400">{stats?.activeUsers} active in last 30 days</p>
        </div>

        <div className="bg-cyber-darker p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Applications</span>
            <BarChart2 className="h-4 w-4 text-neon-purple" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats?.totalApplications}</p>
        </div>

        <div className="bg-cyber-darker p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Storage Used</span>
            <Database className="h-4 w-4 text-neon-pink" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {(stats?.storageUsed || 0) / 1024 / 1024} MB
          </p>
        </div>

        <div className="bg-cyber-darker p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Error Rate</span>
            <Server className="h-4 w-4 text-neon-cyan" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {stats?.errorRate.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}