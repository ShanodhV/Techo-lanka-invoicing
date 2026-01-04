import type { Customer } from './customer';

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: Customer;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'partially-paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidDate?: Date;
  notes?: string;
  terms?: string;
  quotationId?: string; // Link to source quotation
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface InvoiceFormData {
  customerId?: string;
  customer?: {
    name: string;
    email?: string;
    phone: string;
    company?: string;
  };
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
  }[];
  taxRate: number;
  discountAmount: number;
  dueDate: Date;
  notes?: string;
  terms?: string;
  quotationId?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'bank-transfer' | 'check' | 'card' | 'other';
  reference?: string;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

export interface PaymentFormData {
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'bank-transfer' | 'check' | 'card' | 'other';
  reference?: string;
  notes?: string;
}

export interface InvoiceFilters {
  searchTerm?: string;
  status?: string;
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}

export interface InvoiceStats {
  totalInvoices: number;
  draftCount: number;
  sentCount: number;
  paidCount: number;
  partiallyPaidCount: number;
  overdueCount: number;
  cancelledCount: number;
  totalValue: number;
  totalPaid: number;
  totalOutstanding: number;
}

// Invoice statuses
export const INVOICE_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'sent', label: 'Sent', color: 'blue' },
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'partially-paid', label: 'Partially Paid', color: 'yellow' },
  { value: 'overdue', label: 'Overdue', color: 'red' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
] as const;

// Payment methods
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank-transfer', label: 'Bank Transfer' },
  { value: 'check', label: 'Check' },
  { value: 'card', label: 'Card' },
  { value: 'other', label: 'Other' },
] as const;
