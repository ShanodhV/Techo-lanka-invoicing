import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, useSessionStore } from '../../store';
import { AuthService } from '../../services/auth';
import toast from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const [isChecking, setIsChecking] = useState(true);
  const { user, loading } = useAuthStore();
  const { isAuthenticated, isSessionValid } = useSessionStore();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for auth state to be resolved
      if (loading) return;
      
      // Check if session is still valid
      if (isAuthenticated && !isSessionValid()) {
        // Session expired, logout
        await AuthService.signOut();
        toast.error('Your session has expired. Please sign in again.');
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, [loading, isAuthenticated, isSessionValid]);

  // Show loading while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
          <p className="mt-2 text-xs text-gray-500">User: {user ? 'Logged in' : 'Not logged in'}</p>
          <p className="text-xs text-gray-500">Auth state: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user || !isAuthenticated || !isSessionValid()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    toast.error('You do not have permission to access this page.');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Higher-order component for admin-only routes
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
);

// Component to show session timeout warning
interface SessionTimeoutModalProps {
  show: boolean;
  onExtend: () => void;
  onLogout: () => void;
  timeLeft: number;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  show,
  onExtend,
  onLogout,
  timeLeft,
}) => {
  if (!show) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Session Timeout Warning</h3>
          <p className="mt-2 text-sm text-gray-500">
            Your session will expire in{' '}
            <span className="font-bold text-red-600">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
            . Do you want to extend your session?
          </p>
        </div>
        <div className="mt-6 flex space-x-3">
          <button
            onClick={onExtend}
            className="flex-1 btn-primary py-2 px-4 text-sm"
          >
            Extend Session
          </button>
          <button
            onClick={onLogout}
            className="flex-1 btn-secondary py-2 px-4 text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
