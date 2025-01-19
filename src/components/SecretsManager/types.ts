export interface Secret {
  name: string;
  value: string;
  required: boolean;
  description: string;
  instructions: string[];
  envKey: string;
  visible: boolean;
  error?: string;
  validate?: (value: string) => string | undefined;
}

export interface DebugConfig {
  enabled: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  showInConsole: boolean;
  trackPerformance: boolean;
  trackNetworkCalls: boolean;
  trackStorageOperations: boolean;
}