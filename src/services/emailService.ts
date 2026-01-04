import { httpsCallable, getFunctions } from 'firebase/functions';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';

// Initialize Firebase Functions
const functions = getFunctions();

// Email templates
export const EMAIL_TEMPLATES = {
  USER_WELCOME: 'user_welcome',
  PASSWORD_RESET: 'password_reset',
  INVOICE_SENT: 'invoice_sent',
  QUOTATION_SENT: 'quotation_sent',
  USER_CREATED: 'user_created'
};

// Email service interface
export interface EmailData {
  to: string;
  subject: string;
  template: string;
  templateData: {
    userName?: string;
    companyName?: string;
    loginUrl?: string;
    temporaryPassword?: string;
    adminName?: string;
    invoiceNumber?: string;
    quotationNumber?: string;
    amount?: number;
    dueDate?: string;
    [key: string]: string | number | undefined;
  };
}

// Send email using Firebase Function
export const sendEmail = httpsCallable(functions, 'sendEmail');

// Send welcome email to new user
export const sendWelcomeEmail = async (userData: {
  email: string;
  name: string;
  temporaryPassword: string;
  role: string;
}) => {
  try {
    const emailData: EmailData = {
      to: userData.email,
      subject: 'Welcome to Techo Lanka CCTV Management System',
      template: EMAIL_TEMPLATES.USER_WELCOME,
      templateData: {
        userName: userData.name,
        companyName: 'Techo Lanka',
        loginUrl: window.location.origin,
        temporaryPassword: userData.temporaryPassword,
        role: userData.role,
        supportEmail: 'shanodh62622@gmail.com',
        supportPhone: '+94 71 323 4643'
      }
    };

    const result = await sendEmail(emailData);
    console.log('Welcome email sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
};

// Send user creation notification to admin
export const sendUserCreationNotification = async (userData: {
  email: string;
  name: string;
  role: string;
  createdBy: string;
}) => {
  try {
    const emailData: EmailData = {
      to: 'shanodh62622@gmail.com', // Admin email
      subject: 'New User Account Created - Techo Lanka CCTV',
      template: EMAIL_TEMPLATES.USER_CREATED,
      templateData: {
        userName: userData.name,
        userEmail: userData.email,
        userRole: userData.role,
        createdBy: userData.createdBy,
        createdDate: new Date().toLocaleDateString(),
        companyName: 'Techo Lanka',
        dashboardUrl: window.location.origin + '/dashboard'
      }
    };

    const result = await sendEmail(emailData);
    console.log('User creation notification sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send user creation notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
};

// Send invoice via email
export const sendInvoiceEmail = async (invoiceData: {
  customerEmail: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  pdfUrl?: string;
}) => {
  try {
    const emailData: EmailData = {
      to: invoiceData.customerEmail,
      subject: `Invoice ${invoiceData.invoiceNumber} - Techo Lanka CCTV`,
      template: EMAIL_TEMPLATES.INVOICE_SENT,
      templateData: {
        customerName: invoiceData.customerName,
        invoiceNumber: invoiceData.invoiceNumber,
        amount: invoiceData.amount,
        currency: 'LKR',
        dueDate: invoiceData.dueDate,
        companyName: 'Techo Lanka',
        companyAddress: 'Colombo, Sri Lanka',
        companyPhone: '+94 71 323 4643',
        companyEmail: 'shanodh62622@gmail.com',
        pdfUrl: invoiceData.pdfUrl,
        paymentInstructions: 'Please pay within 30 days of receipt'
      }
    };

    const result = await sendEmail(emailData);
    console.log('Invoice email sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send invoice email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
};

// Send quotation via email
export const sendQuotationEmail = async (quotationData: {
  customerEmail: string;
  customerName: string;
  quotationNumber: string;
  amount: number;
  validUntil: string;
  pdfUrl?: string;
}) => {
  try {
    const emailData: EmailData = {
      to: quotationData.customerEmail,
      subject: `Quotation ${quotationData.quotationNumber} - Techo Lanka CCTV`,
      template: EMAIL_TEMPLATES.QUOTATION_SENT,
      templateData: {
        customerName: quotationData.customerName,
        quotationNumber: quotationData.quotationNumber,
        amount: quotationData.amount,
        currency: 'LKR',
        validUntil: quotationData.validUntil,
        companyName: 'Techo Lanka',
        companyAddress: 'Colombo, Sri Lanka',
        companyPhone: '+94 71 323 4643',
        companyEmail: 'shanodh62622@gmail.com',
        pdfUrl: quotationData.pdfUrl,
        validityPeriod: '30 days'
      }
    };

    const result = await sendEmail(emailData);
    console.log('Quotation email sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send quotation email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
};

// Send password reset email
export const sendPasswordResetEmailToUser = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
};

// Email validation helper
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Email service status check
export const checkEmailServiceStatus = async () => {
  try {
    const checkStatus = httpsCallable(functions, 'checkEmailService');
    const result = await checkStatus();
    return { success: true, data: result };
  } catch (error) {
    console.error('Email service status check failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
};
