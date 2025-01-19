import { supabase } from './supabase';
import { toast } from 'react-hot-toast';
import logger from './lib/logger';

const log = logger('Email');

interface EmailConfig {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  templateData?: Record<string, any>;
}

export const email = {
  async send(config: EmailConfig) {
    try {
      if (!supabase) {
        throw new Error('Database not initialized');
      }

      // Call Supabase Edge Function to send email
      const { error } = await supabase.functions.invoke('send-email', {
        body: config
      });

      if (error) throw error;
      return true;
    } catch (error: any) {
      log.error('Failed to send email:', error);
      throw error;
    }
  },

  async sendApplicationUpdate(applicationId: string, status: string) {
    try {
      if (!supabase) {
        throw new Error('Database not initialized');
      }

      // Get application details
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs (
            title,
            company
          ),
          user:profiles (
            email
          )
        `)
        .eq('id', applicationId)
        .single();

      if (appError) throw appError;

      // Send email
      await this.send({
        to: application.user.email,
        subject: `Application Status Update: ${application.job.title}`,
        templateId: 'application-update',
        templateData: {
          jobTitle: application.job.title,
          company: application.job.company,
          status,
          applicationDate: new Date(application.applied_at).toLocaleDateString()
        }
      });

      return true;
    } catch (error: any) {
      log.error('Failed to send application update:', error);
      throw error;
    }
  }
};