import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { db, auth } from './firebase';
import { sendWelcomeEmail, sendUserCreationNotification } from './emailService';
import type { User, ApiResponse } from '../types';

// Generate temporary password
const generateTemporaryPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export class UserManagementService {
  // Create new user with email notification
  static async createUser(userData: {
    email: string;
    displayName: string;
    role: 'admin' | 'staff';
    createdBy: string;
  }): Promise<ApiResponse<User>> {
    try {
      // Generate temporary password
      const temporaryPassword = generateTemporaryPassword();

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        temporaryPassword
      );

      const newUser = {
        uid: userCredential.user.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        createdBy: userData.createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        mustChangePassword: true,
      };

      // Save user data to Firestore
      await addDoc(collection(db, 'users'), newUser);

      // Send welcome email to the new user
      try {
        await sendWelcomeEmail({
          email: userData.email,
          name: userData.displayName,
          temporaryPassword: temporaryPassword,
          role: userData.role,
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the user creation if email fails
      }

      // Send notification to admin
      try {
        await sendUserCreationNotification({
          email: userData.email,
          name: userData.displayName,
          role: userData.role,
          createdBy: userData.createdBy,
        });
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
        // Don't fail the user creation if email fails
      }

      return {
        success: true,
        data: {
          uid: newUser.uid,
          email: newUser.email,
          displayName: newUser.displayName,
          role: newUser.role,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        message: `User created successfully. Welcome email sent to ${userData.email}`,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
      };
    }
  }

  // Send password reset email
  static async resetUserPassword(email: string): Promise<ApiResponse<void>> {
    try {
      await sendPasswordResetEmail(auth, email);
      
      return {
        success: true,
        message: `Password reset email sent to ${email}`,
      };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send password reset email',
      };
    }
  }

  // Update user role
  static async updateUserRole(
    userId: string, 
    newRole: 'admin' | 'staff',
    updatedBy: string
  ): Promise<ApiResponse<void>> {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        role: newRole,
        updatedAt: serverTimestamp(),
        updatedBy: updatedBy,
      });

      return {
        success: true,
        message: 'User role updated successfully',
      };
    } catch (error) {
      console.error('Error updating user role:', error);
      return {
        success: false,
        error: 'Failed to update user role',
      };
    }
  }

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

  // Deactivate user account
  static async deactivateUser(userId: string, deactivatedBy: string): Promise<ApiResponse<void>> {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        isActive: false,
        deactivatedAt: serverTimestamp(),
        deactivatedBy: deactivatedBy,
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
        message: 'User account deactivated successfully',
      };
    } catch (error) {
      console.error('Error deactivating user:', error);
      return {
        success: false,
        error: 'Failed to deactivate user',
      };
    }
  }

  // Reactivate user account
  static async reactivateUser(userId: string, reactivatedBy: string): Promise<ApiResponse<void>> {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        isActive: true,
        reactivatedAt: serverTimestamp(),
        reactivatedBy: reactivatedBy,
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
        message: 'User account reactivated successfully',
      };
    } catch (error) {
      console.error('Error reactivating user:', error);
      return {
        success: false,
        error: 'Failed to reactivate user',
      };
    }
  }
}
