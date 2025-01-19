import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Clock, Briefcase, Loader2, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';

const log = logger('JobList');

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  posted_at: string;
  source: string;
  source_url?: string;
  match_score?: number;
  match_reasons?: string[];
}

export default function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [showRemoteOnly, setShowRemoteOnly] = useState(false);
  const user = useStore((state) => state.user);

  useEffect(() => {
    if (user?.id) {
      loadJobs();
    }
  }, [user]);

  const loadJobs = async () => {
    try {
      setLoading(true);

      // Get user's job preferences
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('job_preferences')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      // Get matching jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user?.id)
        .order('match_score', { ascending: false });

      if (jobsError) throw jobsError;

      setJobs(jobs || []);
    } catch (error: any) {
      log.error('Failed to load jobs:', error);
      toast.error('Failed to load job listings');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApply = async (jobId: string) => {
    try {
      setApplying(jobId);

      // Get user's resume
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('resume_content')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      if (!profile?.resume_content) {
        throw new Error('Please upload your resume first');
      }

      // Create application
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          user_id: user?.id,
          job_id: jobId,
          status: 'applied',
          applied_at: new Date().toISOString()
        });

      if (applicationError) throw applicationError;

      toast.success('Application submitted successfully!');
      loadJobs(); // Refresh job list
    } catch (error: any) {
      log.error('Application failed:', error);
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setApplying(null);
    }
  };

  const isRemoteJob = (job: Job) => {
    return job.location.toLowerCase().includes('remote') || 
           job.type?.toLowerCase().includes('remote');
  };

  const filteredJobs = showRemoteOnly 
    ? jobs.filter(isRemoteJob)
    : jobs;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 text-neon-pink animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neon-cyan">Available Positions</h2>
        <button
          onClick={() => setShowRemoteOnly(!showRemoteOnly)}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            showRemoteOnly 
              ? 'bg-neon-gradient text-white shadow-neon-glow' 
              : 'border border-neon-cyan text-neon-cyan hover:bg-cyber-darker'
          }`}
        >
          <Globe className="h-4 w-4 mr-2" />
          Remote Only
        </button>
      </div>

      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink text-center">
            <p className="text-gray-400">
              {showRemoteOnly 
                ? 'No remote positions available at the moment.' 
                : 'No positions available at the moment.'}
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-cyber-light rounded-lg p-6 border border-neon-pink hover:shadow-neon-glow transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-gray-400">
                    <Building2 className="h-4 w-4" />
                    <span>{job.company}</span>
                    <MapPin className="h-4 w-4 ml-2" />
                    <span>{job.location}</span>
                    {isRemoteJob(job) && (
                      <>
                        <Globe className="h-4 w-4 ml-2 text-neon-cyan" />
                        <span className="text-neon-cyan">Remote</span>
                      </>
                    )}
                  </div>
                </div>
                {job.match_score && (
                  <div className="bg-cyber-darker px-3 py-1 rounded-full border border-neon-cyan">
                    <span className="text-neon-cyan text-sm font-medium">
                      {job.match_score}% Match
                    </span>
                  </div>
                )}
              </div>

              <p className="text-gray-300 mb-4">{job.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    Posted {formatDistanceToNow(new Date(job.posted_at))} ago
                  </span>
                </div>
                <button
                  onClick={() => handleQuickApply(job.id)}
                  disabled={applying === job.id}
                  className="inline-flex items-center px-4 py-2 bg-neon-gradient text-sm font-medium rounded-md text-white shadow-neon-glow hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying === job.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Briefcase className="h-4 w-4 mr-2" />
                      Quick Apply
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}