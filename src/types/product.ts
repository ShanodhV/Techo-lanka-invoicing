export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  sku?: string;
  price: number;
  cost?: number;
  stock: number;
  lowStockThreshold?: number;
  status: 'active' | 'low-stock' | 'out-of-stock' | 'discontinued';
  images?: string[];
  specifications?: Record<string, string>;
  warranty?: string;
  supplier?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFormData {
  name: string;
  description?: string;
  category: string;
  sku?: string;
  price: number;
  cost?: number;
  stock: number;
  lowStockThreshold?: number;
  images?: string[];
  specifications?: Record<string, string>;
  warranty?: string;
  supplier?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProductFilters {
  category?: string;
  status?: string;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface ProductStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  categories: number;
}

// Common product categories for CCTV business
export const PRODUCT_CATEGORIES = [
  'Security Camera',
  'IP Camera',
  'PTZ Camera',
  'Network Video Recorder',
  'Digital Video Recorder',
  'Accessories',
  'Cables',
  'Power Supply',
  'Storage',
  'Monitor',
  'Software',
  'Installation Tools',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

// Product status options
export const PRODUCT_STATUSES = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'low-stock', label: 'Low Stock', color: 'yellow' },
  { value: 'out-of-stock', label: 'Out of Stock', color: 'red' },
  { value: 'discontinued', label: 'Discontinued', color: 'gray' },
] as const;
