import { registerSW } from 'virtual:pwa-register';
import logger from './lib/logger';

const log = logger('PWA');

// Add types for the injected service worker
declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: any) => void;
  }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

export function registerServiceWorker() {
  if (import.meta.env.DEV) {
    log.info('Registering service worker in development mode');
  }

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      log.info('New content available, please refresh');
      // You can show a toast notification here if needed
    },
    onOfflineReady() {
      log.info('App ready to work offline');
      // You can show a toast notification here if needed
    },
    onRegistered(registration) {
      log.info('Service worker registered:', registration);
    },
    onRegisterError(error) {
      log.error('Service worker registration failed:', error);
    }
  });

  return updateSW;
} 