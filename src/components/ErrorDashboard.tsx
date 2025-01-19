import React, { useEffect, useState } from 'react';
import { AlertCircle, BarChart2, RefreshCw } from 'lucide-react';
import { errorReporting } from '../lib/errorReporting';

export default function ErrorDashboard() {
  const [errorStats, setErrorStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadErrorStats = async () => {
    setLoading(true);
    const stats = await errorReporting.getErrorStats();
    setErrorStats(stats);
    setLoading(false);
  };

  useEffect(() => {
    loadErrorStats();
  }, []);

  const getErrorColor = (source: string) => {
    switch (source) {
      case 'supabase':
        return 'text-blue-500';
      case 'openai':
        return 'text-green-500';
      case 'scraper':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-neon-pink" />
          <h2 className="text-xl font-semibold text-neon-cyan">Error Reports</h2>
        </div>
        <button
          onClick={loadErrorStats}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 text-sm bg-cyber-darker text-neon-cyan border border-neon-cyan rounded-md hover:bg-cyber-light transition-colors"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <RefreshCw className="h-8 w-8 text-neon-pink animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {['supabase', 'openai', 'scraper'].map((source) => {
              const count = errorStats?.filter((s: any) => s.source === source)
                .reduce((acc: number, curr: any) => acc + curr.count, 0) || 0;
              
              return (
                <div key={source} className="bg-cyber-darker p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 capitalize">{source}</span>
                    <BarChart2 className={`h-4 w-4 ${getErrorColor(source)}`} />
                  </div>
                  <p className="text-2xl font-bold mt-2 text-white">{count}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-cyber-darker rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-cyber-light">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Error Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Count
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-light">
                {errorStats?.map((stat: any) => (
                  <tr key={`${stat.source}-${stat.error_code}`}>
                    <td className="px-6 py-4 text-sm text-white capitalize">
                      {stat.source}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {stat.error_code}
                    </td>
                    <td className="px-6 py-4 text-sm text-neon-cyan">
                      {stat.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}