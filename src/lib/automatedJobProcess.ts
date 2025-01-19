import { supabase } from './supabase';
import { scraper } from './scraper';
import { ai } from './ai';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('AutomatedJobProcess');

interface ProcessConfig {
  maxApplicationsPerDay: number;
  minimumMatchScore: number;
  blacklistedCompanies: string[];
  autoFollowUp: boolean;
  followUpDelay: number;
}

class AutomatedJobProcessImpl {
  private isProcessing = false;
  private config: ProcessConfig = {
    maxApplicationsPerDay: 20,
    minimumMatchScore: 75,
    blacklistedCompanies: [],
    autoFollowUp: true,
    followUpDelay: 5
  };

  async start(userId: string, config?: Partial<ProcessConfig>): Promise<void> {
    if (!supabase) {
      throw new Error('Database not initialized');
    }

    let logId: string | null = null;

    try {
      // Validate inputs
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (this.isProcessing) {
        throw new Error('Job processing already in progress');
      }

      // Start processing log
      const { data: log, error: logError } = await supabase
        .rpc('start_job_processing', { p_user_id: userId });

      if (logError) throw logError;
      logId = log;

      this.isProcessing = true;
      this.config = { ...this.config, ...config };

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('resume_content, job_preferences')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw new Error('Failed to load user profile');
      }

      // Validate profile data
      if (!profile?.resume_content) {
        throw new Error('Please upload and parse your resume first');
      }

      if (!profile?.job_preferences?.keywords?.length) {
        throw new Error('Please set your job preferences first');
      }

      // Check daily application limit
      const today = new Date().toISOString().split('T')[0];
      const { count: applicationCount, error: countError } = await supabase
        .from('applications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .gte('created_at', today);

      if (countError) {
        throw new Error('Failed to check application count');
      }

      if ((applicationCount || 0) >= this.config.maxApplicationsPerDay) {
        throw new Error(`Daily application limit of ${this.config.maxApplicationsPerDay} reached`);
      }

      // Scrape jobs
      const jobs = await scraper.scrapeJobs(profile.job_preferences);
      
      // Update log with jobs found
      await supabase.rpc('update_job_processing_status', { 
        p_log_id: logId,
        p_jobs_found: jobs.length
      });

      // Match and process jobs
      const matchedJobs = await scraper.matchJobsToProfile(jobs, profile.resume_content);
      const validJobs = matchedJobs
        .filter(job => 
          (job.matchScore || 0) >= this.config.minimumMatchScore &&
          !this.config.blacklistedCompanies.includes(job.company.toLowerCase())
        )
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, this.config.maxApplicationsPerDay - (applicationCount || 0));

      if (!validJobs.length) {
        throw new Error('No jobs met the minimum match score. Try adjusting your preferences.');
      }

      // Process jobs
      await scraper.processJobs(validJobs, userId);

      // Update processing log
      await supabase.rpc('update_job_processing_status', {
        p_log_id: logId,
        p_jobs_processed: validJobs.length,
        p_completed: true
      });

      toast.success(`Found ${validJobs.length} matching jobs!`);
    } catch (error: any) {
      log.error('Job process failed:', error);

      // Update processing log with error
      if (logId) {
        await supabase.rpc('update_job_processing_status', {
          p_log_id: logId,
          p_error: error.message,
          p_completed: true
        });
      }

      toast.error(error.message || 'Failed to process jobs');
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  async stop(): Promise<void> {
    this.isProcessing = false;
  }

  async updateConfig(config: Partial<ProcessConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
  }

  isRunning(): boolean {
    return this.isProcessing;
  }
}

export const automatedJobProcess = new AutomatedJobProcessImpl();