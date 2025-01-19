import { supabase } from './supabase';
import { Job } from '../types';

export const jobSync = {
  async syncJobs(userId: string) {
    try {
      // Get user preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('job_preferences, resume_content')
        .eq('id', userId)
        .single();

      if (!profile?.job_preferences) {
        throw new Error('Job preferences not set');
      }

      // Call serverless function to scrape jobs
      const response = await fetch('/api/scrape-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          preferences: profile.job_preferences,
          resumeContent: profile.resume_content
        })
      });

      if (!response.ok) {
        throw new Error('Failed to scrape jobs');
      }

      const matchedJobs: Job[] = await response.json();

      // Batch insert jobs
      const { error } = await supabase
        .from('jobs')
        .upsert(
          matchedJobs.map(job => ({
            ...job,
            user_id: userId,
            created_at: new Date().toISOString(),
          })),
          { onConflict: 'source_url' }
        );

      if (error) throw error;

      return matchedJobs;
    } catch (error) {
      console.error('Error syncing jobs:', error);
      throw error;
    }
  }
};