# Techo Lanka CCTV Management System

A modern, secure web application for managing CCTV business operations including products, customers, quotations, and invoices.

## 🚀 Features

### Core Modules
- **Authentication & Session Management**: Secure JWT-based authentication with automatic session timeout
- **Dashboard**: Real-time business overview with key metrics and recent activities
- **Product Management**: Complete CRUD operations for CCTV products and inventory
- **Customer Management**: Customer profiles with history tracking
- **Quotation System**: Create and manage quotations with approval workflow
- **Invoice System**: Legal-compliant invoicing with PDF generation

### Security Features
- Firebase Authentication with email verification
- Role-based access control (Admin/Staff)
- Secure session handling with automatic timeout
- Protected routes and API endpoints
- OWASP security best practices

### UI/UX Features
- Modern, responsive design with Tailwind CSS
- Clean sidebar navigation
- Real-time session monitoring
- Toast notifications for user feedback
- Mobile-friendly responsive layout

## 🛠 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for global state
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Yup validation
- **PDF Generation**: jsPDF for invoice generation
- **Icons**: Lucide React

## 📦 Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Firebase Setup**
   - Create a new Firebase project
   - Enable Authentication and Firestore
   - Copy your Firebase config to `src/services/firebase.ts`
   - Set up Firestore security rules

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Firebase Configuration

Replace the configuration in `src/services/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components
│   └── ui/             # Base UI components
├── pages/              # Page components
├── services/           # API and external services
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── hooks/              # Custom React hooks
```

## 🔐 Session Management

The application includes comprehensive session management:

- **Automatic Timeout**: Sessions expire after 30 minutes of inactivity
- **Activity Monitoring**: User interactions automatically extend the session
- **Warning System**: Users get a 5-minute warning before session expiry
- **Graceful Logout**: Automatic logout when session expires
- **Session State**: Persistent session state across browser refreshes

## 📱 Responsive Design

- **Desktop**: Full sidebar navigation with detailed information
- **Tablet**: Collapsible sidebar with touch-friendly interactions
- **Mobile**: Bottom navigation with optimized layout

## 🔒 Security Best Practices

- Input validation on all forms
- CSRF protection through Firebase
- Secure session handling with automatic timeout
- Role-based route protection
- Audit trail for all user actions

## 📊 Business Logic

### Invoice Numbering
- Format: `INV-YYYY-XXXX` (e.g., `INV-2026-0001`)
- Sequential numbering per year
- Immutable once created

### Quotation System
- Unique quotation numbers
- Status tracking (Draft/Sent/Approved/Rejected)
- One-click conversion to invoices

### Stock Management
- Real-time inventory tracking
- Low stock alerts
- Automatic stock updates on invoice creation

## 🚀 Next Steps

1. Configure Firebase project with your credentials
2. Set up user accounts (first user should be created via Firebase Console)
3. Start adding products and customers
4. Begin creating quotations and invoices

---

**A.E Techo Lanka (Pvt) Ltd** - Professional CCTV Management System
