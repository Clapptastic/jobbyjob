import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

// Initialize root element with error handling
const rootElement = document.getElementById('root');
if (!rootElement) {
  // Show error in loading screen
  const errorMessage = document.getElementById('error-message');
  const retryButton = document.getElementById('retry-button');
  const loadingText = document.getElementById('loading-text');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');

  if (errorMessage) errorMessage.style.display = 'block';
  if (retryButton) retryButton.style.display = 'block';
  if (loadingText) loadingText.style.display = 'none';
  if (progressBar) progressBar.style.display = 'none';
  if (progressText) progressText.style.display = 'none';
  
  throw new Error('Failed to find root element');
}

const root = createRoot(rootElement);

// Render app with error boundary
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'bg-cyber-light border border-neon-pink text-white',
            duration: 4000,
          }}
        />
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);