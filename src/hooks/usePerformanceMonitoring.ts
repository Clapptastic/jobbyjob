import { useEffect } from 'react';
import { performance } from '../lib/performance';
import logger from '../lib/logger';

const log = logger('usePerformanceMonitoring');

export function usePerformanceMonitoring(componentName: string) {
  useEffect(() => {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      log.debug(`${componentName} mounted for ${duration.toFixed(2)}ms`);
    };
  }, [componentName]);
}