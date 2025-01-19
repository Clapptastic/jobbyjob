import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';
import logger from './logger';

const log = logger('Storage');

// Define allowed file types with their MIME types and extensions
const ALLOWED_FILE_TYPES = ['application/pdf'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadResume(file: File, userId: string): Promise<{ success: boolean; url?: string }> {
  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    toast.error('Invalid file type. Please upload a PDF file.');
    throw new Error('Invalid file type');
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    toast.error('File size exceeds 5MB limit');
    throw new Error('File size exceeds 5MB limit');
  }

  try {
    const filename = `${userId}-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filename, file);

    if (error) {
      toast.error(`Error uploading resume: ${error.message}`);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(data.path);

    toast.success('Resume uploaded successfully');
    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Error uploading resume: ${message}`);
    throw error;
  }
}