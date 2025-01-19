import React from 'react';
import { CheckCircle2, Clock, XCircle, MessageCircle } from 'lucide-react';
import { JobApplication } from '../types';

const applications: JobApplication[] = [
  {
    id: '1',
    jobTitle: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    appliedDate: new Date('2024-02-20'),
    status: 'applied',
    customizedResume: 'resume_techcorp.pdf',
    source: 'LinkedIn',
  },
  {
    id: '2',
    jobTitle: 'Full Stack Engineer',
    company: 'StartupX',
    appliedDate: new Date('2024-02-15'),
    status: 'contacted',
    customizedResume: 'resume_startupx.pdf',
    source: 'Indeed',
    lastContactDate: new Date('2024-02-18'),
  },
];

const statusIcons = {
  applied: <Clock className="h-5 w-5 text-neon-cyan" />,
  contacted: <MessageCircle className="h-5 w-5 text-neon-purple" />,
  rejected: <XCircle className="h-5 w-5 text-neon-pink" />,
  accepted: <CheckCircle2 className="h-5 w-5 text-green-500" />,
};

const statusLabels = {
  applied: 'Applied',
  contacted: 'Contacted',
  rejected: 'Rejected',
  accepted: 'Accepted',
};

export default function ApplicationTracker() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Object.entries(statusLabels).map(([status, label]) => (
          <div
            key={status}
            className="bg-cyber-darker rounded-lg p-4 border border-neon-pink"
          >
            <div className="flex items-center space-x-2">
              {statusIcons[status as keyof typeof statusIcons]}
              <span className="text-sm font-medium text-white">{label}</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-neon-cyan">
              {applications.filter((app) => app.status === status).length}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-cyber-light rounded-lg border border-neon-pink overflow-hidden">
        <table className="min-w-full divide-y divide-cyber-darker">
          <thead className="bg-cyber-darker">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Job
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Applied Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-darker">
            {applications.map((application) => (
              <tr key={application.id} className="hover:bg-cyber-darker">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-white">
                    {application.jobTitle}
                  </div>
                  <div className="text-xs text-gray-400">
                    Source: {application.source}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {application.company}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {application.appliedDate.toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyber-darker text-neon-cyan border border-neon-cyan">
                    {statusLabels[application.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <button className="text-neon-cyan hover:text-neon-pink">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}