# 🚀 Deployment Guide - Techo Lanka CCTV Management System

This guide will help you deploy the Techo Lanka CCTV Management System to production.

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ Firebase project set up with Authentication and Firestore
- ✅ GitHub repository with all code pushed
- ✅ Environment variables ready

## 🌐 Vercel Deployment (Recommended)

### Method 1: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FShanodhV%2FTecho-lanka-invoicing)

### Method 2: Manual Setup
1. **Sign up/Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose `ShanodhV/Techo-lanka-invoicing`

3. **Configure Project**
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**
   Add these environment variables in Vercel dashboard:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at: `https://your-app-name.vercel.app`

## 🔄 Automatic CI/CD Pipeline

Your project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

### ✅ **Runs on Every Push to `main` branch:**
1. **Code Quality Checks**
   - TypeScript type checking
   - ESLint code linting
   - Build verification

2. **Security Scanning**
   - Dependency vulnerability check
   - Code security analysis

3. **Automated Testing**
   - Build process validation
   - Environment setup verification

4. **Production Deployment**
   - Automatic deployment to Vercel
   - Zero-downtime deployments
   - Rollback capability

### 🔧 **Workflow Features:**
- **Cache Optimization**: Dependencies cached for faster builds
- **Build Artifacts**: Optimized production builds
- **Environment Validation**: Ensures all required variables are set
- **Error Notifications**: Alerts on build failures

## 📊 Vercel Configuration

Your `vercel.json` file includes:

### 🛡️ **Security Headers**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: origin-when-cross-origin`

### ⚡ **Performance Optimization**
- Static asset caching (1 year)
- SPA routing support
- Optimized build output

### 🔧 **Build Configuration**
- Framework: Vite
- Node.js version: Latest LTS
- Build command: `npm run build`
- Output directory: `dist`

## 🔥 Firebase Setup

### 1. **Create Firebase Project**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (optional)
firebase init
```

### 2. **Enable Required Services**
- **Authentication**: Email/Password provider
- **Firestore Database**: Production mode
- **Security Rules**: Configure for your app

### 3. **Get Configuration**
- Go to Firebase Console > Project Settings
- Add a web app
- Copy the config object values

## 🚀 Post-Deployment Steps

### 1. **Verify Deployment**
- ✅ App loads correctly
- ✅ Authentication works
- ✅ Database connections successful
- ✅ All pages accessible

### 2. **Configure Custom Domain (Optional)**
- Add custom domain in Vercel dashboard
- Update Firebase authorized domains
- Configure DNS settings

### 3. **Set Up Monitoring**
- Enable Vercel Analytics
- Set up Firebase monitoring
- Configure error tracking

## 🔄 Development Workflow

### **Making Changes**
1. Make changes to your code
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "feat: your changes"
   git push origin main
   ```
3. GitHub Actions automatically deploys to Vercel
4. Check deployment status in GitHub Actions tab

### **Environment Management**
- **Development**: Use `.env.local` for local development
- **Production**: Set environment variables in Vercel dashboard
- **Staging**: Create separate Vercel project for staging branch

## 📞 Support

If you encounter issues:
1. Check GitHub Actions logs for build errors
2. Review Vercel deployment logs
3. Verify Firebase configuration
4. Check environment variables

## 🎉 Success!

Once deployed, your Techo Lanka CCTV Management System will be live with:
- ✅ Automatic deployments on code changes
- ✅ Professional production environment
- ✅ Security headers and optimization
- ✅ Global CDN distribution
- ✅ Real-time Firebase integration

Your app will be accessible at: `https://techo-lanka-invoicing.vercel.app`

---

**Happy Deploying!** 🚀
