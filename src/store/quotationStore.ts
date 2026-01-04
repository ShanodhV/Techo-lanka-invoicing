import { create } from 'zustand';
import type { Quotation, QuotationFormData, QuotationFilters, QuotationStats } from '../types/quotation';
import { QuotationService } from '../services/quotationService';
import toast from 'react-hot-toast';

interface QuotationState {
  // Data
  quotations: Quotation[];
  selectedQuotation: Quotation | null;
  stats: QuotationStats | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: QuotationFilters;
  
  // Actions
  setQuotations: (quotations: Quotation[]) => void;
  setSelectedQuotation: (quotation: Quotation | null) => void;
  setStats: (stats: QuotationStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: QuotationFilters) => void;
  
  // Async Actions
  fetchQuotations: () => Promise<void>;
  fetchQuotation: (id: string) => Promise<void>;
  createQuotation: (quotationData: QuotationFormData, userId: string) => Promise<boolean>;
  updateQuotation: (id: string, quotationData: Partial<QuotationFormData>) => Promise<boolean>;
  updateQuotationStatus: (id: string, status: Quotation['status']) => Promise<boolean>;
  deleteQuotation: (id: string) => Promise<boolean>;
  getCustomerQuotations: (customerId: string) => Promise<Quotation[]>;
  refreshStats: () => void;
}

export const useQuotationStore = create<QuotationState>((set, get) => ({
  // Initial state
  quotations: [],
  selectedQuotation: null,
  stats: null,
  loading: false,
  error: null,
  filters: {},
  
  // Setters
  setQuotations: (quotations) => set({ quotations }),
  setSelectedQuotation: (selectedQuotation) => set({ selectedQuotation }),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters }),
  
  // Async actions
  fetchQuotations: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const result = await QuotationService.getQuotations(filters);
      
      if (result.success && result.data) {
        set({ quotations: result.data });
        get().refreshStats();
      } else {
        set({ error: result.error || 'Failed to fetch quotations' });
        toast.error(result.error || 'Failed to fetch quotations');
      }
    } catch {
      const errorMessage = 'Failed to fetch quotations';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  fetchQuotation: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const result = await QuotationService.getQuotation(id);
      
      if (result.success && result.data) {
        set({ selectedQuotation: result.data });
      } else {
        set({ error: result.error || 'Failed to fetch quotation' });
        toast.error(result.error || 'Failed to fetch quotation');
      }
    } catch {
      const errorMessage = 'Failed to fetch quotation';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  createQuotation: async (quotationData: QuotationFormData, userId: string) => {
    set({ loading: true, error: null });
    try {
      const result = await QuotationService.createQuotation(quotationData, userId);
      
      if (result.success) {
        toast.success('Quotation created successfully');
        await get().fetchQuotations(); // Refresh the list
        return true;
      } else {
        set({ error: result.error || 'Failed to create quotation' });
        toast.error(result.error || 'Failed to create quotation');
        return false;
      }
    } catch {
      const errorMessage = 'Failed to create quotation';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateQuotation: async (id: string, quotationData: Partial<QuotationFormData>) => {
    set({ loading: true, error: null });
    try {
      const result = await QuotationService.updateQuotation(id, quotationData);
      
      if (result.success) {
        toast.success('Quotation updated successfully');
        await get().fetchQuotations(); // Refresh the list
        return true;
      } else {
        set({ error: result.error || 'Failed to update quotation' });
        toast.error(result.error || 'Failed to update quotation');
        return false;
      }
    } catch {
      const errorMessage = 'Failed to update quotation';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateQuotationStatus: async (id: string, status: Quotation['status']) => {
    set({ loading: true, error: null });
    try {
      const result = await QuotationService.updateQuotationStatus(id, status);
      
      if (result.success) {
        toast.success(`Quotation ${status} successfully`);
        await get().fetchQuotations(); // Refresh the list
        return true;
      } else {
        set({ error: result.error || 'Failed to update quotation status' });
        toast.error(result.error || 'Failed to update quotation status');
        return false;
      }
    } catch {
      const errorMessage = 'Failed to update quotation status';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteQuotation: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const result = await QuotationService.deleteQuotation(id);
      
      if (result.success) {
        toast.success('Quotation deleted successfully');
        await get().fetchQuotations(); // Refresh the list
        return true;
      } else {
        set({ error: result.error || 'Failed to delete quotation' });
        toast.error(result.error || 'Failed to delete quotation');
        return false;
      }
    } catch {
      const errorMessage = 'Failed to delete quotation';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  getCustomerQuotations: async (customerId: string) => {
    try {
      const result = await QuotationService.getQuotationsByCustomer(customerId);
      return result.success ? result.data || [] : [];
    } catch {
      toast.error('Failed to fetch customer quotations');
      return [];
    }
  },

  refreshStats: () => {
    const { quotations } = get();
    
    const stats: QuotationStats = {
      totalQuotations: quotations.length,
      draftCount: quotations.filter(q => q.status === 'draft').length,
      sentCount: quotations.filter(q => q.status === 'sent').length,
      acceptedCount: quotations.filter(q => q.status === 'accepted').length,
      rejectedCount: quotations.filter(q => q.status === 'rejected').length,
      expiredCount: quotations.filter(q => q.status === 'expired').length,
      totalValue: quotations.reduce((sum, quotation) => sum + quotation.totalAmount, 0),
    };
    
    set({ stats });
  },
}));
