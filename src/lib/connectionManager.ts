import { supabase, reinitialize } from './supabase';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('ConnectionManager');

class ConnectionManager {
  private static instance: ConnectionManager;
  private isCheckingConnection = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  private handleOnline = () => {
    log.info('Network connection restored');
    this.reconnectAttempts = 0;
    this.checkConnection();
  };

  private handleOffline = () => {
    log.warn('Network connection lost');
    toast.error('Network connection lost. Retrying when online...');
  };

  async checkConnection(): Promise<boolean> {
    if (this.isCheckingConnection) return false;
    this.isCheckingConnection = true;

    try {
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) throw error;
      
      if (this.reconnectAttempts > 0) {
        toast.success('Connection restored');
      }
      
      this.reconnectAttempts = 0;
      return true;
    } catch (error) {
      log.error('Connection check failed:', error);
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        log.info(`Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        
        setTimeout(() => {
          reinitialize();
          this.checkConnection();
        }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
      } else {
        toast.error('Failed to establish connection. Please refresh the page.');
      }
      
      return false;
    } finally {
      this.isCheckingConnection = false;
    }
  }

  resetConnection() {
    this.reconnectAttempts = 0;
    reinitialize();
    return this.checkConnection();
  }
}

export const connectionManager = ConnectionManager.getInstance();