import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  type User as FirebaseUser,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User, SessionData } from '../types';
import { useAuthStore, useSessionStore } from '../store';

// Convert Firebase User to our User type
const mapFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  if (!firebaseUser) return null;

  try {
    // Get user document from Firestore to get role and other data
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Return basic user info if document doesn't exist, but log the issue
      console.warn('User document not found for authenticated user:', firebaseUser.uid);
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        role: 'staff' as const, // Default role for users without documents
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const userData = userDoc.data();
    return {
      uid: userData.uid || firebaseUser.uid,
      email: userData.email || firebaseUser.email || '',
      displayName: userData.displayName || firebaseUser.displayName || '',
      role: userData.role || 'staff' as const,
      createdAt: userData.createdAt?.toDate() || new Date(),
      updatedAt: userData.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error in mapFirebaseUser:', error);
    // Return basic user info instead of failing completely
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      role: 'staff' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
};

// Create session data
const createSessionData = (user: User): SessionData => {
  const expiresAt = Date.now() + (120 * 60 * 1000); // 2 hours instead of 30 minutes
  
  return {
    user,
    expiresAt,
    refreshToken: undefined, // Can be implemented later for refresh tokens
  };
};

// Authentication service
export class AuthService {
  // Initialize auth state listener
  static initializeAuthListener() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      const authStore = useAuthStore.getState();
      const sessionStore = useSessionStore.getState();
      
      if (firebaseUser) {
        try {
          const user = await mapFirebaseUser(firebaseUser);
          if (user) {
            authStore.setUser(user);
            
            // Create and set session
            const sessionData = createSessionData(user);
            sessionStore.setSession(sessionData);
          }
        } catch (error) {
          console.error('Error mapping user:', error);
          authStore.setError('Failed to load user data');
        }
      } else {
        authStore.setUser(null);
        sessionStore.clearSession();
      }
      
      authStore.setLoading(false);
    });
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const authStore = useAuthStore.getState();
    const sessionStore = useSessionStore.getState();
    
    try {
      authStore.setLoading(true);
      authStore.setError(null);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Temporarily disable email verification requirement
      // TODO: Re-enable in production
      // if (!userCredential.user.emailVerified) {
      //   await signOut(auth);
      //   return {
      //     success: false,
      //     error: 'Please verify your email address before signing in.',
      //   };
      // }

      const user = await mapFirebaseUser(userCredential.user);
      
      if (user) {
        authStore.setUser(user);
        
        // Create and set session
        const sessionData = createSessionData(user);
        sessionStore.setSession(sessionData);
        
        return { success: true };
      } else {
        throw new Error('Failed to load user data');
      }
    } catch (error: unknown) {
      const errorMessage = this.getAuthErrorMessage((error as { code?: string }).code || 'unknown');
      authStore.setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      authStore.setLoading(false);
    }
  }

  // Sign up with email and password
  static async signUp(
    email: string, 
    password: string, 
    displayName: string,
    role: 'admin' | 'staff' = 'staff'
  ): Promise<{ success: boolean; error?: string }> {
    const authStore = useAuthStore.getState();
    
    try {
      authStore.setLoading(true);
      authStore.setError(null);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile
      await updateProfile(userCredential.user, { displayName });
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Sign out after registration (user needs to verify email)
      await signOut(auth);
      
      return { 
        success: true,
        error: 'Account created successfully. Please check your email to verify your account before signing in.',
      };
    } catch (error: unknown) {
      const errorMessage = this.getAuthErrorMessage((error as { code?: string }).code || 'unknown');
      authStore.setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      authStore.setLoading(false);
    }
  }

  // Sign out
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    const authStore = useAuthStore.getState();
    const sessionStore = useSessionStore.getState();
    
    try {
      await signOut(auth);
      authStore.logout();
      sessionStore.clearSession();
      return { success: true };
    } catch (error: unknown) {
      console.error('Sign out error:', error);
      const errorMessage = 'Failed to sign out';
      authStore.setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { 
        success: true,
        error: 'Password reset email sent. Please check your inbox.',
      };
    } catch (error: unknown) {
      const errorMessage = this.getAuthErrorMessage((error as { code?: string }).code || 'unknown');
      return { success: false, error: errorMessage };
    }
  }

  // Check session validity
  static isSessionValid(): boolean {
    const sessionStore = useSessionStore.getState();
    return sessionStore.isSessionValid();
  }

  // Extend session
  static extendSession(): void {
    const sessionStore = useSessionStore.getState();
    sessionStore.extendSession();
  }

  // Get current user
  static getCurrentUser(): User | null {
    const authStore = useAuthStore.getState();
    return authStore.user;
  }

  // Check if user has specific role
  static hasRole(role: 'admin' | 'staff'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Check if user is admin
  static isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Convert Firebase auth error codes to user-friendly messages
  private static getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/requires-recent-login':
        return 'Please sign in again to perform this action.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

// Auto-extend session on user activity
export const handleUserActivity = () => {
  const sessionStore = useSessionStore.getState();
  if (sessionStore.isAuthenticated && sessionStore.isSessionValid()) {
    sessionStore.updateLastActivity();
    
    // Auto-extend session if it's close to expiring (within 30 minutes instead of 5)
    const { sessionData } = sessionStore;
    if (sessionData) {
      const timeUntilExpiry = sessionData.expiresAt - Date.now();
      const thirtyMinutes = 30 * 60 * 1000; // Extended from 5 minutes to 30 minutes
      
      if (timeUntilExpiry < thirtyMinutes) {
        AuthService.extendSession();
      }
    }
  }
};

// Session timeout warning
export const checkSessionTimeout = (onWarning: () => void, onExpire: () => void) => {
  const sessionStore = useSessionStore.getState();
  
  if (!sessionStore.isAuthenticated) return;
  
  const { sessionData, lastActivity } = sessionStore;
  if (!sessionData) return;
  
  const now = Date.now();
  const timeSinceActivity = now - lastActivity;
  const warningTime = 25 * 60 * 1000; // 25 minutes (warn 5 minutes before expiry)
  const expireTime = 30 * 60 * 1000; // 30 minutes
  
  if (timeSinceActivity >= expireTime) {
    onExpire();
  } else if (timeSinceActivity >= warningTime) {
    onWarning();
  }
};
