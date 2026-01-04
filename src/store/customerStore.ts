import { create } from 'zustand';
import type { Customer, CustomerFormData, CustomerFilters, CustomerStats } from '../types/customer';
import { CustomerService } from '../services/customerService';
import toast from 'react-hot-toast';

interface CustomerState {
  // Data
  customers: Customer[];
  selectedCustomer: Customer | null;
  stats: CustomerStats | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: CustomerFilters;
  
  // Actions
  setCustomers: (customers: Customer[]) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setStats: (stats: CustomerStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: CustomerFilters) => void;
  
  // Async Actions
  fetchCustomers: () => Promise<void>;
  fetchCustomer: (id: string) => Promise<void>;
  createCustomer: (customerData: CustomerFormData) => Promise<boolean>;
  updateCustomer: (id: string, customerData: Partial<CustomerFormData>) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;
  searchCustomers: (searchTerm: string) => Promise<Customer[]>;
  refreshStats: () => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  // Initial state
  customers: [],
  selectedCustomer: null,
  stats: null,
  loading: false,
  error: null,
  filters: {},
  
  // Setters
  setCustomers: (customers) => set({ customers }),
  setSelectedCustomer: (selectedCustomer) => set({ selectedCustomer }),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters }),
  
  // Async actions
  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const result = await CustomerService.getCustomers(filters);
      
      if (result.success && result.data) {
        set({ customers: result.data });
        get().refreshStats();
      } else {
        set({ error: result.error || 'Failed to fetch customers' });
        toast.error(result.error || 'Failed to fetch customers');
      }
    } catch {
      const errorMessage = 'Failed to fetch customers';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  fetchCustomer: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const result = await CustomerService.getCustomer(id);
      
      if (result.success && result.data) {
        set({ selectedCustomer: result.data });
      } else {
        set({ error: result.error || 'Failed to fetch customer' });
        toast.error(result.error || 'Failed to fetch customer');
      }
    } catch {
      const errorMessage = 'Failed to fetch customer';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  createCustomer: async (customerData: CustomerFormData) => {
    set({ loading: true, error: null });
    try {
      const result = await CustomerService.createCustomer(customerData);
      
      if (result.success) {
        toast.success('Customer created successfully');
        await get().fetchCustomers(); // Refresh the list
        return true;
      } else {
        set({ error: result.error || 'Failed to create customer' });
        toast.error(result.error || 'Failed to create customer');
        return false;
      }
    } catch {
      const errorMessage = 'Failed to create customer';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateCustomer: async (id: string, customerData: Partial<CustomerFormData>) => {
    set({ loading: true, error: null });
    try {
      const result = await CustomerService.updateCustomer(id, customerData);
      
      if (result.success) {
        toast.success('Customer updated successfully');
        await get().fetchCustomers(); // Refresh the list
        return true;
      } else {
        set({ error: result.error || 'Failed to update customer' });
        toast.error(result.error || 'Failed to update customer');
        return false;
      }
    } catch {
      const errorMessage = 'Failed to update customer';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteCustomer: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const result = await CustomerService.deleteCustomer(id);
      
      if (result.success) {
        toast.success('Customer deleted successfully');
        await get().fetchCustomers(); // Refresh the list
        return true;
      } else {
        set({ error: result.error || 'Failed to delete customer' });
        toast.error(result.error || 'Failed to delete customer');
        return false;
      }
    } catch {
      const errorMessage = 'Failed to delete customer';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  searchCustomers: async (searchTerm: string) => {
    try {
      const result = await CustomerService.searchCustomers(searchTerm);
      return result.success ? result.data || [] : [];
    } catch {
      toast.error('Failed to search customers');
      return [];
    }
  },

  refreshStats: () => {
    const { customers } = get();
    
    const stats: CustomerStats = {
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => c.status === 'active').length,
      inactiveCustomers: customers.filter(c => c.status === 'inactive').length,
      companiesCount: customers.filter(c => !!c.company).length,
    };
    
    set({ stats });
  },
}));
