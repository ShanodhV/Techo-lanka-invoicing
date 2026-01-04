import { 
  sendPasswordResetEmail, 
  sendEmailVerification,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Simple email service using Firebase Auth built-in emails
export class SimpleEmailService {
  
  // Send welcome email + password reset (built-in Firebase)
  static async createUserWithWelcomeEmail(userData: {
    email: string;
    displayName: string;
    role: 'admin' | 'staff';
    temporaryPassword: string;
  }) {
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.temporaryPassword
      );

      // Send email verification (Firebase built-in)
      await sendEmailVerification(userCredential.user);

      // Immediately send password reset so user can set their own password
      await sendPasswordResetEmail(auth, userData.email);

      // Log the activity in Firestore
      await addDoc(collection(db, 'emailActivities'), {
        type: 'user_created',
        email: userData.email,
        name: userData.displayName,
        role: userData.role,
        timestamp: serverTimestamp(),
        status: 'sent'
      });

      return {
        success: true,
        message: `User created. Email verification and password reset sent to ${userData.email}`
      };

    } catch (error) {
      console.error('Error creating user with email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user'
      };
    }
  }

  // Send password reset email
  static async sendPasswordReset(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      
      // Log activity
      await addDoc(collection(db, 'emailActivities'), {
        type: 'password_reset',
        email: email,
        timestamp: serverTimestamp(),
        status: 'sent'
      });

      return {
        success: true,
        message: `Password reset email sent to ${email}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send password reset'
      };
    }
  }

  // Manual email notification (for admin awareness)
  static async logUserCreation(userData: {
    email: string;
    name: string;
    role: string;
    createdBy: string;
  }) {
    try {
      // Just log in Firestore - admin can see in dashboard
      await addDoc(collection(db, 'userNotifications'), {
        type: 'new_user',
        userEmail: userData.email,
        userName: userData.name,
        userRole: userData.role,
        createdBy: userData.createdBy,
        timestamp: serverTimestamp(),
        read: false
      });

      return { success: true };
    } catch (error) {
      console.error('Error logging user creation:', error);
      return { success: false };
    }
  }
}

// Usage in your user creation flow:
export const createNewUser = async (userData: {
  email: string;
  displayName: string;
  role: 'admin' | 'staff';
  createdBy: string;
}) => {
  const temporaryPassword = 'TempPass123!'; // They'll reset it anyway
  
  const result = await SimpleEmailService.createUserWithWelcomeEmail({
    ...userData,
    temporaryPassword
  });

  if (result.success) {
    // Log for admin notification
    await SimpleEmailService.logUserCreation({
      email: userData.email,
      name: userData.displayName,
      role: userData.role,
      createdBy: userData.createdBy
    });
  }

  return result;
};
