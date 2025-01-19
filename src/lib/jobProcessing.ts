import { supabase } from './supabase';
import { jobScraper } from './jobScraper';
import { withRetry } from './networkRetry';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('JobProcessing');

export const jobProcessing = {
  async start(userId: string) {
    try {
      return await withRetry(async () => {
        // Verify API configuration first
        const { data: apiStatus, error: apiError } = await supabase
          .rpc('verify_api_configuration');

        if (apiError) throw apiError;

        // Start job processing
        const { data: logId, error: startError } = await supabase
          .rpc('start_job_processing', { p_user_id: userId });

        if (startError) throw startError;

        return logId;
      }, {
        maxRetries: 3,
        shouldRetry: (error) => {
          // Don't retry if it's a validation error
          return !error.message?.includes('already in progress') &&
                 !error.message?.includes('Please wait');
        }
      });
    } catch (error: any) {
      log.error('Failed to start job processing:', error);
      throw error;
    }
  },

  async getStatus(logId: string) {
    try {
      return await withRetry(async () => {
        const { data: log, error } = await supabase
          .from('job_processing_logs')
          .select('*')
          .eq('id', logId)
          .single();

        if (error) throw error;

        // Calculate progress based on jobs found and processed
        let progress = 0;
        if (log.jobs_found > 0) {
          progress = Math.round((log.jobs_processed / log.jobs_found) * 100);
        } else if (log.jobs_found === 0 && !log.error) {
          // If no jobs found yet and no error, we're in the initial stages
          progress = 10; // Show some initial progress
        }

        // Calculate estimated completion
        let estimatedEndTime = null;
        if (log.jobs_found && log.jobs_processed) {
          const startTime = new Date(log.started_at);
          const timeElapsed = Date.now() - startTime.getTime();
          const timePerJob = timeElapsed / log.jobs_processed;
          const remainingJobs = log.jobs_found - log.jobs_processed;
          const remainingTime = remainingJobs * timePerJob;
          estimatedEndTime = new Date(Date.now() + remainingTime);
        }

        return {
          progress,
          estimatedEndTime,
          status: log.completed_at ? (log.error ? 'error' : 'complete') : 'processing',
          error: log.error,
          startTime: new Date(log.started_at),
          jobsFound: log.jobs_found,
          jobsProcessed: log.jobs_processed
        };
      });
    } catch (error) {
      log.error('Failed to get job processing status:', error);
      throw error;
    }
  },

  async cancel(logId: string) {
    try {
      return await withRetry(async () => {
        const { error } = await supabase
          .from('job_processing_logs')
          .update({
            completed_at: new Date().toISOString(),
            error: 'Processing cancelled by user'
          })
          .eq('id', logId);

        if (error) throw error;
        return true;
      });
    } catch (error) {
      log.error('Failed to cancel job processing:', error);
      throw error;
    }
  }
};