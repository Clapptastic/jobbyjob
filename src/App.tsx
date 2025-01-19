import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from './store/useStore';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import SecretsManager from './components/SecretsManager';
import DatabaseError from './components/DatabaseError';
import FAQ from './components/FAQ';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import RequestAccess from './components/RequestAccess';
import ApproveAccess from './components/ApproveAccess';
import { supabase, checkConnection, verifyCredentialsFormat, getStoredCredentials } from './lib/supabase';
import { toast } from 'react-hot-toast';
import logger from './lib/logger';

const log = logger('App');

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsCredentials, setNeedsCredentials] = useState(false);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const location = useLocation();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      log.info('Initializing application...');
      setIsLoading(true);
      setError(null);
      setNeedsCredentials(false);

      // Get stored credentials
      const { url, anonKey } = getStoredCredentials();
      
      // Check if we have credentials
      if (!url || !anonKey) {
        log.info('No credentials found, showing SecretsManager');
        setNeedsCredentials(true);
        setIsLoading(false);
        return;
      }

      // Validate credentials format
      const issues = verifyCredentialsFormat(url, anonKey);
      if (issues.length > 0) {
        log.error('Invalid credentials format:', issues);
        setNeedsCredentials(true);
        setIsLoading(false);
        return;
      }

      // Check database connection
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error('Failed to connect to the database. Please check your credentials.');
      }

      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        log.info('Auth state changed:', event);
        if (event === 'SIGNED_IN') {
          setUser(session?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session?.user) {
        setUser(session.user);
      }

      log.info('Application initialized successfully');
      setIsLoading(false);

      // Return cleanup function
      return () => {
        subscription.unsubscribe();
      };
    } catch (error: any) {
      log.error('App initialization failed:', error);
      
      // Clear invalid credentials
      if (error.message?.includes('credentials') || error.message?.includes('database')) {
        localStorage.removeItem('VITE_SUPABASE_URL');
        localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
        localStorage.removeItem('VITE_SUPABASE_SERVICE_ROLE_KEY');
        localStorage.removeItem('secretsConfigured');
        setNeedsCredentials(true);
      } else {
        setError(error.message || 'Failed to initialize application');
      }
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (needsCredentials) {
    return <SecretsManager />;
  }

  if (error) {
    return <DatabaseError error={error} onRetry={initializeApp} />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-cyber-gradient">
        <Routes>
          {/* Public routes */}
          <Route path="/request-access" element={<RequestAccess />} />
          <Route path="/approve-access" element={<ApproveAccess />} />
          <Route path="/faq" element={<FAQ />} />
          
          {/* Auth routes */}
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Auth mode="login" />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Auth mode="signup" />} />
          <Route path="/reset-password" element={user ? <Navigate to="/dashboard" replace /> : <Auth mode="reset" />} />
          
          {/* Protected routes */}
          <Route path="/dashboard/*" element={user ? <Dashboard /> : <Navigate to="/login" replace state={{ from: location }} />} />
          
          {/* Root route */}
          <Route path="/" element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : localStorage.getItem('secretsConfigured') ? (
              <Navigate to="/login" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}