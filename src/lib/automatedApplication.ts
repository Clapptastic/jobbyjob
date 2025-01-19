import { supabase } from './supabase';
import { ai } from './ai';
import { scraper } from './scraper';
import { errorReporting } from './errorReporting';
import { Job, ParsedResume } from '../types';

interface AutomationConfig {
  maxApplicationsPerDay: number;
  minimumMatchScore: number;
  blacklistedCompanies: string[];
  autoFollowUp: boolean;
  followUpDelay: number;
}

export const automatedApplication = {
  async start(config: AutomationConfig) {
    try {
      // Store configuration
      await supabase
        .from('automation_config')
        .upsert({ config })
        .single();

      // Start the automation process
      await this.scheduleAutomation(true);

      return true;
    } catch (error) {
      errorReporting.handleSupabaseError(error);
      throw error;
    }
  },

  async stop() {
    try {
      await this.scheduleAutomation(false);
      return true;
    } catch (error) {
      errorReporting.handleSupabaseError(error);
      throw error;
    }
  },

  async scheduleAutomation(active: boolean) {
    return supabase
      .from('automation_status')
      .upsert({ active, last_run: new Date().toISOString() })
      .single();
  },

  async updateConfig(config: AutomationConfig) {
    try {
      await supabase
        .from('automation_config')
        .upsert({ config })
        .single();

      return true;
    } catch (error) {
      errorReporting.handleSupabaseError(error);
      throw error;
    }
  },

  async processJob(job: Job, resume: ParsedResume, config: AutomationConfig) {
    try {
      // Check if company is blacklisted
      if (config.blacklistedCompanies.includes(job.company.toLowerCase())) {
        return false;
      }

      // Calculate match score
      const match = await ai.calculateJobMatch(resume, job.description);
      if (match.score < config.minimumMatchScore) {
        return false;
      }

      // Generate application materials
      const coverLetter = await ai.generateCoverLetter(resume, job.description);
      const optimizedResume = await ai.optimizeResume(resume, job.description);

      // Submit application
      const application = await this.submitApplication(job, {
        coverLetter,
        resume: optimizedResume,
      });

      // Schedule follow-up if enabled
      if (config.autoFollowUp) {
        await this.scheduleFollowUp(application.id, config.followUpDelay);
      }

      return true;
    } catch (error) {
      errorReporting.handleSupabaseError(error);
      return false;
    }
  },

  async submitApplication(job: Job, materials: { coverLetter: string; resume: string }) {
    try {
      const { data: application } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          status: 'applied',
          customized_resume: materials.resume,
          notes: materials.coverLetter,
        })
        .single();

      return application;
    } catch (error) {
      errorReporting.handleSupabaseError(error);
      throw error;
    }
  },

  async scheduleFollowUp(applicationId: string, delayDays: number) {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + delayDays);

    try {
      await supabase
        .from('follow_ups')
        .insert({
          application_id: applicationId,
          scheduled_date: followUpDate.toISOString(),
          status: 'pending',
        });
    } catch (error) {
      errorReporting.handleSupabaseError(error);
    }
  },

  async generateFollowUpEmail(applicationId: string) {
    try {
      const { data: application } = await supabase
        .from('applications')
        .select('*, jobs(*)')
        .eq('id', applicationId)
        .single();

      return ai.generateFollowUpEmail(application);
    } catch (error) {
      errorReporting.handleSupabaseError(error);
      throw error;
    }
  },
};