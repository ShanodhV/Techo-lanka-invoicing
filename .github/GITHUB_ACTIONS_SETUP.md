# 🔐 Setting up GitHub Actions Secrets for Vercel Deployment

To enable automatic deployment through GitHub Actions, you need to add Vercel tokens as GitHub secrets.

## 📋 Required Secrets

### 1. **VERCEL_TOKEN**
- This allows GitHub Actions to deploy to your Vercel account
- Get it from: [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
- Create a new token with deployment scope

### 2. **VERCEL_ORG_ID** 
- Your Vercel organization/team ID
- Found in: Vercel Project Settings > General

### 3. **VERCEL_PROJECT_ID**
- Your specific project ID  
- Found in: Vercel Project Settings > General

## 🔧 How to Add Secrets

### Step 1: Get Vercel Information
1. Deploy your project to Vercel first (manually or one-click)
2. Go to your project in Vercel dashboard
3. Navigate to Settings > General
4. Copy the Project ID and Org ID

### Step 2: Create Vercel Token
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it: "GitHub Actions Deploy"
4. Set expiration (or no expiration)
5. Copy the token (save it securely)

### Step 3: Add to GitHub Secrets
1. Go to your GitHub repository: `https://github.com/ShanodhV/Techo-lanka-invoicing`
2. Click "Settings" tab
3. Click "Secrets and variables" > "Actions"
4. Click "New repository secret"
5. Add each secret:

   **Secret 1:**
   - Name: `VERCEL_TOKEN`
   - Value: `your_vercel_token_here`

   **Secret 2:**
   - Name: `VERCEL_ORG_ID`
   - Value: `your_org_id_here`

   **Secret 3:**
   - Name: `VERCEL_PROJECT_ID`
   - Value: `your_project_id_here`

## ✅ Verification

After adding secrets, your GitHub Actions workflow will:
1. ✅ Automatically trigger on pushes to `main`
2. ✅ Run code quality checks
3. ✅ Build the project
4. ✅ Deploy to Vercel using the secrets
5. ✅ Update your live site automatically

## 🚨 Security Notes

- **Never commit tokens to code**
- **Use repository secrets only**
- **Rotate tokens regularly**
- **Use minimal required permissions**

## 🔄 Testing the Pipeline

1. Make a small change to your code
2. Commit and push:
   ```bash
   git add .
   git commit -m "test: trigger CI/CD pipeline"
   git push origin main
   ```
3. Check the "Actions" tab in GitHub to see the workflow running
4. Verify deployment in Vercel dashboard

Your CI/CD pipeline is now fully automated! 🎉
