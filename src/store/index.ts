import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { User, AuthState, SessionData, SessionState } from '../types';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

interface SessionStore extends SessionState {
  setSession: (sessionData: SessionData | null) => void;
  updateLastActivity: () => void;
  isSessionValid: () => boolean;
  clearSession: () => void;
  extendSession: () => void;
}

// Session timeout in minutes (increased from 30 to 120 minutes)
const SESSION_TIMEOUT = 120;

// Auth store
export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        user: null,
        loading: false,
        error: null,
        setUser: (user) => set({ user, error: null }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        logout: () => set({ user: null, error: null, loading: false }),
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({ user: state.user }),
      }
    )
  )
);

// Session management store
export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      sessionData: null,
      lastActivity: Date.now(),
      sessionTimeout: SESSION_TIMEOUT,
      
      setSession: (sessionData) => {
        const now = Date.now();
        set({
          sessionData,
          isAuthenticated: !!sessionData,
          lastActivity: now,
        });
      },
      
      updateLastActivity: () => {
        set({ lastActivity: Date.now() });
      },
      
      isSessionValid: () => {
        const { sessionData, lastActivity, sessionTimeout } = get();
        if (!sessionData) return false;
        
        const now = Date.now();
        const sessionAge = now - lastActivity;
        const maxAge = sessionTimeout * 60 * 1000; // Convert to milliseconds
        
        // Check if session has expired
        if (sessionAge > maxAge) {
          get().clearSession();
          return false;
        }
        
        // Check if the session expiration time has passed
        if (now > sessionData.expiresAt) {
          get().clearSession();
          return false;
        }
        
        return true;
      },
      
      extendSession: () => {
        const { sessionData } = get();
        if (sessionData) {
          const newExpiresAt = Date.now() + (SESSION_TIMEOUT * 60 * 1000);
          set({
            sessionData: { ...sessionData, expiresAt: newExpiresAt },
            lastActivity: Date.now(),
          });
        }
      },
      
      clearSession: () => {
        set({
          isAuthenticated: false,
          sessionData: null,
          lastActivity: Date.now(),
        });
      },
    }),
    {
      name: 'session-store',
      partialize: (state) => ({
        sessionData: state.sessionData,
        lastActivity: state.lastActivity,
        sessionTimeout: state.sessionTimeout,
      }),
    }
  )
);

// Dashboard store
interface DashboardStore {
  stats: {
    totalStockValue: number;
    totalInvoices: number;
    monthlySales: number;
    pendingQuotations: number;
    lowStockProducts: number;
  };
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
  }>;
  loading: boolean;
  setStats: (stats: {
    totalStockValue: number;
    totalInvoices: number;
    monthlySales: number;
    pendingQuotations: number;
    lowStockProducts: number;
  }) => void;
  setRecentActivities: (activities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
  }>) => void;
  setLoading: (loading: boolean) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: {
    totalStockValue: 0,
    totalInvoices: 0,
    monthlySales: 0,
    pendingQuotations: 0,
    lowStockProducts: 0,
  },
  recentActivities: [],
  loading: false,
  setStats: (stats) => set({ stats }),
  setRecentActivities: (recentActivities) => set({ recentActivities }),
  setLoading: (loading) => set({ loading }),
}));

// Product store
interface ProductStore {
  products: Record<string, unknown>[];
  loading: boolean;
  error: string | null;
  setProducts: (products: Record<string, unknown>[]) => void;
  addProduct: (product: Record<string, unknown>) => void;
  updateProduct: (id: string, product: Record<string, unknown>) => void;
  deleteProduct: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  setProducts: (products) => set({ products, error: null }),
  addProduct: (product) => set({ products: [...get().products, product] }),
  updateProduct: (id, updatedProduct) =>
    set({
      products: get().products.map((p) => (p.id === id ? updatedProduct : p)),
    }),
  deleteProduct: (id) =>
    set({ products: get().products.filter((p) => p.id !== id) }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// Customer store
interface CustomerStore {
  customers: Record<string, unknown>[];
  loading: boolean;
  error: string | null;
  setCustomers: (customers: Record<string, unknown>[]) => void;
  addCustomer: (customer: Record<string, unknown>) => void;
  updateCustomer: (id: string, customer: Record<string, unknown>) => void;
  deleteCustomer: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: [],
  loading: false,
  error: null,
  setCustomers: (customers) => set({ customers, error: null }),
  addCustomer: (customer) => set({ customers: [...get().customers, customer] }),
  updateCustomer: (id, updatedCustomer) =>
    set({
      customers: get().customers.map((c) =>
        c.id === id ? updatedCustomer : c
      ),
    }),
  deleteCustomer: (id) =>
    set({ customers: get().customers.filter((c) => c.id !== id) }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// Session activity monitoring
let activityTimer: number;

// Monitor user activity and update last activity timestamp
export const initializeSessionMonitoring = () => {
  const updateActivity = () => {
    const sessionStore = useSessionStore.getState();
    if (sessionStore.isAuthenticated && sessionStore.isSessionValid()) {
      sessionStore.updateLastActivity();
    }
  };

  // Update activity on user interactions
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  events.forEach((event) => {
    document.addEventListener(event, updateActivity, { passive: true });
  });

  // Check session validity every 5 minutes instead of every minute
  activityTimer = setInterval(() => {
    const sessionStore = useSessionStore.getState();
    if (sessionStore.isAuthenticated && !sessionStore.isSessionValid()) {
      // Session expired, logout user
      const authStore = useAuthStore.getState();
      authStore.logout();
      sessionStore.clearSession();
      
      // Show notification instead of immediate redirect
      console.warn('Session expired. Please login again.');
      // Only redirect if user tries to navigate
      // window.location.href = '/login';
    }
  }, 300000); // Check every 5 minutes instead of 1 minute
};

// Clean up session monitoring
export const cleanupSessionMonitoring = () => {
  if (activityTimer) {
    clearInterval(activityTimer);
  }
  
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  events.forEach((event) => {
    document.removeEventListener(event, () => {});
  });
};
