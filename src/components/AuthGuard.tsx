import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';

const log = logger('AuthGuard');

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useStore((state) => state.user);
  const [isChecking, setIsChecking] = React.useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsChecking(true);

        if (!user) {
          // Save the attempted URL for redirect after login
          navigate('/login', { 
            replace: true,
            state: { from: location.pathname }
          });
          return;
        }

        // Check if access request is required
        const requireAccessRequest = localStorage.getItem('requireAccessRequest') === 'true';
        if (requireAccessRequest) {
          navigate('/request-access', { replace: true });
          return;
        }

      } catch (error) {
        log.error('Auth check failed:', error);
        toast.error('Authentication error. Please try again.');
        navigate('/login', { replace: true });
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [navigate, user, location]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-cyber-gradient flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-neon-pink animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}