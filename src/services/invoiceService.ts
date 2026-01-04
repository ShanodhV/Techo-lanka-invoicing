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
import { QuotationService } from './quotationService';
import type { 
  Invoice, 
  InvoiceFormData, 
  InvoiceFilters, 
  InvoiceItem,
  Payment,
  PaymentFormData
} from '../types/invoice';
import type { ApiResponse } from '../types/customer';

export class InvoiceService {
  private static COLLECTION = 'invoices';
  private static PAYMENTS_COLLECTION = 'payments';

  static async generateInvoiceNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    
    // Get count for this year to generate sequence
    const q = query(
      collection(db, this.COLLECTION),
      where('invoiceNumber', '>=', `INV-${year}-`),
      where('invoiceNumber', '<', `INV-${year + 1}-`)
    );
    
    const snapshot = await getDocs(q);
    const count = snapshot.size + 1;
    
    return `INV-${year}-${String(count).padStart(4, '0')}`;
  }

  static async getInvoices(filters?: InvoiceFilters): Promise<ApiResponse<Invoice[]>> {
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
      let invoices = await Promise.all(
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
            dueDate: data.dueDate?.toDate() || new Date(),
            paidDate: data.paidDate?.toDate(),
          } as Invoice;
        })
      );

      // Apply client-side filters
      if (filters?.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        invoices = invoices.filter(invoice =>
          invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
          invoice.customer?.name.toLowerCase().includes(searchTerm) ||
          invoice.customer?.company?.toLowerCase().includes(searchTerm)
        );
      }

      if (filters?.dateFrom) {
        invoices = invoices.filter(invoice => 
          invoice.createdAt >= filters.dateFrom!
        );
      }

      if (filters?.dateTo) {
        invoices = invoices.filter(invoice => 
          invoice.createdAt <= filters.dateTo!
        );
      }

      if (filters?.dueDateFrom) {
        invoices = invoices.filter(invoice => 
          invoice.dueDate >= filters.dueDateFrom!
        );
      }

      if (filters?.dueDateTo) {
        invoices = invoices.filter(invoice => 
          invoice.dueDate <= filters.dueDateTo!
        );
      }

      return { success: true, data: invoices };
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return { success: false, error: 'Failed to fetch invoices' };
    }
  }

  static async getInvoice(id: string): Promise<ApiResponse<Invoice>> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { success: false, error: 'Invoice not found' };
      }

      const data = docSnap.data();
      
      // Fetch customer data
      const customerResult = await CustomerService.getCustomer(data.customerId);
      const customer = customerResult.success ? customerResult.data! : null;

      const invoice = {
        id: docSnap.id,
        ...data,
        customer,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        dueDate: data.dueDate?.toDate() || new Date(),
        paidDate: data.paidDate?.toDate(),
      } as Invoice;

      return { success: true, data: invoice };
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return { success: false, error: 'Failed to fetch invoice' };
    }
  }

  static async createInvoice(invoiceData: InvoiceFormData, userId: string): Promise<ApiResponse<Invoice>> {
    try {
      let customerId = invoiceData.customerId;

      // Create customer if not exists
      if (!customerId && invoiceData.customer) {
        const customerResult = await CustomerService.createCustomer(invoiceData.customer);
        if (!customerResult.success) {
          return { success: false, error: 'Failed to create customer' };
        }
        customerId = customerResult.data!.id;
      }

      if (!customerId) {
        return { success: false, error: 'Customer is required' };
      }

      // Calculate invoice totals
      const items = await this.processInvoiceItems(invoiceData.items);
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const taxAmount = subtotal * (invoiceData.taxRate / 100);
      const totalAmount = subtotal + taxAmount - invoiceData.discountAmount;

      const invoiceNumber = await this.generateInvoiceNumber();
      const now = Timestamp.now();

      const docData = {
        invoiceNumber,
        customerId,
        items,
        subtotal,
        taxRate: invoiceData.taxRate,
        taxAmount,
        discountAmount: invoiceData.discountAmount,
        totalAmount,
        paidAmount: 0,
        balanceAmount: totalAmount,
        status: 'draft',
        dueDate: Timestamp.fromDate(invoiceData.dueDate),
        notes: invoiceData.notes || '',
        terms: invoiceData.terms || '',
        quotationId: invoiceData.quotationId,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), docData);
      
      // If created from quotation, update quotation status
      if (invoiceData.quotationId) {
        await QuotationService.updateQuotationStatus(invoiceData.quotationId, 'accepted');
      }

      // Fetch the created invoice with customer data
      const result = await this.getInvoice(docRef.id);
      return result;
    } catch (error) {
      console.error('Error creating invoice:', error);
      return { success: false, error: 'Failed to create invoice' };
    }
  }

  static async updateInvoice(id: string, invoiceData: Partial<InvoiceFormData>): Promise<ApiResponse<Invoice>> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      let updateData: Record<string, unknown> = {
        updatedAt: Timestamp.now(),
      };

      // Update items if provided
      if (invoiceData.items) {
        const items = await this.processInvoiceItems(invoiceData.items);
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const taxRate = invoiceData.taxRate || 0;
        const discountAmount = invoiceData.discountAmount || 0;
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
          balanceAmount: totalAmount, // Reset balance when items change
        };
      }

      // Update other fields
      if (invoiceData.dueDate) {
        updateData.dueDate = Timestamp.fromDate(invoiceData.dueDate);
      }

      if (invoiceData.notes !== undefined) updateData.notes = invoiceData.notes;
      if (invoiceData.terms !== undefined) updateData.terms = invoiceData.terms;

      await updateDoc(docRef, updateData);

      // Fetch updated invoice
      const result = await this.getInvoice(id);
      return result;
    } catch (error) {
      console.error('Error updating invoice:', error);
      return { success: false, error: 'Failed to update invoice' };
    }
  }

  static async updateInvoiceStatus(id: string, status: Invoice['status']): Promise<ApiResponse<Invoice>> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      const updateData: Record<string, unknown> = {
        status,
        updatedAt: Timestamp.now(),
      };

      if (status === 'paid') {
        updateData.paidDate = Timestamp.now();
      }

      await updateDoc(docRef, updateData);

      const result = await this.getInvoice(id);
      return result;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      return { success: false, error: 'Failed to update invoice status' };
    }
  }

  static async addPayment(invoiceId: string, paymentData: PaymentFormData, userId: string): Promise<ApiResponse<Payment>> {
    try {
      // First, get the current invoice
      const invoiceResult = await this.getInvoice(invoiceId);
      if (!invoiceResult.success || !invoiceResult.data) {
        return { success: false, error: 'Invoice not found' };
      }

      const invoice = invoiceResult.data;
      const newPaidAmount = invoice.paidAmount + paymentData.amount;
      const newBalanceAmount = invoice.totalAmount - newPaidAmount;

      if (newPaidAmount > invoice.totalAmount) {
        return { success: false, error: 'Payment amount exceeds invoice total' };
      }

      // Create payment record
      const paymentDoc = {
        invoiceId,
        ...paymentData,
        paymentDate: Timestamp.fromDate(paymentData.paymentDate),
        createdAt: Timestamp.now(),
        createdBy: userId,
      };

      const paymentRef = await addDoc(collection(db, this.PAYMENTS_COLLECTION), paymentDoc);

      // Update invoice
      const invoiceRef = doc(db, this.COLLECTION, invoiceId);
      let newStatus: Invoice['status'] = 'sent';
      
      if (newBalanceAmount === 0) {
        newStatus = 'paid';
      } else if (newPaidAmount > 0) {
        newStatus = 'partially-paid';
      }

      const updateData: Record<string, unknown> = {
        paidAmount: newPaidAmount,
        balanceAmount: newBalanceAmount,
        status: newStatus,
        updatedAt: Timestamp.now(),
      };

      if (newStatus === 'paid') {
        updateData.paidDate = Timestamp.now();
      }

      await updateDoc(invoiceRef, updateData);

      const payment = {
        id: paymentRef.id,
        ...paymentDoc,
        paymentDate: paymentData.paymentDate,
        createdAt: new Date(),
      } as Payment;

      return { success: true, data: payment };
    } catch (error) {
      console.error('Error adding payment:', error);
      return { success: false, error: 'Failed to add payment' };
    }
  }

  static async getInvoicePayments(invoiceId: string): Promise<ApiResponse<Payment[]>> {
    try {
      const q = query(
        collection(db, this.PAYMENTS_COLLECTION),
        where('invoiceId', '==', invoiceId),
        orderBy('paymentDate', 'desc')
      );

      const snapshot = await getDocs(q);
      const payments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        paymentDate: doc.data().paymentDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Payment[];

      return { success: true, data: payments };
    } catch (error) {
      console.error('Error fetching payments:', error);
      return { success: false, error: 'Failed to fetch payments' };
    }
  }

  static async deleteInvoice(id: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return { success: false, error: 'Failed to delete invoice' };
    }
  }

  private static async processInvoiceItems(items: InvoiceFormData['items']): Promise<InvoiceItem[]> {
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

  static async getInvoicesByCustomer(customerId: string): Promise<ApiResponse<Invoice[]>> {
    try {
      const filters: InvoiceFilters = { customerId };
      return await this.getInvoices(filters);
    } catch (error) {
      console.error('Error fetching customer invoices:', error);
      return { success: false, error: 'Failed to fetch customer invoices' };
    }
  }

  static async createFromQuotation(quotationId: string, dueDate: Date, userId: string): Promise<ApiResponse<Invoice>> {
    try {
      // Fetch quotation
      const quotationResult = await QuotationService.getQuotation(quotationId);
      if (!quotationResult.success || !quotationResult.data) {
        return { success: false, error: 'Quotation not found' };
      }

      const quotation = quotationResult.data;

      // Create invoice from quotation data
      const invoiceData: InvoiceFormData = {
        customerId: quotation.customerId,
        items: quotation.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
        })),
        taxRate: quotation.taxRate,
        discountAmount: quotation.discountAmount,
        dueDate,
        notes: quotation.notes,
        terms: quotation.terms,
        quotationId: quotationId,
      };

      return await this.createInvoice(invoiceData, userId);
    } catch (error) {
      console.error('Error creating invoice from quotation:', error);
      return { success: false, error: 'Failed to create invoice from quotation' };
    }
  }
}
