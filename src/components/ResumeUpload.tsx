import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { storage } from '../lib/storage';
import { ai } from '../lib/ai';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';

const log = logger('ResumeUpload');

// Define allowed file types
const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ResumeUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useStore((state) => state.user);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setError(null);
      setIsUploading(true);

      if (!user?.id) {
        throw new Error('Please sign in to upload your resume');
      }

      // Upload file using storage utility
      const { url } = await storage.uploadResume(file, user.id);

      // Parse resume content
      setIsParsing(true);
      const text = await file.text();
      const parsedContent = await ai.parseResume(text);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          resume_url: url,
          resume_content: parsedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Trigger refresh
      window.dispatchEvent(new CustomEvent('resumeUploaded'));
      toast.success('Resume uploaded and parsed successfully!');
    } catch (error: any) {
      log.error('Resume upload failed:', error);
      setError(error.message || 'Failed to upload resume');
      toast.error(error.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
      setIsParsing(false);
    }
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_FILE_TYPES,
    maxFiles: 1,
    multiple: false,
    maxSize: MAX_FILE_SIZE,
    validator: (file) => {
      // Additional validation for file extension
      const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const isValidType = Object.entries(ALLOWED_FILE_TYPES).some(([mime, exts]) => 
        file.type === mime && exts.includes(extension)
      );
      
      if (!isValidType) {
        return {
          code: 'file-invalid-type',
          message: 'Invalid file type. Please upload a PDF, DOC, or DOCX file'
        };
      }
      return null;
    }
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive
            ? 'border-neon-cyan bg-cyber-darker'
            : 'border-neon-pink hover:border-neon-cyan'
        }`}
      >
        <input {...getInputProps()} />
        {isUploading || isParsing ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-neon-pink animate-spin" />
            <p className="mt-2 text-gray-400">
              {isUploading ? 'Uploading resume...' : 'Parsing resume...'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FileUp className="h-8 w-8 text-neon-pink" />
            <p className="mt-2 text-white">
              Click or drag resume to upload
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Supports PDF, DOC, DOCX (max 5MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}