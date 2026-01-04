# 📧 Firebase Email Functions Setup Guide

This guide will help you set up Firebase Functions to handle email notifications.

## 🚀 Setting Up Firebase Functions

### Step 1: Initialize Firebase Functions

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Navigate to your project
cd "C:\Users\User\Downloads\TechoLanka-Invoicng"

# Initialize Firebase Functions
firebase init functions

# Select:
# - Use existing project: techolanka-1ec06
# - JavaScript or TypeScript: TypeScript
# - ESLint: Yes
# - Install dependencies: Yes
```

### Step 2: Install Required Dependencies

```bash
cd functions
npm install nodemailer @types/nodemailer
npm install cors express
```

### Step 3: Create Email Function

Create `functions/src/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import * as cors from 'cors';

admin.initializeApp();

// Configure email transporter (using Gmail SMTP)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'shanodh62622@gmail.com', // Your email
    pass: process.env.EMAIL_APP_PASSWORD // App-specific password
  }
});

// CORS configuration
const corsHandler = cors({ origin: true });

// Email templates
const getEmailTemplate = (template: string, data: any) => {
  switch (template) {
    case 'user_welcome':
      return {
        subject: 'Welcome to Techo Lanka CCTV Management System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to ${data.companyName}!</h2>
            <p>Dear ${data.userName},</p>
            <p>Your account has been created successfully. Here are your login details:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Login URL:</strong> <a href="${data.loginUrl}">${data.loginUrl}</a></p>
              <p><strong>Email:</strong> ${data.userEmail}</p>
              <p><strong>Temporary Password:</strong> ${data.temporaryPassword}</p>
              <p><strong>Role:</strong> ${data.role}</p>
            </div>
            
            <p><strong style="color: #dc2626;">Important:</strong> Please change your password after your first login.</p>
            
            <h3>Getting Started:</h3>
            <ol>
              <li>Click the login URL above</li>
              <li>Sign in with your email and temporary password</li>
              <li>Change your password in Settings</li>
              <li>Explore the dashboard and features</li>
            </ol>
            
            <p>If you need help, contact our support team:</p>
            <p>📧 Email: ${data.supportEmail}</p>
            <p>📞 Phone: ${data.supportPhone}</p>
            
            <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              ${data.companyName} Team
            </p>
          </div>
        `
      };
      
    case 'user_created':
      return {
        subject: 'New User Account Created - Techo Lanka CCTV',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New User Account Created</h2>
            <p>A new user account has been created in the system:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>User Name:</strong> ${data.userName}</p>
              <p><strong>Email:</strong> ${data.userEmail}</p>
              <p><strong>Role:</strong> ${data.userRole}</p>
              <p><strong>Created By:</strong> ${data.createdBy}</p>
              <p><strong>Date Created:</strong> ${data.createdDate}</p>
            </div>
            
            <p><a href="${data.dashboardUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a></p>
            
            <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              ${data.companyName} Admin Notification System
            </p>
          </div>
        `
      };
      
    case 'invoice_sent':
      return {
        subject: `Invoice ${data.invoiceNumber} - ${data.companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Invoice from ${data.companyName}</h2>
            <p>Dear ${data.customerName},</p>
            <p>Please find your invoice details below:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
              <p><strong>Amount:</strong> ${data.currency} ${data.amount.toLocaleString()}</p>
              <p><strong>Due Date:</strong> ${data.dueDate}</p>
            </div>
            
            <p>${data.paymentInstructions}</p>
            
            <p>For any questions, contact us:</p>
            <p>📧 ${data.companyEmail} | 📞 ${data.companyPhone}</p>
            <p>📍 ${data.companyAddress}</p>
            
            <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Thank you for your business!<br>
              ${data.companyName}
            </p>
          </div>
        `
      };
      
    case 'quotation_sent':
      return {
        subject: `Quotation ${data.quotationNumber} - ${data.companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Quotation from ${data.companyName}</h2>
            <p>Dear ${data.customerName},</p>
            <p>Thank you for your inquiry. Please find your quotation details below:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Quotation Number:</strong> ${data.quotationNumber}</p>
              <p><strong>Amount:</strong> ${data.currency} ${data.amount.toLocaleString()}</p>
              <p><strong>Valid Until:</strong> ${data.validUntil}</p>
            </div>
            
            <p>This quotation is valid for ${data.validityPeriod} from the date of issue.</p>
            
            <p>For any questions or to proceed with the order, contact us:</p>
            <p>📧 ${data.companyEmail} | 📞 ${data.companyPhone}</p>
            <p>📍 ${data.companyAddress}</p>
            
            <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              We look forward to working with you!<br>
              ${data.companyName}
            </p>
          </div>
        `
      };
      
    default:
      return {
        subject: 'Notification from Techo Lanka CCTV',
        html: '<p>You have received a notification from Techo Lanka CCTV Management System.</p>'
      };
  }
};

// Send email function
export const sendEmail = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { to, subject, template, templateData } = data;

  try {
    // Validate input
    if (!to || !template) {
      throw new functions.https.HttpsError('invalid-argument', 'Email and template are required');
    }

    // Get email template
    const emailContent = getEmailTemplate(template, templateData);

    // Send email
    const mailOptions = {
      from: '"Techo Lanka CCTV" <shanodh62622@gmail.com>',
      to: to,
      subject: subject || emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Log email activity in Firestore
    await admin.firestore().collection('emailLogs').add({
      to: to,
      subject: mailOptions.subject,
      template: template,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      sentBy: context.auth.uid,
      messageId: info.messageId,
      status: 'sent'
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    
    // Log error in Firestore
    await admin.firestore().collection('emailLogs').add({
      to: to,
      subject: subject,
      template: template,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      sentBy: context.auth?.uid,
      status: 'failed',
      error: error.message
    });

    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});

// Check email service status
export const checkEmailService = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    // Verify transporter
    await transporter.verify();
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Email service unavailable');
  }
});
```

## 📧 Email Configuration

### Step 4: Set up Gmail App Password

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification
   - App passwords → Generate new password
   - Use this password (not your regular Gmail password)

### Step 5: Set Environment Variables

```bash
# In functions directory
firebase functions:config:set email.password="your_app_password_here"
```

### Step 6: Deploy Functions

```bash
# Deploy functions
firebase deploy --only functions

# Or deploy everything
firebase deploy
```

## 🔧 Integration with User Creation

Update your user service to send emails:

```typescript
import { sendWelcomeEmail, sendUserCreationNotification } from '../services/emailService';

// In your user creation function
const createUser = async (userData: UserData) => {
  try {
    // Create user in Firebase
    const user = await createUserWithEmailAndPassword(auth, userData.email, temporaryPassword);
    
    // Save user data to Firestore
    await userService.createUser({ ...userData, uid: user.uid });
    
    // Send welcome email to user
    await sendWelcomeEmail({
      email: userData.email,
      name: userData.name,
      temporaryPassword: temporaryPassword,
      role: userData.role
    });
    
    // Send notification to admin
    await sendUserCreationNotification({
      email: userData.email,
      name: userData.name,
      role: userData.role,
      createdBy: currentUser.displayName
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('User creation failed:', error);
    throw error;
  }
};
```

## ✅ Testing

1. **Create a test user** through your admin panel
2. **Check email delivery** in Gmail
3. **Verify email logs** in Firestore
4. **Test different templates** (welcome, invoice, quotation)

Your Firebase email system is now ready! 📧
