import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { admin } from '../lib/admin';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import logger from '../lib/logger';

const log = logger('AdminGuard');

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [isChecking, setIsChecking] = React.useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const hasAccess = await admin.verifyAdminAccess();
        if (!hasAccess) {
          toast.error('Admin access required');
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        log.error('Admin access check failed:', error);
        navigate('/dashboard');
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-cyber-gradient flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-neon-pink animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}