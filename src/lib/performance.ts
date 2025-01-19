import logger from './logger';

const log = logger('Performance');

interface PerformanceMetrics {
  [key: string]: {
    count: number;
    totalTime: number;
    maxTime: number;
    minTime: number;
  };
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {};
  private enabled: boolean;

  private constructor() {
    this.enabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true';
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  async measure<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    if (!this.enabled) return fn();

    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      this.recordMetrics(operation, duration);
    }
  }

  private recordMetrics(operation: string, duration: number) {
    if (!this.metrics[operation]) {
      this.metrics[operation] = {
        count: 0,
        totalTime: 0,
        maxTime: 0,
        minTime: Infinity
      };
    }

    const metric = this.metrics[operation];
    metric.count++;
    metric.totalTime += duration;
    metric.maxTime = Math.max(metric.maxTime, duration);
    metric.minTime = Math.min(metric.minTime, duration);

    // Log slow operations
    if (duration > 1000) {
      log.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
    }
  }

  getMetrics() {
    return Object.entries(this.metrics).map(([operation, data]) => ({
      operation,
      avgTime: data.totalTime / data.count,
      maxTime: data.maxTime,
      minTime: data.minTime,
      count: data.count
    }));
  }

  reset() {
    this.metrics = {};
  }
}

export const performance = PerformanceMonitor.getInstance();