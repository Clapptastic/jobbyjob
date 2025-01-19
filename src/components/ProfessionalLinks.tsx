import React from 'react';
import { Link, Globe } from 'lucide-react';

export default function ProfessionalLinks() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Link className="h-4 w-4 text-neon-pink" />
          <label className="block text-sm font-medium text-white">
            LinkedIn Profile
          </label>
        </div>
        <input
          type="url"
          placeholder="https://linkedin.com/in/username"
          className="w-full rounded-md bg-cyber-darker border-neon-pink focus:border-neon-cyan text-white placeholder-gray-500 focus:ring-1 focus:ring-neon-cyan transition-colors"
        />
        <p className="mt-1 text-xs text-gray-400">
          Your LinkedIn profile helps us better understand your professional background
        </p>
      </div>

      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Globe className="h-4 w-4 text-neon-pink" />
          <label className="block text-sm font-medium text-white">
            Personal Website
          </label>
        </div>
        <input
          type="url"
          placeholder="https://yourwebsite.com"
          className="w-full rounded-md bg-cyber-darker border-neon-pink focus:border-neon-cyan text-white placeholder-gray-500 focus:ring-1 focus:ring-neon-cyan transition-colors"
        />
        <p className="mt-1 text-xs text-gray-400">
          Showcase your portfolio or personal brand
        </p>
      </div>

      <div>
        <button
          type="button"
          className="inline-flex items-center px-3 py-2 border border-neon-cyan text-sm leading-4 font-medium rounded-md text-neon-cyan bg-cyber-darker hover:bg-cyber-light focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-cyber-dark transition-all duration-200"
        >
          + Add Additional Link
        </button>
      </div>
    </div>
  );
}