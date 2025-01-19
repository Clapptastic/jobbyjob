import { useEffect, useCallback, useRef } from 'react';
import logger from '../lib/logger';

const log = logger('useAutoRefresh');

interface AutoRefreshConfig {
  interval?: number; // in milliseconds
  immediate?: boolean;
  enabled?: boolean;
}

const DEFAULT_CONFIG: AutoRefreshConfig = {
  interval: 30000, // 30 seconds
  immediate: true,
  enabled: true
};

export function useAutoRefresh(
  callback: () => Promise<void>,
  config: AutoRefreshConfig = {}
) {
  const { interval, immediate, enabled } = { ...DEFAULT_CONFIG, ...config };
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const execute = useCallback(async () => {
    try {
      await callbackRef.current();
    } catch (error) {
      log.error('Auto-refresh error:', error);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Initial load
    if (immediate) {
      execute();
    }

    // Set up interval
    const refresh = () => {
      timeoutRef.current = setTimeout(async () => {
        await execute();
        refresh();
      }, interval);
    };

    refresh();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [execute, interval, immediate, enabled]);

  return {
    refresh: execute
  };
}