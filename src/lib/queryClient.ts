import { QueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('QueryClient');

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 404s or auth errors
        if (error?.status === 404 || error?.status === 401) return false;
        return failureCount < 3;
      },
      onError: (error: any) => {
        log.error('Query error:', error);
        toast.error('Failed to fetch data. Please try again.');
      },
    },
    mutations: {
      retry: false,
      onError: (error: any) => {
        log.error('Mutation error:', error);
        toast.error('Failed to save changes. Please try again.');
      },
    },
  },
});