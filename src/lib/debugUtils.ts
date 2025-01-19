import { supabase } from './supabase';
import logger from './logger';

const log = logger('DebugUtils');

interface DebugConfig {
  enabled: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  showInConsole: boolean;
  trackPerformance: boolean;
  trackNetworkCalls: boolean;
  trackStorageOperations: boolean;
}

class DebugManager {
  private static instance: DebugManager;
  private config: DebugConfig = {
    enabled: false,
    logLevel: 'error',
    showInConsole: true,
    trackPerformance: false,
    trackNetworkCalls: false,
    trackStorageOperations: false
  };
  private initialized = false;

  private constructor() {}

  static getInstance(): DebugManager {
    if (!DebugManager.instance) {
      DebugManager.instance = new DebugManager();
    }
    return DebugManager.instance;
  }

  async initialize() {
    // Skip if already initialized or not in dev mode
    if (this.initialized || !import.meta.env.DEV) {
      return;
    }

    try {
      // Check if Supabase is initialized
      if (!supabase) {
        log.info('Skipping debug initialization - Supabase not ready');
        return;
      }

      // Check if debug_config table exists
      const { error: checkError } = await supabase
        .from('debug_config')
        .select('count')
        .single();

      // Create table if it doesn't exist
      if (checkError?.code === 'PGRST116') {
        await this.createDebugTable();
      } else if (checkError) {
        throw checkError;
      }

      // Load config
      const { data, error } = await supabase
        .from('debug_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        this.config = { ...this.config, ...data };
      } else {
        // Save default config if none exists
        await this.saveConfig(this.config);
      }

      this.initialized = true;
      log.info('Debug manager initialized successfully');

    } catch (error) {
      // Don't throw errors in debug manager - just log them
      log.error('Debug initialization error:', error);
      this.initialized = false;
    }
  }

  private async createDebugTable() {
    try {
      const sql = `
        create table if not exists public.debug_config (
          id uuid primary key default uuid_generate_v4(),
          enabled boolean default false,
          log_level text default 'error'::text,
          show_in_console boolean default true,
          track_performance boolean default false,
          track_network_calls boolean default false,
          track_storage_operations boolean default false,
          created_at timestamptz default now(),
          updated_at timestamptz default now()
        );

        create table if not exists public.debug_logs (
          id uuid primary key default uuid_generate_v4(),
          level text not null,
          data jsonb not null,
          created_at timestamptz default now()
        );
      `;

      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) throw error;

    } catch (error) {
      log.error('Failed to create debug tables:', error);
      throw error;
    }
  }

  async saveConfig(config: Partial<DebugConfig>) {
    try {
      // Skip if not initialized or not in dev mode
      if (!this.initialized || !import.meta.env.DEV) {
        return;
      }

      const updatedConfig = { ...this.config, ...config };

      const { error } = await supabase
        .from('debug_config')
        .upsert([{
          ...updatedConfig,
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      this.config = updatedConfig;
      log.info('Debug config saved successfully');

    } catch (error) {
      log.error('Failed to save debug config:', error);
    }
  }

  getConfig(): DebugConfig {
    return { ...this.config };
  }

  isEnabled(): boolean {
    return this.config.enabled && import.meta.env.DEV;
  }

  async logError(error: any, context?: string) {
    if (!this.isEnabled()) return;

    try {
      const errorInfo = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      };

      if (this.config.showInConsole) {
        console.error('[Debug]', errorInfo);
      }

      await supabase
        .from('debug_logs')
        .insert([{
          level: 'error',
          data: errorInfo
        }]);

    } catch (err) {
      // Only log to console if debug logging fails
      console.error('Failed to log error:', err);
    }
  }
}

export const debugManager = DebugManager.getInstance();