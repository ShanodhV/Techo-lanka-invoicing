import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { CustomerService } from './customerService';
import { ProductService } from './productService';
import type { 
  Quotation, 
  QuotationFormData, 
  QuotationFilters, 
  QuotationItem,
} from '../types/quotation';
import type { ApiResponse } from '../types/customer';

export class QuotationService {
  private static COLLECTION = 'quotations';

  static async generateQuotationNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Get count for this month to generate sequence
    const q = query(
      collection(db, this.COLLECTION),
      where('quotationNumber', '>=', `QUO-${year}-${month}-`),
      where('quotationNumber', '<', `QUO-${year}-${month}-Z`)
    );
    
    const snapshot = await getDocs(q);
    const count = snapshot.size + 1;
    
    return `QUO-${year}-${month}-${String(count).padStart(4, '0')}`;
  }

  static async getQuotations(filters?: QuotationFilters): Promise<ApiResponse<Quotation[]>> {
    try {
      let q = query(
        collection(db, this.COLLECTION),
        orderBy('createdAt', 'desc')
      );

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters?.customerId) {
        q = query(q, where('customerId', '==', filters.customerId));
      }

      const snapshot = await getDocs(q);
      let quotations = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          
          // Fetch customer data
          const customerResult = await CustomerService.getCustomer(data.customerId);
          const customer = customerResult.success ? customerResult.data! : null;

          return {
            id: docSnapshot.id,
            ...data,
            customer,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            validUntil: data.validUntil?.toDate() || new Date(),
          } as Quotation;
        })
      );

      // Apply client-side filters
      if (filters?.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        quotations = quotations.filter(quotation =>
          quotation.quotationNumber.toLowerCase().includes(searchTerm) ||
          quotation.customer?.name.toLowerCase().includes(searchTerm) ||
          quotation.customer?.company?.toLowerCase().includes(searchTerm)
        );
      }

      if (filters?.dateFrom) {
        quotations = quotations.filter(quotation => 
          quotation.createdAt >= filters.dateFrom!
        );
      }

      if (filters?.dateTo) {
        quotations = quotations.filter(quotation => 
          quotation.createdAt <= filters.dateTo!
        );
      }

      return { success: true, data: quotations };
    } catch (error) {
      console.error('Error fetching quotations:', error);
      return { success: false, error: 'Failed to fetch quotations' };
    }
  }

  static async getQuotation(id: string): Promise<ApiResponse<Quotation>> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { success: false, error: 'Quotation not found' };
      }

      const data = docSnap.data();
      
      // Fetch customer data
      const customerResult = await CustomerService.getCustomer(data.customerId);
      const customer = customerResult.success ? customerResult.data! : null;

      const quotation = {
        id: docSnap.id,
        ...data,
        customer,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        validUntil: data.validUntil?.toDate() || new Date(),
      } as Quotation;

      return { success: true, data: quotation };
    } catch (error) {
      console.error('Error fetching quotation:', error);
      return { success: false, error: 'Failed to fetch quotation' };
    }
  }

  static async createQuotation(quotationData: QuotationFormData, userId: string): Promise<ApiResponse<Quotation>> {
    try {
      let customerId = quotationData.customerId;

      // Create customer if not exists
      if (!customerId && quotationData.customer) {
        const customerResult = await CustomerService.createCustomer(quotationData.customer);
        if (!customerResult.success) {
          return { success: false, error: 'Failed to create customer' };
        }
        customerId = customerResult.data!.id;
      }

      if (!customerId) {
        return { success: false, error: 'Customer is required' };
      }

      // Calculate quotation totals
      const items = await this.processQuotationItems(quotationData.items);
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const taxAmount = subtotal * (quotationData.taxRate / 100);
      const totalAmount = subtotal + taxAmount - quotationData.discountAmount;

      const quotationNumber = await this.generateQuotationNumber();
      const now = Timestamp.now();

      const docData = {
        quotationNumber,
        customerId,
        items,
        subtotal,
        taxRate: quotationData.taxRate,
        taxAmount,
        discountAmount: quotationData.discountAmount,
        totalAmount,
        status: 'draft',
        validUntil: Timestamp.fromDate(quotationData.validUntil),
        notes: quotationData.notes || '',
        terms: quotationData.terms || '',
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), docData);
      
      // Fetch the created quotation with customer data
      const result = await this.getQuotation(docRef.id);
      return result;
    } catch (error) {
      console.error('Error creating quotation:', error);
      return { success: false, error: 'Failed to create quotation' };
    }
  }

  static async updateQuotation(id: string, quotationData: Partial<QuotationFormData>): Promise<ApiResponse<Quotation>> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      let updateData: Record<string, unknown> = {
        updatedAt: Timestamp.now(),
      };

      // Update items if provided
      if (quotationData.items) {
        const items = await this.processQuotationItems(quotationData.items);
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const taxRate = quotationData.taxRate || 0;
        const discountAmount = quotationData.discountAmount || 0;
        const taxAmount = subtotal * (taxRate / 100);
        const totalAmount = subtotal + taxAmount - discountAmount;

        updateData = {
          ...updateData,
          items,
          subtotal,
          taxRate,
          taxAmount,
          discountAmount,
          totalAmount,
        };
      }

      // Update other fields
      if (quotationData.validUntil) {
        updateData.validUntil = Timestamp.fromDate(quotationData.validUntil);
      }

      if (quotationData.notes !== undefined) updateData.notes = quotationData.notes;
      if (quotationData.terms !== undefined) updateData.terms = quotationData.terms;

      await updateDoc(docRef, updateData);

      // Fetch updated quotation
      const result = await this.getQuotation(id);
      return result;
    } catch (error) {
      console.error('Error updating quotation:', error);
      return { success: false, error: 'Failed to update quotation' };
    }
  }

  static async updateQuotationStatus(id: string, status: Quotation['status']): Promise<ApiResponse<Quotation>> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now(),
      });

      const result = await this.getQuotation(id);
      return result;
    } catch (error) {
      console.error('Error updating quotation status:', error);
      return { success: false, error: 'Failed to update quotation status' };
    }
  }

  static async deleteQuotation(id: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting quotation:', error);
      return { success: false, error: 'Failed to delete quotation' };
    }
  }

  private static async processQuotationItems(items: QuotationFormData['items']): Promise<QuotationItem[]> {
    return Promise.all(
      items.map(async (item, index) => {
        // Fetch product details
        const productResult = await ProductService.getProduct(item.productId);
        const product = productResult.success ? productResult.data! : null;

        const total = (item.quantity * item.unitPrice) - item.discount;

        return {
          id: `item-${index + 1}`,
          productId: item.productId,
          productName: product?.name || 'Unknown Product',
          description: product?.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          total,
        };
      })
    );
  }

  static async getQuotationsByCustomer(customerId: string): Promise<ApiResponse<Quotation[]>> {
    try {
      const filters: QuotationFilters = { customerId };
      return await this.getQuotations(filters);
    } catch (error) {
      console.error('Error fetching customer quotations:', error);
      return { success: false, error: 'Failed to fetch customer quotations' };
    }
  }
}
