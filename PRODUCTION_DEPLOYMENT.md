# 🔥 Firebase Production Deployment Guide
# Project: techolanka-1ec06

## 📋 Pre-Deployment Checklist

### ✅ Firebase Project Setup
- [x] Project ID: `techolanka-1ec06`
- [x] Authentication enabled (Email/Password)
- [x] Firestore Database created
- [x] Billing account attached (for production usage)

### ✅ Security Configuration
- [x] Production security rules ready
- [x] Admin user account prepared
- [x] Environment variables configured

## 🚀 Step-by-Step Deployment

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools@latest
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase Project
```bash
# Navigate to project directory
cd "C:\Users\User\Downloads\TechoLanka-Invoicng"

# Initialize Firebase (select Firestore and Hosting)
firebase init

# When prompted:
# - Select "Firestore: Configure security rules and indexes files"
# - Select "Hosting: Configure files for Firebase Hosting and set up rewrite rules"
# - Use existing project: techolanka-1ec06
# - Firestore rules file: firestore-production.rules
# - Firestore indexes file: firestore.indexes.json (create if needed)
# - Public directory: dist
# - Configure as single-page app: Yes
# - Set up automatic builds and deploys with GitHub: No (using Vercel)
```

### 4. Deploy Security Rules
```bash
# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Or deploy everything Firebase-related
firebase deploy --only firestore
```

### 5. Create Initial Admin User

#### Method 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project `techolanka-1ec06`
3. Go to Firestore Database
4. Create collection `users`
5. Add document with your admin email as document ID:

```json
{
  "email": "admin@techcctv.com",
  "role": "admin",
  "name": "System Administrator",
  "createdAt": "2026-01-04T10:00:00.000Z",
  "lastActivity": "2026-01-04T10:00:00.000Z",
  "createdBy": "system",
  "isActive": true,
  "permissions": ["all"]
}
```

#### Method 2: Temporary Rule Modification
If you need to create admin programmatically, temporarily modify rules:

```javascript
// Add this rule temporarily to allow first admin creation
match /users/{userId} {
  allow create: if request.auth != null && 
               !exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
               request.resource.data.role == 'admin' &&
               request.resource.data.email == request.auth.token.email;
}
```

### 6. Test Security Rules

#### Using Firebase Emulator
```bash
# Start Firestore emulator
firebase emulators:start --only firestore

# In another terminal, run your app against emulator
# Update your .env temporarily:
# VITE_FIREBASE_PROJECT_ID=demo-test
```

#### Using Rules Playground
1. Go to Firebase Console → Firestore → Rules
2. Click "Rules playground"
3. Test various scenarios:
   - Unauthenticated user access (should be denied)
   - Regular user access (limited permissions)
   - Admin user access (full permissions)

## 🔐 Environment Variables for Vercel

Add these exact values to your Vercel project environment variables:

```env
VITE_FIREBASE_API_KEY=AIzaSyCcBrCGvSR75GC8cZlm9TrkatHhYxTnbAo
VITE_FIREBASE_AUTH_DOMAIN=techolanka-1ec06.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=techolanka-1ec06
VITE_FIREBASE_STORAGE_BUCKET=techolanka-1ec06.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=284518690764
VITE_FIREBASE_APP_ID=1:284518690764:web:aa051a41c86a6e2949f769
VITE_FIREBASE_MEASUREMENT_ID=G-7QQJZWJRJL

VITE_APP_NAME="Techo Lanka CCTV Management"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENVIRONMENT="production"

VITE_SESSION_TIMEOUT=1800000
VITE_SESSION_WARNING_TIME=300000

VITE_DEFAULT_TAX_RATE=0.18
VITE_DEFAULT_CURRENCY="LKR"
VITE_COMPANY_NAME="Techo Lanka"
VITE_COMPANY_ADDRESS="Colombo, Sri Lanka"
VITE_COMPANY_PHONE="+94 11 234 5678"
VITE_COMPANY_EMAIL="info@techcctv.com"

VITE_INVOICE_PREFIX="INV"
VITE_QUOTATION_PREFIX="QUO"
VITE_PAYMENT_TERMS="Net 30"

VITE_ITEMS_PER_PAGE=10
VITE_MAX_FILE_SIZE=5242880
VITE_SUPPORTED_CURRENCIES="LKR,USD,EUR"
```

## 🛡️ Security Features Implemented

### Authentication & Authorization
- ✅ Role-based access control (admin, moderator, user)
- ✅ Field-level validation for all document types
- ✅ Business logic enforcement (invoice immutability, etc.)
- ✅ Audit trail protection

### Data Validation
- ✅ Email format validation
- ✅ Invoice/Quotation number format validation
- ✅ Required field enforcement
- ✅ Type safety (string, number, timestamp validation)
- ✅ Business rule validation (positive prices, valid statuses)

### Access Control
- **Products**: Read for all users, write for moderators/admins
- **Customers**: Read/write for users, delete for admins only
- **Quotations**: Full access for creators, admin override
- **Invoices**: Payment updates for creators, full access for admins
- **Settings**: Read for users, write for admins
- **Activity Logs**: Create for users, read for admins, immutable

## 🔄 Production Workflow

### Daily Operations
1. **User Management**: Admins create/manage user accounts
2. **Product Management**: Moderators maintain product catalog
3. **Customer Relations**: All users manage customers
4. **Quotations**: Users create/manage quotations
5. **Invoicing**: Users generate invoices from quotations
6. **Reporting**: Role-based access to analytics

### Security Monitoring
- Monitor authentication patterns
- Review failed rule evaluations
- Track admin activities
- Regular security audits

## 🚨 Production Security Checklist

### Before Going Live
- [ ] Security rules deployed and tested
- [ ] Admin user created and verified
- [ ] All environment variables set in Vercel
- [ ] Authentication providers configured
- [ ] Firestore indexes created for performance
- [ ] Backup strategy implemented

### Security Verification
- [ ] Unauthenticated access properly blocked
- [ ] Role-based permissions working
- [ ] Field validation preventing malformed data
- [ ] Business logic enforced (quotation→invoice workflow)
- [ ] Audit trails properly protected

### Monitoring Setup
- [ ] Firebase Console monitoring configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Security alerts configured

## 🆘 Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check user authentication status
   - Verify user exists in users collection
   - Confirm user role is correct

2. **Rule Evaluation Failures**
   - Check field validation requirements
   - Verify required fields are present
   - Ensure data types match validation rules

3. **Admin Access Issues**
   - Confirm admin user document exists
   - Check role field is exactly "admin"
   - Verify admin is authenticated

### Security Rule Testing Commands

```bash
# Deploy rules
firebase deploy --only firestore:rules

# Test with emulator
firebase emulators:start --only firestore

# Check rule coverage
firebase emulators:exec --only firestore "npm test"
```

## ✅ Success Metrics

Your production deployment is successful when:

- ✅ All security rules pass validation
- ✅ Admin user can access all features
- ✅ Regular users have appropriate restrictions
- ✅ Business logic is properly enforced
- ✅ No unauthorized access possible
- ✅ Performance meets expectations

Your Techo Lanka CCTV Management System is now production-ready with enterprise-grade security! 🏆
