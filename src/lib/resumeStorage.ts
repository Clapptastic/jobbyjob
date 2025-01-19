import { supabase } from './supabase';
import { toast } from './toast';
import logger from './logger';

const log = logger('ResumeStorage');

interface StoredResume {
  id: string;
  url: string;
  fileName: string;
  parsedContent: any;
  uploadedAt: string;
}

export const resumeStorage = {
  async store(userId: string, file: File, parsedContent: any): Promise<StoredResume | null> {
    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${userId}/${fileName}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('resumes')
        .getPublicUrl(uploadData.path);

      if (urlError) throw urlError;

      // Store resume metadata and parsed content in profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          resumes: supabase.sql`array_append(coalesce(resumes, '[]'::jsonb), ${JSON.stringify({
            id: uploadData.path,
            url: publicUrl,
            fileName: file.name,
            parsedContent,
            uploadedAt: new Date().toISOString()
          })}::jsonb)`,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      return {
        id: uploadData.path,
        url: publicUrl,
        fileName: file.name,
        parsedContent,
        uploadedAt: new Date().toISOString()
      };
    } catch (error: any) {
      log.error('Failed to store resume:', error);
      throw error;
    }
  },

  async getAll(userId: string): Promise<StoredResume[]> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('resumes')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return profile?.resumes || [];
    } catch (error) {
      log.error('Failed to get resumes:', error);
      throw error;
    }
  },

  async delete(userId: string, resumeId: string): Promise<void> {
    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .remove([resumeId]);

      if (storageError) throw storageError;

      // Remove resume from profile's resumes array
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          resumes: supabase.sql`resumes - ${resumeId}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;
    } catch (error) {
      log.error('Failed to delete resume:', error);
      throw error;
    }
  }
};