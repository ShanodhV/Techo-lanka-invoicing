# 🔥 Firebase Setup Guide - Techo Lanka CCTV Management System

This guide will help you set up Firebase for your production deployment with proper security.

## 📋 Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created in [Firebase Console](https://console.firebase.google.com)
- Admin account for initial setup

## 🚀 Step-by-Step Setup

### 1. **Firebase Project Configuration**

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Name it: "Techo Lanka CCTV Management"
4. Enable Google Analytics (recommended)
5. Choose your analytics account

#### Enable Required Services
1. **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider
   - Add authorized domains (your Vercel domain)

2. **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in production mode"
   - Select location closest to your users

### 2. **Deploy Security Rules**

#### Install Firebase CLI
```bash
npm install -g firebase-tools
```

#### Login to Firebase
```bash
firebase login
```

#### Initialize Firebase in Your Project
```bash
# Navigate to your project directory
cd "C:\Users\User\Downloads\TechoLanka-Invoicng"

# Initialize Firebase (if not already done)
firebase init

# Select:
# - Firestore: Configure security rules and indexes files
# - Hosting: Configure files for Firebase Hosting and set up rewrite rules
```

#### Deploy Firestore Rules
```bash
# Deploy only security rules
firebase deploy --only firestore:rules

# Or deploy everything
firebase deploy
```

### 3. **Initial Admin User Setup**

Since your security rules require an admin user, you need to create one:

#### Method 1: Manual Setup in Firebase Console
1. Go to Firestore Database in Firebase Console
2. Create a collection named `users`
3. Add a document with your admin email as document ID
4. Add fields:
   ```javascript
   {
     email: "admin@techcctv.com",
     role: "admin", 
     name: "Admin User",
     createdAt: new Date(),
     lastActivity: new Date()
   }
   ```

#### Method 2: Temporary Rule for First Admin
Temporarily modify your firestore.rules to allow first user creation, then change back:

```javascript
// Temporary rule - ADD THIS TEMPORARILY
match /users/{userId} {
  allow write: if request.auth != null && 
               !exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
               request.resource.data.role == 'admin';
  // ... existing rules
}
```

### 4. **Environment Variables Setup**

#### Get Firebase Configuration
1. Go to Project Settings > General
2. Scroll to "Your apps" section  
3. Click on web app or create one
4. Copy the config object

#### Add to Vercel Environment Variables
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com  
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123DEF
```

### 5. **Security Rules Explanation**

#### 🔐 **Authentication Requirements**
- All operations require authenticated users
- Users must exist in the `users` collection
- Admin role required for sensitive operations

#### 👥 **User Permissions**
- **Users**: Can read/update own profile, read business data
- **Admins**: Full access to all data, user management

#### 📊 **Data Access Controls**
- **Products**: Read for all users, write for admins only
- **Customers**: Read/write for all users, delete for admins only  
- **Quotations**: Read/write for all users, delete for admins only
- **Invoices**: Read/write with payment restrictions, delete for admins only

#### 🛡️ **Field Validation**
- Required fields enforced for all document types
- Type validation (string, number, timestamp)
- Business logic validation (e.g., invoice immutability)

### 6. **Testing Security Rules**

#### Firebase Emulator (Recommended)
```bash
# Install emulator
firebase setup:emulators:firestore

# Start emulator  
firebase emulators:start --only firestore

# Test with your app pointing to emulator
```

#### Firestore Rules Playground
1. Go to Firebase Console > Firestore > Rules
2. Click "Rules playground"  
3. Test various scenarios with different auth states

### 7. **Firestore Indexes**

Your app may need composite indexes for complex queries. Firebase will suggest these automatically, or create `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "quotations",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "customerId", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "invoices", 
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    }
  ]
}
```

### 8. **Production Checklist**

#### Before Going Live:
- ✅ Security rules deployed and tested
- ✅ Admin user created and verified
- ✅ Authentication configured with your domain
- ✅ Environment variables set in Vercel
- ✅ Database indexes created
- ✅ Billing account set up (for production usage)

#### Security Verification:
- ✅ Unauthenticated access blocked
- ✅ Users can only access their own data
- ✅ Admin permissions working correctly
- ✅ Field validation preventing bad data
- ✅ Business logic enforced (e.g., invoice immutability)

### 9. **Monitoring & Maintenance**

#### Firebase Console Monitoring
- **Authentication**: Monitor user sign-ups and activity
- **Firestore**: Watch for quota usage and errors
- **Security Rules**: Monitor rule evaluations and denials

#### Regular Security Audits
- Review user roles and permissions
- Check for suspicious activity patterns
- Update security rules as app evolves
- Rotate admin credentials regularly

## 🚨 Important Security Notes

### **Never Do:**
- ❌ Allow unauthenticated access to sensitive data
- ❌ Use overly permissive rules like `allow read, write: if true`
- ❌ Skip field validation
- ❌ Ignore Firebase security warnings

### **Always Do:**
- ✅ Test rules thoroughly before production
- ✅ Use least privilege principle
- ✅ Validate all data inputs
- ✅ Monitor authentication and access patterns
- ✅ Keep Firebase SDKs updated

## 🆘 Troubleshooting

### **Common Issues:**
1. **Permission Denied**: Check user authentication and role
2. **Missing Required Fields**: Ensure all required fields are provided  
3. **Admin Not Working**: Verify admin user exists in Firestore
4. **Rules Not Applied**: Ensure rules are deployed with `firebase deploy --only firestore:rules`

Your Firebase security is now production-ready! 🔒
