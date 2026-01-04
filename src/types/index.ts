// User and Authentication Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'staff';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  costPrice: number;
  sellingPrice: number;
  quantityInStock: number;
  reorderLevel: number;
  warrantyPeriod: number; // in months
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ProductFormData {
  name: string;
  category: string;
  brand: string;
  costPrice: number;
  sellingPrice: number;
  quantityInStock: number;
  reorderLevel: number;
  warrantyPeriod: number;
}

// Customer Types
export interface Customer {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerFormData {
  name: string;
  company?: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
}

// Quotation Types
export interface QuotationItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  items: QuotationItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  validUntil: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface QuotationFormData {
  customerId: string;
  items: QuotationItem[];
  taxRate: number;
  discountAmount: number;
  notes?: string;
  validUntil: Date;
}

// Invoice Types
export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerDetails: {
    name: string;
    company?: string;
    phone: string;
    email?: string;
    address: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paidAmount: number;
  dueAmount: number;
  invoiceDate: Date;
  dueDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface InvoiceFormData {
  customerId: string;
  items: InvoiceItem[];
  taxRate: number;
  discountAmount: number;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paidAmount: number;
  dueDate: Date;
  notes?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalStockValue: number;
  totalInvoices: number;
  monthlySales: number;
  pendingQuotations: number;
  lowStockProducts: number;
}

export interface RecentActivity {
  id: string;
  type: 'invoice_created' | 'quotation_created' | 'product_added' | 'customer_added' | 'payment_received';
  description: string;
  timestamp: Date;
  userId: string;
}

// Common Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'date';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  validation?: Record<string, unknown>;
}

// Session Management Types
export interface SessionData {
  user: User;
  expiresAt: number;
  refreshToken?: string;
}

export interface SessionState {
  isAuthenticated: boolean;
  sessionData: SessionData | null;
  lastActivity: number;
  sessionTimeout: number; // in minutes
}
