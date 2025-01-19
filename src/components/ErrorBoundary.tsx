import React, { Component, ErrorInfo, PropsWithChildren } from 'react';
import { AlertTriangle, WifiOff, Database, RefreshCw } from 'lucide-react';
import { errorReporting } from '../lib/errorReporting';
import logger from '../lib/logger';

const log = logger('ErrorBoundary');

interface State {
  hasError: boolean;
  error: Error | null;
  isOffline: boolean;
}

export default class ErrorBoundary extends Component<PropsWithChildren, State> {
  public state: State = {
    hasError: false,
    error: null,
    isOffline: !navigator.onLine
  };

  private handleOnlineStatus = () => {
    this.setState({ isOffline: !navigator.onLine });
  };

  componentDidMount() {
    window.addEventListener('online', this.handleOnlineStatus);
    window.addEventListener('offline', this.handleOnlineStatus);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnlineStatus);
    window.removeEventListener('offline', this.handleOnlineStatus);
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      isOffline: !navigator.onLine
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    log.error('Application error:', error, errorInfo);
    errorReporting.handleError(error);

    // Show error in loading screen if it exists
    const errorMessage = document.getElementById('error-message');
    const retryButton = document.getElementById('retry-button');
    const loadingText = document.getElementById('loading-text');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    if (errorMessage) {
      errorMessage.textContent = error.message || 'Application error occurred';
      errorMessage.style.display = 'block';
    }
    if (retryButton) retryButton.style.display = 'block';
    if (loadingText) loadingText.style.display = 'none';
    if (progressBar) progressBar.style.display = 'none';
    if (progressText) progressText.style.display = 'none';
  }

  private handleRetry = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.isOffline) {
      return (
        <div className="min-h-screen bg-cyber-gradient flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-cyber-light rounded-lg border border-neon-pink shadow-neon-glow p-6 text-center">
            <WifiOff className="h-12 w-12 text-neon-pink mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              No Internet Connection
            </h1>
            <p className="text-gray-400 mb-4">
              Please check your network connection and try again.
            </p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-neon-gradient text-white rounded-md shadow-neon-glow hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="h-4 w-4 inline mr-2" />
              Retry Connection
            </button>
          </div>
        </div>
      );
    }

    if (this.state.hasError) {
      const isDatabaseError = this.state.error?.message.includes('database') ||
                            this.state.error?.message.includes('supabase');

      return (
        <div className="min-h-screen bg-cyber-gradient flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-cyber-light rounded-lg border border-neon-pink shadow-neon-glow p-6 text-center">
            {isDatabaseError ? (
              <Database className="h-12 w-12 text-neon-pink mx-auto mb-4" />
            ) : (
              <AlertTriangle className="h-12 w-12 text-neon-pink mx-auto mb-4" />
            )}
            <h1 className="text-xl font-bold text-white mb-2">
              {isDatabaseError ? 'Database Connection Error' : 'Something went wrong'}
            </h1>
            <p className="text-gray-400 mb-4">
              {isDatabaseError
                ? 'Unable to connect to the database. Please try again in a few moments.'
                : 'We\'ve encountered an error and are working to fix it.'}
            </p>
            <div className="space-y-4">
              <button
                onClick={this.handleRetry}
                className="w-full px-4 py-2 bg-neon-gradient text-white rounded-md shadow-neon-glow hover:opacity-90 transition-opacity"
              >
                <RefreshCw className="h-4 w-4 inline mr-2" />
                Try Again
              </button>
              <a
                href="/"
                className="block w-full px-4 py-2 border border-neon-cyan text-neon-cyan rounded-md hover:bg-cyber-darker transition-colors"
              >
                Return Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}