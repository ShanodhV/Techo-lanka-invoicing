import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, ApiResponse } from '../types';

export class UserManagementService {
  // Get all users (admin only)
  static async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(usersQuery);
      const users: User[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });

      return {
        success: true,
        data: users,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: 'Failed to fetch users',
      };
    }
  }

  // Delete user (admin only)
  static async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      // Delete user document from Firestore
      const userDocRef = doc(db, 'users', userId);
      await deleteDoc(userDocRef);

      // Note: Deleting the Firebase Auth user requires admin SDK
      // For now, we'll just remove from Firestore
      // In production, you'd want to use Firebase Admin SDK or Cloud Functions

      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        error: 'Failed to delete user',
      };
    }
  }
}
