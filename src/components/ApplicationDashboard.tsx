import React, { useState, useEffect } from 'react';
import { BarChart, Calendar, CheckCircle2, Clock, MessageCircle, PieChart, Target, TrendingUp, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';

const log = logger('ApplicationDashboard');

interface ApplicationStats {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  responseRate: number;
  averageResponseTime: number;
  recentActivity: Array<{
    id: string;
    type: string;
    date: string;
    details: string;
  }>;
  matchScores: {
    average: number;
    distribution: Record<string, number>;
  };
}

const defaultStats: ApplicationStats = {
  total: 0,
  byStatus: {},
  bySource: {},
  responseRate: 0,
  averageResponseTime: 0,
  recentActivity: [],
  matchScores: {
    average: 0,
    distribution: {}
  }
};

export default function ApplicationDashboard() {
  const [stats, setStats] = useState<ApplicationStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const user = useStore((state) => state.user);

  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Get all applications with job details
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs (
            title,
            company,
            match_score,
            source
          )
        `)
        .eq('user_id', user?.id);

      if (applicationsError) throw applicationsError;

      if (!applications?.length) {
        setStats(defaultStats);
        return;
      }

      // Calculate statistics
      const total = applications.length;
      const byStatus = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const bySource = applications.reduce((acc, app) => {
        const source = app.job?.source || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const responded = applications.filter(app => app.status !== 'applied').length;
      const responseRate = total > 0 ? (responded / total) * 100 : 0;

      const responseTimes = applications
        .filter(app => app.last_contact_at)
        .map(app => {
          const applied = new Date(app.applied_at);
          const contacted = new Date(app.last_contact_at!);
          return (contacted.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24);
        });

      const averageResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

      const recentActivity = applications
        .slice(0, 5)
        .map(app => ({
          id: app.id,
          type: app.status,
          date: app.applied_at,
          details: `Applied to ${app.job?.title} at ${app.job?.company}`
        }));

      const matchScores = applications.reduce((acc, app) => {
        const score = app.job?.match_score || 0;
        const bucket = Math.floor(score / 10) * 10;
        acc.distribution[`${bucket}-${bucket + 9}`] = (acc.distribution[`${bucket}-${bucket + 9}`] || 0) + 1;
        acc.total += score;
        acc.count += 1;
        return acc;
      }, { distribution: {} as Record<string, number>, total: 0, count: 0 });

      setStats({
        total,
        byStatus,
        bySource,
        responseRate,
        averageResponseTime,
        recentActivity,
        matchScores: {
          average: matchScores.count > 0 ? matchScores.total / matchScores.count : 0,
          distribution: matchScores.distribution
        }
      });

    } catch (error: any) {
      log.error('Error loading stats:', error);
      toast.error('Failed to load application statistics');
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Clock className="h-8 w-8 text-neon-pink animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-cyber-darker p-4 rounded-lg border border-neon-pink">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Total Applications</span>
            <Target className="h-4 w-4 text-neon-pink" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
        </div>

        <div className="bg-cyber-darker p-4 rounded-lg border border-neon-cyan">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Response Rate</span>
            <TrendingUp className="h-4 w-4 text-neon-cyan" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {stats.responseRate.toFixed(1)}%
          </p>
        </div>

        <div className="bg-cyber-darker p-4 rounded-lg border border-neon-purple">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Avg Match Score</span>
            <PieChart className="h-4 w-4 text-neon-purple" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {stats.matchScores.average.toFixed(1)}%
          </p>
        </div>

        <div className="bg-cyber-darker p-4 rounded-lg border border-neon-pink">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Avg Response Time</span>
            <Clock className="h-4 w-4 text-neon-pink" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {stats.averageResponseTime.toFixed(1)} days
          </p>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-cyber-darker p-6 rounded-lg border border-neon-pink">
          <h3 className="text-lg font-medium text-white mb-4">Application Status</h3>
          <div className="space-y-4">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {status === 'applied' && <Clock className="h-4 w-4 text-neon-cyan" />}
                  {status === 'contacted' && <MessageCircle className="h-4 w-4 text-neon-purple" />}
                  {status === 'rejected' && <XCircle className="h-4 w-4 text-red-500" />}
                  {status === 'accepted' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  <span className="text-gray-300 capitalize">{status}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-cyber-light rounded-full h-2">
                    <div
                      className="bg-neon-gradient rounded-full h-2"
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-neon-cyan">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-cyber-darker p-6 rounded-lg border border-neon-pink">
          <h3 className="text-lg font-medium text-white mb-4">Match Score Distribution</h3>
          <div className="space-y-4">
            {Object.entries(stats.matchScores.distribution).map(([range, count]) => (
              <div key={range} className="flex items-center justify-between">
                <span className="text-gray-300">{range}%</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-cyber-light rounded-full h-2">
                    <div
                      className="bg-neon-gradient rounded-full h-2"
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-neon-cyan">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-cyber-darker rounded-lg border border-neon-pink overflow-hidden">
        <div className="p-4 border-b border-cyber-light">
          <h3 className="text-lg font-medium text-white">Recent Activity</h3>
        </div>
        <div className="divide-y divide-cyber-light">
          {stats.recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-cyber-light transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-neon-pink" />
                  <div>
                    <p className="text-white">{activity.details}</p>
                    <p className="text-sm text-gray-400">
                      Status: <span className="text-neon-cyan capitalize">{activity.type}</span>
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">
                  {format(parseISO(activity.date), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}