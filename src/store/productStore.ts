import { create } from 'zustand';
import type { Product, ProductFilters, ProductStats, ProductFormData } from '../types/product';
import { ProductService } from '../services/productService';
import toast from 'react-hot-toast';

interface ProductState {
  // Data
  products: Product[];
  selectedProduct: Product | null;
  categories: string[];
  stats: ProductStats | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  
  // Actions
  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setCategories: (categories: string[]) => void;
  setStats: (stats: ProductStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: ProductFilters) => void;
  
  // Async Actions
  fetchProducts: () => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (productData: ProductFormData) => Promise<boolean>;
  updateProduct: (id: string, productData: ProductFormData) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  fetchCategories: () => Promise<void>;
  refreshStats: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  // Initial state
  products: [],
  selectedProduct: null,
  categories: [],
  stats: null,
  loading: false,
  error: null,
  filters: {},
  
  // Setters
  setProducts: (products) => set({ products }),
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
  setCategories: (categories) => set({ categories }),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters }),
  
  // Async actions
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const result = await ProductService.getProducts(filters);
      
      if (result.success && result.data) {
        set({ products: result.data });
        get().refreshStats();
      } else {
        set({ error: result.error || 'Failed to fetch products' });
        toast.error(result.error || 'Failed to fetch products');
      }
    } catch {
      const errorMessage = 'Failed to fetch products';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  fetchProduct: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const result = await ProductService.getProduct(id);
      
      if (result.success && result.data) {
        set({ selectedProduct: result.data });
      } else {
        set({ error: result.error || 'Failed to fetch product' });
        toast.error(result.error || 'Failed to fetch product');
      }
    } catch {
      const errorMessage = 'Failed to fetch product';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  createProduct: async (productData: ProductFormData) => {
    set({ loading: true, error: null });
    try {
      const result = await ProductService.createProduct(productData);
      
      if (result.success) {
        toast.success('Product created successfully');
        await get().fetchProducts(); // Refresh the list
        return true;
      } else {
        set({ error: result.error || 'Failed to create product' });
        toast.error(result.error || 'Failed to create product');
        return false;
      }
    } catch {
      const errorMessage = 'Failed to create product';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateProduct: async (id: string, productData: ProductFormData) => {
    set({ loading: true, error: null });
    try {
      const result = await ProductService.updateProduct(id, productData);
      
      if (result.success) {
        toast.success('Product updated successfully');
        await get().fetchProducts(); // Refresh the list
        return true;
      } else {
        set({ error: result.error || 'Failed to update product' });
        toast.error(result.error || 'Failed to update product');
        return false;
      }
    } catch {
      const errorMessage = 'Failed to update product';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const result = await ProductService.deleteProduct(id);
      
      if (result.success) {
        toast.success('Product deleted successfully');
        await get().fetchProducts(); // Refresh the list
        return true;
      } else {
        set({ error: result.error || 'Failed to delete product' });
        toast.error(result.error || 'Failed to delete product');
        return false;
      }
    } catch {
      const errorMessage = 'Failed to delete product';
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const result = await ProductService.getCategories();
      if (result.success && result.data) {
        set({ categories: result.data });
      }
    } catch {
      console.error('Failed to fetch categories');
    }
  },

  refreshStats: () => {
    const { products } = get();
    
    const stats: ProductStats = {
      totalProducts: products.length,
      totalValue: products.reduce((sum, product) => sum + (product.price * product.stock), 0),
      lowStockCount: products.filter(p => p.status === 'low-stock').length,
      outOfStockCount: products.filter(p => p.status === 'out-of-stock').length,
      categories: new Set(products.map(p => p.category)).size,
    };
    
    set({ stats });
  },
}));
