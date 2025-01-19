import { supabase } from './supabase';
import { ai } from './ai';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('JobScraper');

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

const API_BASE_URL = 'http://localhost:8501';

export const jobScraper = {
  async scrapeJobs(preferences: JobPreferences): Promise<Job[]> {
    try {
      if (!preferences?.keywords?.length) {
        throw new Error('Job search keywords are required');
      }

      // Call Open Resume API to search jobs
      const response = await fetch(`${API_BASE_URL}/api/jobs/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: preferences.keywords,
          location: preferences.zipCode,
          remote: preferences.remote,
          radius: preferences.radius
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch jobs');
      }

      const jobs = await response.json();

      if (!jobs?.length) {
        throw new Error('No jobs found matching your preferences');
      }

      return jobs.map((job: any) => ({
        id: job.id || crypto.randomUUID(),
        title: job.title,
        company: job.company,
        location: job.location || 'Remote',
        type: job.type || (job.is_remote ? 'remote' : 'onsite'),
        description: job.description,
        requirements: job.requirements || [],
        posted: job.posted_at || new Date().toISOString(),
        source: job.source,
        sourceUrl: job.url,
        active: true
      }));
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

      // Call Open Resume API for job matching
      const response = await fetch(`${API_BASE_URL}/api/jobs/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume: parsedResume,
          jobs: jobs
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to match jobs');
      }

      const matchedJobs = await response.json();

      // Sort by match score
      return matchedJobs
        .sort((a: Job, b: Job) => (b.matchScore || 0) - (a.matchScore || 0));

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