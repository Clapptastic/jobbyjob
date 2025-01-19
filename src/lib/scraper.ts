import { supabase } from './supabase';
import { ai } from './ai';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('Scraper');

interface JobPreferences {
  keywords: string[];
  zipCode?: string;
  radius?: number;
  remote: boolean;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  posted: string;
  source: string;
  sourceUrl: string;
  active: boolean;
  matchScore?: number;
  matchReasons?: string[];
}

export const scraper = {
  async scrapeJobs(preferences: JobPreferences): Promise<Job[]> {
    try {
      if (!preferences?.keywords?.length) {
        throw new Error('Job search keywords are required');
      }

      // Call Edge Function to scrape jobs
      const { data, error } = await supabase.functions.invoke('scrape-jobs', {
        body: { preferences }
      });

      if (error) {
        log.error('Scraping function error:', error);
        throw new Error('Failed to fetch job listings');
      }

      if (!data?.length) {
        throw new Error('No jobs found matching your preferences');
      }

      return data;
    } catch (error: any) {
      log.error('Job scraping failed:', error);
      throw new Error(error.message || 'Failed to scrape jobs');
    }
  },

  async matchJobsToProfile(jobs: Job[], parsedResume: any): Promise<Job[]> {
    try {
      if (!jobs?.length) {
        throw new Error('No jobs to match');
      }

      if (!parsedResume) {
        throw new Error('Resume data is required for matching');
      }

      const matchedJobs = await Promise.all(
        jobs.map(async (job) => {
          try {
            const match = await ai.calculateJobMatch(parsedResume, job.description);
            return {
              ...job,
              matchScore: match.score,
              matchReasons: match.reasons,
            };
          } catch (error) {
            log.error('Match calculation failed for job:', error);
            return null;
          }
        })
      );

      // Filter out failed matches and sort by score
      const validJobs = matchedJobs
        .filter((job): job is Job => job !== null)
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      if (!validJobs.length) {
        throw new Error('No valid job matches found');
      }

      return validJobs;
    } catch (error: any) {
      log.error('Job matching failed:', error);
      throw new Error(error.message || 'Failed to match jobs to profile');
    }
  },

  async processJobs(jobs: Job[], userId: string): Promise<void> {
    try {
      if (!jobs?.length) {
        throw new Error('No jobs to process');
      }

      if (!userId) {
        throw new Error('User ID is required');
      }

      // Batch insert jobs with proper error handling
      const { error: jobsError } = await supabase
        .from('jobs')
        .upsert(
          jobs.map(job => ({
            ...job,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })),
          {
            onConflict: 'source_url',
            ignoreDuplicates: true
          }
        );

      if (jobsError) {
        log.error('Job insertion error:', jobsError);
        throw new Error('Failed to save job listings');
      }
    } catch (error: any) {
      log.error('Job processing failed:', error);
      throw new Error(error.message || 'Failed to process jobs');
    }
  }
};