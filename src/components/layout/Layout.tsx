import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Clock,
} from 'lucide-react';
import { useAuthStore, useSessionStore } from '../../store';
import { AuthService, checkSessionTimeout } from '../../services/auth';
import { SessionTimeoutModal } from '../auth/ProtectedRoute';
import toast from 'react-hot-toast';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Quotations', href: '/quotations', icon: FileText },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Settings', href: '/settings', icon: Settings, adminOnly: true },
];

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(0);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0);
  const { user } = useAuthStore();
  const { sessionData } = useSessionStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Update session time left every minute
  useEffect(() => {
    const updateSessionTime = () => {
      if (!sessionData) {
        setSessionTimeLeft(0);
        return;
      }
      const timeLeft = sessionData.expiresAt - Date.now();
      setSessionTimeLeft(Math.max(0, Math.floor(timeLeft / 1000 / 60))); // in minutes
    };

    updateSessionTime(); // Initial update
    const interval = setInterval(updateSessionTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [sessionData]);

  useEffect(() => {
    // Check for session timeout every 30 seconds
    const interval = setInterval(() => {
      checkSessionTimeout(
        () => {
          // Show warning modal with 5 minutes left
          setShowTimeoutModal(true);
          setTimeoutCountdown(300); // 5 minutes in seconds
        },
        async () => {
          // Session expired
          await AuthService.signOut();
          toast.error('Your session has expired');
          navigate('/login');
        }
      );
    }, 30000);

    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    // Countdown timer for timeout modal
    let countdownInterval: number;
    
    if (showTimeoutModal && timeoutCountdown > 0) {
      countdownInterval = setInterval(() => {
        setTimeoutCountdown(prev => {
          if (prev <= 1) {
            setShowTimeoutModal(false);
            AuthService.signOut();
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [showTimeoutModal, timeoutCountdown, navigate]);

  const handleExtendSession = () => {
    AuthService.extendSession();
    setShowTimeoutModal(false);
    setTimeoutCountdown(0);
    toast.success('Session extended successfully');
  };

  const handleLogout = async () => {
    const result = await AuthService.signOut();
    if (result.success) {
      toast.success('Signed out successfully');
      navigate('/login');
    } else {
      toast.error('Failed to sign out');
    }
  };

  const isCurrentPage = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const filteredSidebarItems = sidebarItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  const getSessionTimeLeft = () => sessionTimeLeft;

  return (
    <div className="flex h-screen">
      {/* Fixed Sidebar for desktop */}
      <aside className="hidden md:block w-64 bg-white border-r border-gray-200 shadow-lg">
        <div className="flex flex-col h-full">
            {/* Company logo and name */}
            <div className="flex items-center px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-primary-100">
              <div className="h-10 w-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3 text-left">
                <p className="text-lg font-bold text-gray-900">Techo Lanka</p>
                <p className="text-xs text-gray-500 font-medium">CCTV Management</p>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="px-3 space-y-1">
                {filteredSidebarItems.map((item) => {
                  const Icon = item.icon;
                  const current = isCurrentPage(item.href);
                  return (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.href)}
                      className={`group w-full text-left flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        current 
                          ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border border-primary-200 shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`mr-3 h-5 w-5 transition-colors ${
                        current ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                      }`} />
                      <span className="font-medium">{item.name}</span>
                      {current && <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></div>}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Session info and user menu */}
            <div className="flex-shrink-0 border-t border-gray-100 p-4 bg-gray-50">
              <div className="mb-3 px-3 py-2 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center text-xs text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-primary-500" />
                  <span className="font-medium">Session expires in {getSessionTimeLeft()}min</span>
                </div>
              </div>
              <div className="flex items-center px-3 py-2 bg-white rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-gradient-to-r from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.displayName || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize font-medium">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity ease-linear duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        
        <div
          className={`fixed inset-y-0 left-0 flex flex-col max-w-xs w-full bg-white transform ease-in-out duration-300 shadow-xl ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Mobile sidebar content */}
          <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-lg font-bold">Techo Lanka</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Mobile navigation */}
          <nav className="flex-1 mt-4 px-3 space-y-2 overflow-y-auto">
            {filteredSidebarItems.map((item) => {
              const Icon = item.icon;
              const current = isCurrentPage(item.href);
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`group w-full text-left flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    current 
                      ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border border-primary-200' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 transition-colors ${
                    current ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  <span className="font-medium">{item.name}</span>
                  {current && <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></div>}
                </button>
              );
            })}
          </nav>
          
          {/* Mobile user info */}
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center text-left">
                <div className="h-8 w-8 bg-gradient-to-r from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.displayName || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area - starts immediately after sidebar */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Top navigation for mobile */}
        <div className="md:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                <Bell className="h-5 w-5" />
              </button>
              <div className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full border border-primary-200">
                {getSessionTimeLeft()}min left
              </div>
            </div>
          </div>
        </div>

        {/* Page content - full width, zero gaps */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* Session timeout modal */}
      <SessionTimeoutModal
        show={showTimeoutModal}
        onExtend={handleExtendSession}
        onLogout={handleLogout}
        timeLeft={timeoutCountdown}
      />
    </div>
  );
};
