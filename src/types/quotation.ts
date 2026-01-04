import type { Customer } from './customer';

export interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customer: Customer;
  items: QuotationItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: Date;
  notes?: string;
  terms?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface QuotationFormData {
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
  validUntil: Date;
  notes?: string;
  terms?: string;
}

export interface QuotationFilters {
  searchTerm?: string;
  status?: string;
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface QuotationStats {
  totalQuotations: number;
  draftCount: number;
  sentCount: number;
  acceptedCount: number;
  rejectedCount: number;
  expiredCount: number;
  totalValue: number;
}

// Quotation statuses
export const QUOTATION_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'sent', label: 'Sent', color: 'blue' },
  { value: 'accepted', label: 'Accepted', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'expired', label: 'Expired', color: 'yellow' },
] as const;
