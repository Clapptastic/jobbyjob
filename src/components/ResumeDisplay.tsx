import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';
import ParsedResumeDisplay from './ParsedResumeDisplay';

const log = logger('ResumeDisplay');

interface ResumeDisplayProps {
  resumeUrl: string;
  fileName: string;
  onDelete: () => void;
}

export default function ResumeDisplay({ resumeUrl, fileName, onDelete }: ResumeDisplayProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [parsedContent, setParsedContent] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadParsedContent();
  }, [resumeUrl]);

  const loadParsedContent = async () => {
    try {
      setLoading(true);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('resume_content')
        .single();

      if (error) throw error;
      setParsedContent(profile?.resume_content);
    } catch (error) {
      log.error('Failed to load parsed content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      // Extract the file path from the URL
      const urlParts = resumeUrl.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('resumes') + 1).join('/');

      const { data, error } = await supabase.storage
        .from('resumes')
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      log.error('Download failed:', error);
      toast.error('Failed to download resume');
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Extract file path from URL
      const urlParts = resumeUrl.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('resumes') + 1).join('/');

      const { error } = await supabase.storage
        .from('resumes')
        .remove([filePath]);

      if (error) throw error;

      toast.success('Resume deleted successfully');
      onDelete();
    } catch (error) {
      log.error('Delete failed:', error);
      toast.error('Failed to delete resume');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="bg-cyber-darker rounded-lg p-4 border border-neon-cyan">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <FileText className="h-8 w-8 text-neon-cyan" />
            <div>
              <h3 className="text-white font-medium">{fileName}</h3>
              <p className="text-sm text-gray-400">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            {loading ? (
              <Loader2 className="h-4 w-4 text-neon-cyan animate-spin" />
            ) : (
              parsedContent && (
                isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-neon-cyan" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-neon-cyan" />
                )
              )
            )}
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

        {isExpanded && parsedContent && (
          <ParsedResumeDisplay parsedContent={parsedContent} />
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
    </>
  );
}