import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import type { Product, ProductFormData, ApiResponse } from '../types/product';

const PRODUCTS_COLLECTION = 'products';

export class ProductService {
  /**
   * Get all products with optional filtering
   */
  static async getProducts(filters?: {
    category?: string;
    status?: string;
    searchTerm?: string;
  }): Promise<ApiResponse<Product[]>> {
    try {
      let q = query(
        collection(db, PRODUCTS_COLLECTION),
        orderBy('createdAt', 'desc')
      );

      // Add filters if provided
      if (filters?.category && filters.category !== 'all') {
        q = query(q, where('category', '==', filters.category));
      }

      if (filters?.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }

      const querySnapshot = await getDocs(q);
      let products: Product[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Product);
      });

      // Apply search term filter (client-side for now)
      if (filters?.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        products = products.filter(product =>
          product.name.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower)
        );
      }

      return { success: true, data: products };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { 
        success: false, 
        error: 'Failed to fetch products. Please try again.' 
      };
    }
  }

  /**
   * Get a single product by ID
   */
  static async getProduct(id: string): Promise<ApiResponse<Product>> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { 
          success: false, 
          error: 'Product not found' 
        };
      }

      const data = docSnap.data();
      const product: Product = {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Product;

      return { success: true, data: product };
    } catch (error) {
      console.error('Error fetching product:', error);
      return { 
        success: false, 
        error: 'Failed to fetch product. Please try again.' 
      };
    }
  }

  /**
   * Create a new product
   */
  static async createProduct(productData: ProductFormData): Promise<ApiResponse<Product>> {
    try {
      const now = Timestamp.now();
      
      // Calculate status based on stock
      let status: Product['status'] = 'active';
      if (productData.stock === 0) {
        status = 'out-of-stock';
      } else if (productData.stock <= (productData.lowStockThreshold || 5)) {
        status = 'low-stock';
      }

      const newProduct = {
        ...productData,
        status,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), newProduct);
      
      const createdProduct: Product = {
        id: docRef.id,
        ...newProduct,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      };

      return { success: true, data: createdProduct };
    } catch (error) {
      console.error('Error creating product:', error);
      return { 
        success: false, 
        error: 'Failed to create product. Please try again.' 
      };
    }
  }

  /**
   * Update an existing product
   */
  static async updateProduct(id: string, productData: Partial<ProductFormData>): Promise<ApiResponse<Product>> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      
      // Calculate status based on stock if stock is being updated
      const updateData: Record<string, unknown> = {
        ...productData,
        updatedAt: Timestamp.now(),
      };

      if (productData.stock !== undefined) {
        let status: Product['status'] = 'active';
        if (productData.stock === 0) {
          status = 'out-of-stock';
        } else if (productData.stock <= (productData.lowStockThreshold || 5)) {
          status = 'low-stock';
        }
        updateData.status = status;
      }

      await updateDoc(docRef, updateData);

      // Get the updated product
      const result = await this.getProduct(id);
      return result;
    } catch (error) {
      console.error('Error updating product:', error);
      return { 
        success: false, 
        error: 'Failed to update product. Please try again.' 
      };
    }
  }

  /**
   * Delete a product
   */
  static async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await deleteDoc(docRef);

      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { 
        success: false, 
        error: 'Failed to delete product. Please try again.' 
      };
    }
  }

  /**
   * Update product stock (for inventory management)
   */
  static async updateStock(id: string, newStock: number): Promise<ApiResponse<Product>> {
    try {
      return await this.updateProduct(id, { stock: newStock });
    } catch (error) {
      console.error('Error updating stock:', error);
      return { 
        success: false, 
        error: 'Failed to update stock. Please try again.' 
      };
    }
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(category: string): Promise<ApiResponse<Product[]>> {
    return await this.getProducts({ category });
  }

  /**
   * Get low stock products
   */
  static async getLowStockProducts(): Promise<ApiResponse<Product[]>> {
    return await this.getProducts({ status: 'low-stock' });
  }

  /**
   * Get product categories
   */
  static async getCategories(): Promise<ApiResponse<string[]>> {
    try {
      const result = await this.getProducts();
      if (!result.success || !result.data) {
        return { success: false, error: 'Failed to fetch categories' };
      }

      const categories = [...new Set(result.data.map((product: Product) => product.category))];
      return { success: true, data: categories.sort() };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { 
        success: false, 
        error: 'Failed to fetch categories. Please try again.' 
      };
    }
  }

  /**
   * Bulk update products
   */
  static async bulkUpdate(updates: { id: string; data: Partial<ProductFormData> }[]): Promise<ApiResponse<void>> {
    try {
      const batch = writeBatch(db);

      updates.forEach(({ id, data }) => {
        const docRef = doc(db, PRODUCTS_COLLECTION, id);
        batch.update(docRef, {
          ...data,
          updatedAt: Timestamp.now(),
        });
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error in bulk update:', error);
      return { 
        success: false, 
        error: 'Failed to update products. Please try again.' 
      };
    }
  }
}
