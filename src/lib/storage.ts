import { supabase } from './supabase';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('Storage');

// Define allowed file types with their MIME types and extensions
const ALLOWED_FILE_TYPES = {
  pdf: {
    mimeType: 'application/pdf',
    extension: '.pdf'
  },
  doc: {
    mimeType: 'application/msword',
    extension: '.doc'
  },
  docx: {
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: '.docx'
  }
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const storage = {
  async uploadResume(file: File, userId: string) {
    try {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const fileType = Object.values(ALLOWED_FILE_TYPES).find(type => 
        type.extension === fileExtension
      );

      if (!fileType) {
        throw new Error('Invalid file type. Please upload a PDF, DOC, or DOCX file');
      }

      // Create file path with proper extension
      const fileName = `${Date.now()}${fileType.extension}`;
      const filePath = `${userId}/${fileName}`;

      // Create file blob with proper content type
      const fileBlob = new Blob([await file.arrayBuffer()], { 
        type: fileType.mimeType 
      });

      // Upload file
      const { data, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, fileBlob, {
          contentType: fileType.mimeType,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Clean up any partial uploads
        try {
          await supabase.storage
            .from('resumes')
            .remove([filePath]);
        } catch (cleanupError) {
          log.error('Failed to clean up failed upload:', cleanupError);
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('resumes')
        .getPublicUrl(data.path);

      if (urlError) throw urlError;

      return { path: data.path, url: publicUrl };
    } catch (error: any) {
      log.error('Resume upload failed:', error);
      throw new Error(error.message || 'Failed to upload resume');
    }
  }
};