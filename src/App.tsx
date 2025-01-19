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

const AppContent: React.FC = () => {
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
      
      const isDocker = import.meta.env.VITE_DOCKER === 'true';
      
      // In Docker, don't clear environment variables, just show SecretsManager
      if (isDocker) {
        setNeedsCredentials(true);
      } else {
        // Clear invalid credentials from localStorage
        if (error.message?.includes('credentials') || error.message?.includes('database')) {
          localStorage.removeItem('VITE_SUPABASE_URL');
          localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
          localStorage.removeItem('VITE_SUPABASE_SERVICE_ROLE_KEY');
          localStorage.removeItem('secretsConfigured');
          setNeedsCredentials(true);
        } else {
          setError(error.message || 'Failed to initialize application');
        }
      }
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      {isLoading ? (
        <LoadingScreen />
      ) : error ? (
        <DatabaseError error={error} />
      ) : needsCredentials ? (
        <SecretsManager onCredentialsSet={() => setNeedsCredentials(false)} />
      ) : (
        <Routes>
          <Route path="/faq" element={<FAQ />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/request-access" element={<RequestAccess />} />
          <Route path="/approve-access" element={<ApproveAccess />} />
          <Route
            path="/dashboard/*"
            element={user ? <Dashboard /> : <Navigate to="/auth" state={{ from: location }} replace />}
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      )}
    </ErrorBoundary>
  );
};

export default function App() {
  return <AppContent />;
}