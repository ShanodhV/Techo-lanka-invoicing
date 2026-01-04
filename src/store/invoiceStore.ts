import { create } from 'zustand';
import type { Invoice, InvoiceFormData, InvoiceFilters, InvoiceStats, Payment, PaymentFormData } from '../types/invoice';
import { InvoiceService } from '../services/invoiceService';
import toast from 'react-hot-toast';

interface InvoiceState {
  // Data
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  invoicePayments: Payment[];
  stats: InvoiceStats | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: InvoiceFilters;
  
  // Actions
  setInvoices: (invoices: Invoice[]) => void;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  setInvoicePayments: (payments: Payment[]) => void;
  setStats: (stats: InvoiceStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: InvoiceFilters) => void;
  
  // Async Actions
  fetchInvoices: () => Promise<void>;
  fetchInvoice: (id: string) => Promise<void>;
  createInvoice: (invoiceData: InvoiceFormData, userId: string) => Promise<boolean>;
  updateInvoice: (id: string, invoiceData: Partial<InvoiceFormData>) => Promise<boolean>;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<boolean>;
  deleteInvoice: (id: string) => Promise<boolean>;
  addPayment: (invoiceId: string, paymentData: PaymentFormData, userId: string) => Promise<boolean>;
  fetchInvoicePayments: (invoiceId: string) => Promise<void>;
  createFromQuotation: (quotationId: string, dueDate: Date, userId: string) => Promise<boolean>;
  getCustomerInvoices: (customerId: string) => Promise<Invoice[]>;
  refreshStats: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  // Initial state
  invoices: [],
  selectedInvoice: null,
  invoicePayments: [],
  stats: null,
  loading: false,
  error: null,
  filters: {},
  
  // Setters
  setInvoices: (invoices) => set({ invoices }),
  setSelectedInvoice: (selectedInvoice) => set({ selectedInvoice }),
  setInvoicePayments: (invoicePayments) => set({ invoicePayments }),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters }),
  
  // Async actions
  fetchInvoices: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const result = await InvoiceService.getInvoices(filters);
      
      if (result.success && result.data) {
        set({ invoices: result.data });
        get().refreshStats();
      } else {
        set({ error: result.error || 'Failed to fetch invoices' });
        toast.error(result.error || 'Failed to fetch invoices');
      }
    } catch {
      const errorMessage = 'Failed to fetch invoices';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  fetchInvoice: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const result = await InvoiceService.getInvoice(id);
      
      if (result.success && result.data) {
        set({ selectedInvoice: result.data });
      } else {
        set({ error: result.error || 'Failed to fetch invoice' });
        toast.error(result.error || 'Failed to fetch invoice');
      }
    } catch {
      const errorMessage = 'Failed to fetch invoice';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  createInvoice: async (invoiceData: InvoiceFormData, userId: string) => {
    set({ loading: true, error: null });
    try {
      const result = await InvoiceService.createInvoice(invoiceData, userId);
      
      if (result.success) {
        toast.success('Invoice created successfully');
        await get().fetchInvoices(); // Refresh the list
        return true;
      } else {
        set({ error: result.error || 'Failed to create invoice' });
        toast.error(result.error || 'Failed to create invoice');
        return false;
      }
    } catch {
      const errorMessage = 'Failed to create invoice';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateInvoice: async (id: string, invoiceData: Partial<InvoiceFormData>) => {
    set({ loading: true, error: null });
    try {
      const result = await InvoiceService.updateInvoice(id, invoiceData);
      
      if (result.success) {
        toast.success('Invoice updated successfully');
        await get().fetchInvoices(); // Refresh the list
        return true;
      } else {
        set({ error: result.error || 'Failed to update invoice' });
        toast.error(result.error || 'Failed to update invoice');
        return false;
      }
    } catch {
      const errorMessage = 'Failed to update invoice';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateInvoiceStatus: async (id: string, status: Invoice['status']) => {
    set({ loading: true, error: null });
    try {
      const result = await InvoiceService.updateInvoiceStatus(id, status);
      
      if (result.success) {
        toast.success(`Invoice marked as ${status}`);
        await get().fetchInvoices(); // Refresh the list
        return true;
      } else {
        set({ error: result.error || 'Failed to update invoice status' });
        toast.error(result.error || 'Failed to update invoice status');
        return false;
      }
    } catch {
      const errorMessage = 'Failed to update invoice status';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteInvoice: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const result = await InvoiceService.deleteInvoice(id);
      
      if (result.success) {
        toast.success('Invoice deleted successfully');
        await get().fetchInvoices(); // Refresh the list
        return true;
      } else {
        set({ error: result.error || 'Failed to delete invoice' });
        toast.error(result.error || 'Failed to delete invoice');
        return false;
      }
    } catch {
      const errorMessage = 'Failed to delete invoice';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  addPayment: async (invoiceId: string, paymentData: PaymentFormData, userId: string) => {
    set({ loading: true, error: null });
    try {
      const result = await InvoiceService.addPayment(invoiceId, paymentData, userId);
      
      if (result.success) {
        toast.success('Payment added successfully');
        await get().fetchInvoices(); // Refresh the list
        await get().fetchInvoicePayments(invoiceId); // Refresh payments
        return true;
      } else {
        set({ error: result.error || 'Failed to add payment' });
        toast.error(result.error || 'Failed to add payment');
        return false;
      }
    } catch {
      const errorMessage = 'Failed to add payment';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchInvoicePayments: async (invoiceId: string) => {
    set({ loading: true, error: null });
    try {
      const result = await InvoiceService.getInvoicePayments(invoiceId);
      
      if (result.success && result.data) {
        set({ invoicePayments: result.data });
      } else {
        set({ error: result.error || 'Failed to fetch payments' });
        toast.error(result.error || 'Failed to fetch payments');
      }
    } catch {
      const errorMessage = 'Failed to fetch payments';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  createFromQuotation: async (quotationId: string, dueDate: Date, userId: string) => {
    set({ loading: true, error: null });
    try {
      const result = await InvoiceService.createFromQuotation(quotationId, dueDate, userId);
      
      if (result.success) {
        toast.success('Invoice created from quotation successfully');
        await get().fetchInvoices(); // Refresh the list
        return true;
      } else {
        set({ error: result.error || 'Failed to create invoice from quotation' });
        toast.error(result.error || 'Failed to create invoice from quotation');
        return false;
      }
    } catch {
      const errorMessage = 'Failed to create invoice from quotation';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  getCustomerInvoices: async (customerId: string) => {
    try {
      const result = await InvoiceService.getInvoicesByCustomer(customerId);
      return result.success ? result.data || [] : [];
    } catch {
      toast.error('Failed to fetch customer invoices');
      return [];
    }
  },

  refreshStats: () => {
    const { invoices } = get();
    
    const stats: InvoiceStats = {
      totalInvoices: invoices.length,
      draftCount: invoices.filter(i => i.status === 'draft').length,
      sentCount: invoices.filter(i => i.status === 'sent').length,
      paidCount: invoices.filter(i => i.status === 'paid').length,
      partiallyPaidCount: invoices.filter(i => i.status === 'partially-paid').length,
      overdueCount: invoices.filter(i => i.status === 'overdue').length,
      cancelledCount: invoices.filter(i => i.status === 'cancelled').length,
      totalValue: invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0),
      totalPaid: invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0),
      totalOutstanding: invoices.reduce((sum, invoice) => sum + invoice.balanceAmount, 0),
    };
    
    set({ stats });
  },
}));
