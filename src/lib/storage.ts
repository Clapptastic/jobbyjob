import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';
import { createLogger } from './logger';

const log = createLogger('Storage');

// Define allowed file types with their MIME types and extensions
const ALLOWED_FILE_TYPES = ['application/pdf'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadResume(file: File): Promise<{ path: string }> {
  try {
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      const error = new Error('Invalid file type');
      log.error('Resume upload error:', error);
      toast.error(`Error uploading resume: ${error.message}`);
      throw error;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const error = new Error('File size exceeds 5MB limit');
      log.error('Resume upload error:', error);
      toast.error(`Error uploading resume: ${error.message}`);
      throw error;
    }

    // Upload file to Supabase storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      log.error('Resume upload error:', error);
      toast.error(`Error uploading resume: ${error.message}`);
      throw error;
    }

    if (!data?.path) {
      const error = new Error('Upload failed: No path returned');
      log.error('Resume upload error:', error);
      toast.error(`Error uploading resume: ${error.message}`);
      throw error;
    }

    toast.success('Resume uploaded successfully');
    return { path: data.path };
  } catch (error) {
    log.error('Resume upload error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Error uploading resume: ${message}`);
    throw error;
  }
}