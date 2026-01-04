# 🔥 Production Firebase Setup - Techo Lanka CCTV Management

## 📋 Step 1: Create Firebase Project

### 1. Go to Firebase Console
```
https://console.firebase.google.com
```

### 2. Create New Project
- **Project Name**: `Techo Lanka CCTV Management`
- **Project ID**: `techo-lanka-cctv` (or similar unique ID)
- **Enable Google Analytics**: Yes (recommended)

### 3. Enable Required Services

#### Authentication Setup:
1. Go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Add authorized domains:
   - `localhost` (for development)
   - Your Vercel domain (e.g., `techo-lanka-invoicing.vercel.app`)

#### Firestore Database Setup:
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select location: **asia-south1** (Mumbai - closest to Sri Lanka)

## 🔑 Step 2: Get Firebase Configuration

### 1. Add Web App
1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Add app** > **Web**
4. App nickname: `Techo Lanka Web App`
5. Check **"Also set up Firebase Hosting"** (optional)

### 2. Copy Configuration
Replace the values in your `.env` file with these actual values from Firebase:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key_from_firebase
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-actual-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_actual_measurement_id
```

## 🛡️ Step 3: Deploy Security Rules

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase in Your Project
```bash
cd "C:\Users\User\Downloads\TechoLanka-Invoicng"
firebase init firestore
```

**Select:**
- Use an existing project: Choose your `techo-lanka-cctv` project
- Firestore rules file: `firestore.rules`
- Firestore indexes file: `firestore.indexes.json`

### 4. Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

## 👤 Step 4: Create First Admin User

### Method 1: Through Your App (Recommended)
1. Deploy your app to Vercel first
2. Register with your admin email
3. Go to Firebase Console > Firestore Database
4. Find your user document in `users` collection
5. Edit the document and change `role` field to `"admin"`

### Method 2: Manual Creation in Firebase Console
1. Go to **Firestore Database** > **Data**
2. Create collection: `users`
3. Add document with ID = your email address
4. Add these fields:
```javascript
{
  email: "admin@techcctv.com",
  role: "admin",
  name: "Admin User",
  createdAt: new Date(),
  lastActivity: new Date(),
  isActive: true
}
```

## 🔒 Step 5: Verify Security

### Test Authentication:
1. Try accessing app without login (should redirect to login)
2. Register a new user (should create user document)
3. Test admin functions (should work only for admin users)

### Test Database Rules:
1. Try accessing data while logged out (should be denied)
2. Test user permissions vs admin permissions
3. Verify field validation is working

## ⚙️ Step 6: Production Configuration

### Firestore Indexes
Your app will suggest indexes as needed. Common ones:

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
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "category", "order": "ASCENDING"},
        {"fieldPath": "name", "order": "ASCENDING"}
      ]
    }
  ]
}
```

### Firebase Usage Limits (Free Plan)
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Authentication**: Unlimited users
- **Hosting**: 10GB transfer/month

### Upgrade to Blaze Plan
For production use, upgrade to pay-as-you-go:
- **Better performance**
- **No daily limits**
- **Additional features**
- **Support**

## 🚀 Step 7: Deploy to Vercel

### Add Environment Variables in Vercel:
1. Go to your Vercel project dashboard
2. Click **Settings** > **Environment Variables**
3. Add all variables from your `.env` file

### Deploy:
```bash
git add .env
git commit -m "Add production environment configuration"
git push origin main
```

Your app will auto-deploy via GitHub Actions!

## 🏢 Production Business Setup

### Default Admin Credentials:
- **Email**: `admin@techcctv.com`
- **Password**: Set during first login
- **Role**: Admin (full access)

### Business Configuration:
- **Company**: Techo Lanka
- **Currency**: LKR (Sri Lankan Rupees)
- **Tax Rate**: 18% (VAT)
- **Location**: Colombo, Sri Lanka
- **Invoice Prefix**: INV-2026-
- **Quotation Prefix**: QUO-2026-

### Sample Data to Add:
1. **Product Categories**:
   - CCTV Cameras
   - DVR/NVR Systems
   - Cables & Accessories
   - Installation Services

2. **Sample Products**:
   - HD Security Camera - LKR 15,000
   - 4-Channel DVR - LKR 25,000
   - Cat6 Cable (per meter) - LKR 150
   - Installation Service (per camera) - LKR 2,500

## 📊 Go Live Checklist

### Before Launch:
- ✅ Firebase project created and configured
- ✅ Security rules deployed and tested
- ✅ Admin user created and verified
- ✅ Environment variables set in Vercel
- ✅ App deployed and accessible
- ✅ Authentication working
- ✅ Database operations working
- ✅ Business data populated

### After Launch:
- ✅ Monitor Firebase usage
- ✅ Test all features end-to-end
- ✅ Train users on the system
- ✅ Set up regular backups
- ✅ Monitor security and performance

Your Techo Lanka CCTV Management System is now ready for production! 🎉
