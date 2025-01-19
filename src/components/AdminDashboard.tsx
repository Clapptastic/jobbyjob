import React from 'react';
import { Settings, Users, BarChart2, Mail, Bug } from 'lucide-react';
import EmailSettings from './EmailSettings';
import AccessRequests from './AccessRequests';
import ErrorDashboard from './ErrorDashboard';
import SystemStats from './SystemStats';
import DebugPanel from './DebugPanel';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-cyber-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <div className="text-sm text-neon-cyan">Admin Access</div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <SystemStats />
          <AccessRequests />
          <EmailSettings />
          <ErrorDashboard />
          {import.meta.env.DEV && <DebugPanel />}
        </div>
      </div>
    </div>
  );
}