import React, { useState } from 'react';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';

const log = logger('Metrics');

export default function Metrics() {
  const [metrics, setMetrics] = useState({
    totalApplications: 0,
    successRate: 0,
    averageResponseTime: 0,
    activeJobs: 0
  });

  const loadMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*');

      if (error) throw error;

      const total = data.length;
      const successful = data.filter(app => app.status === 'accepted').length;
      const responded = data.filter(app => app.status !== 'applied').length;
      const avgResponse = responded ? data.reduce((acc, app) => {
        if (app.last_contact_at) {
          return acc + (new Date(app.last_contact_at).getTime() - new Date(app.applied_at).getTime());
        }
        return acc;
      }, 0) / responded / (1000 * 60 * 60 * 24) : 0;

      setMetrics({
        totalApplications: total,
        successRate: total ? (successful / total) * 100 : 0,
        averageResponseTime: avgResponse,
        activeJobs: data.filter(app => app.status === 'applied').length
      });
    } catch (error) {
      log.error('Failed to load metrics:', error);
      toast.error('Failed to load metrics');
    }
  };

  const { refresh } = useAutoRefresh(loadMetrics, {
    interval: 300000, // Refresh every 5 minutes
    immediate: true
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-cyber-darker p-4 rounded-lg border border-neon-pink">
        <h3 className="text-sm font-medium text-gray-400">Total Applications</h3>
        <p className="text-2xl font-bold text-white mt-2">{metrics.totalApplications}</p>
      </div>

      <div className="bg-cyber-darker p-4 rounded-lg border border-neon-cyan">
        <h3 className="text-sm font-medium text-gray-400">Success Rate</h3>
        <p className="text-2xl font-bold text-white mt-2">{metrics.successRate.toFixed(1)}%</p>
      </div>

      <div className="bg-cyber-darker p-4 rounded-lg border border-neon-purple">
        <h3 className="text-sm font-medium text-gray-400">Avg Response Time</h3>
        <p className="text-2xl font-bold text-white mt-2">{metrics.averageResponseTime.toFixed(1)} days</p>
      </div>

      <div className="bg-cyber-darker p-4 rounded-lg border border-neon-pink">
        <h3 className="text-sm font-medium text-gray-400">Active Jobs</h3>
        <p className="text-2xl font-bold text-white mt-2">{metrics.activeJobs}</p>
      </div>
    </div>
  );
}