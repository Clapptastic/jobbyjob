import React, { useState, useEffect, useCallback } from 'react';
import { PlayCircle, Loader2, AlertCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { jobProcessing } from '../lib/jobProcessing';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';
import ProcessingStatus from './ProcessingStatus';
import ProcessingTimeInfo from './ProcessingTimeInfo';
import { formatDistanceToNow, addMinutes } from 'date-fns';

const log = logger('AutomatedJobProcess');

const POLLING_INTERVAL = 2000; // 2 seconds
const RATE_LIMIT_MINUTES = 5;
const MAX_RETRIES = 3;

const PROCESSING_STEPS = [
  {
    id: 'resume',
    name: 'Resume Analysis',
    description: 'Analyzing your resume',
    status: 'pending'
  },
  {
    id: 'search',
    name: 'Job Search',
    description: 'Finding matching positions',
    status: 'pending'
  },
  {
    id: 'match',
    name: 'Match Analysis',
    description: 'Calculating match scores',
    status: 'pending'
  },
  {
    id: 'save',
    name: 'Saving',
    description: 'Storing matched jobs',
    status: 'pending'
  }
];

export default function AutomatedJobProcess() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLogId, setCurrentLogId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [estimatedEndTime, setEstimatedEndTime] = useState<Date | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'processing' | 'complete' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);
  const [nextAllowedTime, setNextAllowedTime] = useState<Date | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const user = useStore((state) => state.user);

  useEffect(() => {
    if (user?.id) {
      checkExistingProcess();
      checkRateLimit();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing && currentLogId) {
      interval = setInterval(checkProgress, POLLING_INTERVAL);
    }
    return () => clearInterval(interval);
  }, [isProcessing, currentLogId]);

  const checkRateLimit = useCallback(async () => {
    try {
      if (!user?.id) return;

      const { data: lastLog } = await supabase
        .from('job_processing_logs')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastLog) {
        const lastProcessTime = new Date(lastLog.created_at);
        const nextAllowed = addMinutes(lastProcessTime, RATE_LIMIT_MINUTES);
        
        if (nextAllowed > new Date()) {
          setNextAllowedTime(nextAllowed);
        }
      }
    } catch (error) {
      log.error('Failed to check rate limit:', error);
    }
  }, [user?.id]);

  const checkExistingProcess = useCallback(async () => {
    try {
      if (!user?.id) return;

      const { data: log } = await supabase
        .from('job_processing_logs')
        .select('*')
        .eq('user_id', user.id)
        .is('completed_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (log) {
        setCurrentLogId(log.id);
        setStartTime(new Date(log.started_at));
        setIsProcessing(true);
        await checkProgress();
      }
    } catch (error) {
      log.error('Failed to check existing process:', error);
    }
  }, [user?.id]);

  const calculateCurrentStep = (progress: number): number => {
    if (progress >= 75) return 3; // Saving
    if (progress >= 50) return 2; // Match Analysis
    if (progress >= 25) return 1; // Job Search
    return 0; // Resume Analysis
  };

  const checkProgress = async () => {
    if (!currentLogId) return;

    try {
      const status = await jobProcessing.getStatus(currentLogId);
      
      setProgress(status.progress);
      setEstimatedEndTime(status.estimatedEndTime);
      setStatus(status.status);
      setError(status.error || null);
      setCurrentStep(calculateCurrentStep(status.progress));
      setRetryCount(0); // Reset retry count on successful update

      if (status.status !== 'processing') {
        setIsProcessing(false);
        setCurrentLogId(null);
        
        if (status.status === 'complete') {
          toast.success('Job processing completed successfully!');
        } else if (status.error) {
          toast.error(status.error);
        }
      }
    } catch (error: any) {
      log.error('Failed to check progress:', error);
      
      // Implement retry logic for network errors
      if (error.message?.includes('Failed to fetch') && retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(checkProgress, delay);
      } else {
        setError(error.message);
        setStatus('error');
        setIsProcessing(false);
      }
    }
  };

  const handleStartProcess = async () => {
    try {
      if (!user?.id) {
        throw new Error('Please sign in to process jobs');
      }

      if (nextAllowedTime && new Date() < nextAllowedTime) {
        throw new Error(`Please wait ${formatDistanceToNow(nextAllowedTime)} before starting another process`);
      }

      setIsProcessing(true);
      setStartTime(new Date());
      setProgress(0);
      setStatus('processing');
      setError(null);

      const logId = await jobProcessing.start(user.id);
      setCurrentLogId(logId);

      // Set next allowed time
      const nextAllowed = addMinutes(new Date(), RATE_LIMIT_MINUTES);
      setNextAllowedTime(nextAllowed);

    } catch (error: any) {
      log.error('Failed to start job processing:', error);
      setError(error.message);
      setStatus('error');
      setIsProcessing(false);
      toast.error(error.message);
    }
  };

  const handleCancel = async () => {
    try {
      if (!currentLogId) return;

      await jobProcessing.cancel(currentLogId);
      setIsProcessing(false);
      setCurrentLogId(null);
      setError('Processing cancelled by user');
      setStatus('error');
      toast.success('Job processing cancelled');
    } catch (error: any) {
      log.error('Failed to cancel job processing:', error);
      toast.error('Failed to cancel job processing');
    }
  };

  return (
    <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-neon-cyan">Automated Job Search</h2>
          <p className="text-sm text-gray-400 mt-1">
            Find and match jobs to your profile
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {nextAllowedTime && new Date() < nextAllowedTime && (
            <div className="flex items-center gap-2 text-sm text-neon-cyan">
              <Clock className="h-4 w-4" />
              <span>Available in {formatDistanceToNow(nextAllowedTime)}</span>
            </div>
          )}
          {isProcessing ? (
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <XCircle className="h-5 w-5 mr-2" />
              Cancel
            </button>
          ) : (
            <button
              onClick={handleStartProcess}
              disabled={nextAllowedTime !== null && new Date() < nextAllowedTime}
              className="inline-flex items-center px-6 py-3 bg-neon-gradient text-white rounded-md shadow-neon-glow hover:opacity-90 disabled:opacity-50 transition-all"
              title={nextAllowedTime && new Date() < nextAllowedTime ? `Available in ${formatDistanceToNow(nextAllowedTime)}` : undefined}
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              Start Process
            </button>
          )}
        </div>
      </div>

      {(isProcessing || status === 'error' || status === 'complete') && startTime && (
        <ProcessingStatus
          startTime={startTime}
          estimatedEndTime={estimatedEndTime}
          progress={progress}
          status={status}
          error={error}
          steps={PROCESSING_STEPS.map((step, index) => ({
            ...step,
            status: index === currentStep ? 'processing' : 
                   index < currentStep ? 'complete' : 
                   status === 'error' && index === currentStep ? 'error' : 'pending'
          }))}
        />
      )}

      <ProcessingTimeInfo />
    </div>
  );
}