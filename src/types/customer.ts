export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  company?: string;
  taxNumber?: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerFormData {
  name: string;
  email?: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  company?: string;
  taxNumber?: string;
  notes?: string;
}

export interface CustomerFilters {
  searchTerm?: string;
  status?: string;
  company?: boolean;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  companiesCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
