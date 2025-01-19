import React, { createContext, useContext, useState, useCallback } from 'react';
import DatabaseErrorModal from './DatabaseErrorModal';

interface DatabaseErrorContextType {
  showError: (error: string) => void;
  clearError: () => void;
}

const DatabaseErrorContext = createContext<DatabaseErrorContextType>({
  showError: () => {},
  clearError: () => {}
});

export const useDatabaseError = () => useContext(DatabaseErrorContext);

export function DatabaseErrorProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);

  const showError = useCallback((error: string) => {
    setError(error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <DatabaseErrorContext.Provider value={{ showError, clearError }}>
      {children}
      {error && (
        <DatabaseErrorModal 
          error={error}
          onClose={clearError}
          onRetry={handleRetry}
        />
      )}
    </DatabaseErrorContext.Provider>
  );
}