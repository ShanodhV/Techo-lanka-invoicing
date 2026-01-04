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
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Customer, CustomerFormData, CustomerFilters, ApiResponse } from '../types/customer';

export class CustomerService {
  private static COLLECTION = 'customers';

  static async getCustomers(filters?: CustomerFilters): Promise<ApiResponse<Customer[]>> {
    try {
      let q = query(
        collection(db, this.COLLECTION),
        orderBy('updatedAt', 'desc')
      );

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }

      const snapshot = await getDocs(q);
      let customers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Customer[];

      // Apply client-side filters
      if (filters?.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        customers = customers.filter(customer =>
          customer.name.toLowerCase().includes(searchTerm) ||
          customer.email?.toLowerCase().includes(searchTerm) ||
          customer.phone.includes(searchTerm) ||
          customer.company?.toLowerCase().includes(searchTerm)
        );
      }

      if (filters?.company !== undefined) {
        customers = customers.filter(customer => 
          filters.company ? !!customer.company : !customer.company
        );
      }

      return { success: true, data: customers };
    } catch (error) {
      console.error('Error fetching customers:', error);
      return { success: false, error: 'Failed to fetch customers' };
    }
  }

  static async getCustomer(id: string): Promise<ApiResponse<Customer>> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { success: false, error: 'Customer not found' };
      }

      const customer = {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as Customer;

      return { success: true, data: customer };
    } catch (error) {
      console.error('Error fetching customer:', error);
      return { success: false, error: 'Failed to fetch customer' };
    }
  }

  static async createCustomer(customerData: CustomerFormData): Promise<ApiResponse<Customer>> {
    try {
      const now = Timestamp.now();
      const docData = {
        ...customerData,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), docData);
      
      const customer = {
        id: docRef.id,
        ...docData,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      } as Customer;

      return { success: true, data: customer };
    } catch (error) {
      console.error('Error creating customer:', error);
      return { success: false, error: 'Failed to create customer' };
    }
  }

  static async updateCustomer(id: string, customerData: Partial<CustomerFormData>): Promise<ApiResponse<Customer>> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      const updateData = {
        ...customerData,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);

      // Fetch updated customer
      const result = await this.getCustomer(id);
      return result;
    } catch (error) {
      console.error('Error updating customer:', error);
      return { success: false, error: 'Failed to update customer' };
    }
  }

  static async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting customer:', error);
      return { success: false, error: 'Failed to delete customer' };
    }
  }

  static async searchCustomers(searchTerm: string, limitCount = 10): Promise<ApiResponse<Customer[]>> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('status', '==', 'active'),
        orderBy('name'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      let customers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Customer[];

      // Client-side search filtering
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        customers = customers.filter(customer =>
          customer.name.toLowerCase().includes(search) ||
          customer.email?.toLowerCase().includes(search) ||
          customer.phone.includes(search) ||
          customer.company?.toLowerCase().includes(search)
        );
      }

      return { success: true, data: customers };
    } catch (error) {
      console.error('Error searching customers:', error);
      return { success: false, error: 'Failed to search customers' };
    }
  }

  static async getCustomerByEmail(email: string): Promise<ApiResponse<Customer | null>> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('email', '==', email),
        limit(1)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { success: true, data: null };
      }

      const doc = snapshot.docs[0];
      const customer = {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as Customer;

      return { success: true, data: customer };
    } catch (error) {
      console.error('Error finding customer by email:', error);
      return { success: false, error: 'Failed to find customer' };
    }
  }

  static async getCustomerByPhone(phone: string): Promise<ApiResponse<Customer | null>> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('phone', '==', phone),
        limit(1)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { success: true, data: null };
      }

      const doc = snapshot.docs[0];
      const customer = {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as Customer;

      return { success: true, data: customer };
    } catch (error) {
      console.error('Error finding customer by phone:', error);
      return { success: false, error: 'Failed to find customer' };
    }
  }
}
