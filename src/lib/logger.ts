type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface Logger {
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}

export default function createLogger(namespace: string): Logger {
  const formatMessage = (level: LogLevel, args: any[]): any[] => {
    return [`[${namespace}] [${level.toUpperCase()}]`, ...args];
  };

  return {
    error: (...args) => console.error(...formatMessage('error', args)),
    warn: (...args) => console.warn(...formatMessage('warn', args)),
    info: (...args) => console.info(...formatMessage('info', args)),
    debug: (...args) => console.debug(...formatMessage('debug', args))
  };
}