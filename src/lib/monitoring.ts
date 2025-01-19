import { createLogger } from './debugUtils';

const logger = createLogger('Monitoring');

interface MonitoringConfig {
  enabled: boolean;
  sampleRate: number;
  errorThreshold: number;
}

class PerformanceMonitor {
  private metrics: {
    [key: string]: {
      count: number;
      totalTime: number;
      errors: number;
    };
  } = {};

  private config: MonitoringConfig = {
    enabled: true,
    sampleRate: 0.1, // 10% of requests
    errorThreshold: 5
  };

  constructor(config?: Partial<MonitoringConfig>) {
    this.config = { ...this.config, ...config };
  }

  async measure<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return fn();
    }

    const start = performance.now();
    try {
      const result = await fn();
      this.recordSuccess(operation, performance.now() - start);
      return result;
    } catch (error) {
      this.recordError(operation, performance.now() - start);
      throw error;
    }
  }

  private recordSuccess(operation: string, duration: number) {
    if (!this.metrics[operation]) {
      this.metrics[operation] = { count: 0, totalTime: 0, errors: 0 };
    }
    
    this.metrics[operation].count++;
    this.metrics[operation].totalTime += duration;

    logger.debug(`Operation "${operation}" completed in ${duration.toFixed(2)}ms`);
  }

  private recordError(operation: string, duration: number) {
    if (!this.metrics[operation]) {
      this.metrics[operation] = { count: 0, totalTime: 0, errors: 0 };
    }

    this.metrics[operation].errors++;
    
    if (this.metrics[operation].errors >= this.config.errorThreshold) {
      logger.warn(`Operation "${operation}" has exceeded error threshold`);
    }
  }

  getMetrics() {
    return Object.entries(this.metrics).map(([operation, data]) => ({
      operation,
      avgDuration: data.totalTime / data.count,
      errorRate: data.errors / data.count,
      totalCalls: data.count
    }));
  }

  reset() {
    this.metrics = {};
  }
}

export const monitor = new PerformanceMonitor({
  enabled: import.meta.env.MODE === 'production',
  sampleRate: 0.1,
  errorThreshold: 5
});