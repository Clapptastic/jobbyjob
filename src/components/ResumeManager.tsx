import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Eye, Loader2, AlertCircle, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { resumeParser } from '../lib/resumeParser';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';

const log = logger('ResumeManager');

interface Resume {
  url: string;
  fileName: string;
  parsedContent?: any;
  isParsed: boolean;
  isProcessing?: boolean;
}

export default function ResumeManager() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const user = useStore((state) => state.user);

  const loadResume = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('resume_url, resume_content')
        .eq('id', user!.id)
        .single();

      if (profileError) throw profileError;

      if (profile?.resume_url) {
        // Extract filename from URL
        const fileName = profile.resume_url.split('/').pop() || 'resume';
        setResume({
          url: profile.resume_url,
          fileName,
          parsedContent: profile.resume_content,
          isParsed: !!profile.resume_content
        });
      } else {
        setResume(null);
      }
    } catch (error: any) {
      log.error('Failed to load resume:', error);
      setError('Failed to load resume');
      toast.error('Failed to load resume');
    } finally {
      setLoading(false);
    }
  };

  const { refresh } = useAutoRefresh(loadResume, {
    interval: 60000, // Refresh every minute
    immediate: true
  });

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      if (!resume?.url) {
        throw new Error('No resume to delete');
      }

      // Extract file path from URL
      const urlParts = resume.url.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('resumes') + 1).join('/');

      const { error: deleteError } = await supabase.storage
        .from('resumes')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          resume_url: null,
          resume_content: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user!.id);

      if (updateError) throw updateError;

      setResume(null);
      toast.success('Resume deleted successfully');
    } catch (error: any) {
      log.error('Failed to delete resume:', error);
      toast.error('Failed to delete resume');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDownload = async () => {
    try {
      if (!resume?.url) {
        throw new Error('No resume to download');
      }

      // Extract file path from URL
      const urlParts = resume.url.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('resumes') + 1).join('/');

      const { data, error } = await supabase.storage
        .from('resumes')
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = resume.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      log.error('Failed to download resume:', error);
      toast.error('Failed to download resume');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 text-neon-pink animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-cyber-darker rounded-lg p-4 border border-red-500">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="text-center text-gray-400">
        <FileText className="h-12 w-12 mx-auto mb-4 text-neon-pink" />
        <p>No resume uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-cyber-darker rounded-lg p-4 border border-neon-cyan">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-neon-cyan" />
            <div>
              <h3 className="text-white font-medium">{resume.fileName}</h3>
              <p className="text-sm text-gray-400">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-neon-cyan hover:text-neon-pink transition-colors"
              title="Download Resume"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-neon-pink hover:text-red-500 transition-colors"
              title="Delete Resume"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {resume.parsedContent && (
          <div className="mt-4 border-t border-cyber-light pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-neon-cyan" />
              <h4 className="text-sm font-medium text-white">Parsed Content</h4>
            </div>
            <pre className="text-xs text-gray-400 overflow-x-auto">
              {JSON.stringify(resume.parsedContent, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-neon-pink" />
              <h3 className="text-lg font-semibold text-white">Delete Resume?</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this resume? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}