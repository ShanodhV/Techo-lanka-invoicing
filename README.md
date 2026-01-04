# 🚀 Techo Lanka CCTV Management System

A comprehensive business management system for CCTV operations, built with React, TypeScript, Firebase, and Tailwind CSS.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FShanodhV%2FTecho-lanka-invoicing)
[![CI/CD](https://github.com/ShanodhV/Techo-lanka-invoicing/actions/workflows/deploy.yml/badge.svg)](https://github.com/ShanodhV/Techo-lanka-invoicing/actions/workflows/deploy.yml)

## ✨ Features

### 🔐 Authentication & Security
- Secure Firebase authentication with role-based access
- Session management with automatic timeout (30 minutes)
- Protected routes and admin-only features
- Comprehensive security headers

### 📊 Business Management Modules
- **📱 Dashboard**: Real-time business insights and statistics
- **📦 Products**: Complete inventory management with categories and stock tracking
- **👥 Customers**: Customer relationship management with detailed profiles
- **📄 Quotations**: Professional quotation generation with PDF export
- **🧾 Invoices**: Invoice creation, payment tracking, and balance management
- **⚙️ Settings**: User management and system configuration (Admin only)

### 🎨 Modern UI/UX
- Responsive design with mobile-first approach
- Professional gradient themes and modern components
- Full-screen and side panel modals
- Accessible design with proper ARIA labels
- Loading states and comprehensive error handling

### 🔄 Real-time Features
- Live data synchronization with Firebase Firestore
- Real-time stock updates and inventory tracking
- Session monitoring with warning dialogs
- Toast notifications for user feedback

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for predictable state updates
- **Database**: Firebase Firestore with real-time capabilities
- **Authentication**: Firebase Auth with role management
- **Icons**: Lucide React for consistent iconography
- **Routing**: React Router DOM with protected routes
- **Notifications**: React Hot Toast for user feedback
- **Build**: Vite for fast development and optimized builds

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+
- Firebase project with Firestore and Authentication enabled

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ShanodhV/Techo-lanka-invoicing.git
cd Techo-lanka-invoicing
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory based on `.env.example`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. **Firebase Setup**
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Add your domain to authorized domains

5. **Start development server**
```bash
npm run dev
```

6. **Access the application**
Open [http://localhost:5173](http://localhost:5173) in your browser

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production with optimizations
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint with TypeScript support
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript type checking

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout and navigation components
│   ├── ui/             # Base UI components (modals, buttons, etc.)
│   ├── customers/      # Customer-specific components
│   ├── products/       # Product management components
│   ├── quotations/     # Quotation workflow components
│   └── invoices/       # Invoice management components
├── pages/              # Page components for routing
├── services/           # API services and Firebase integration
├── store/              # Zustand stores for state management
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and helpers
```

## 🚀 Deployment

### Automatic Deployment (Recommended)
The project includes GitHub Actions for automated deployment:

1. **Push to GitHub**: Every push to `main` branch triggers deployment
2. **Automated Testing**: Code quality checks and build verification
3. **Production Deployment**: Automatic deployment to Vercel

### Manual Deployment Options

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 🔒 Security Features

### Authentication & Authorization
- Firebase Authentication with secure token management
- Role-based access control (Admin/User permissions)
- Session timeout with configurable duration
- Protected routes with redirect handling

### Data Security
- Input validation and sanitization
- XSS protection with security headers
- CSRF protection through Firebase security rules
- Secure environment variable handling

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 **Mobile devices** (320px+) - Touch-optimized interface
- 📱 **Tablets** (768px+) - Adaptive layout with touch support
- 💻 **Desktop** (1024px+) - Full-featured interface
- 🖥️ **Large screens** (1440px+) - Enhanced data visualization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the coding conventions in `.github/copilot-instructions.md`
4. Commit your changes with conventional commits
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Coding Standards
- Use TypeScript for all components
- Follow React functional component patterns
- Use Zustand for state management
- Implement proper error handling
- Add proper TypeScript types
- Follow accessibility best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please:
1. Check the [Issues](https://github.com/ShanodhV/Techo-lanka-invoicing/issues) page
2. Create a new issue with detailed description
3. Contact the development team

## 🚀 Live Demo

Visit the live application: **[https://techo-lanka-invoicing.vercel.app](https://techo-lanka-invoicing.vercel.app)**

---

Built with ❤️ by the Techo Lanka Development Team

**Key Features:**
✅ Complete CRM System | ✅ Real-time Data | ✅ Professional UI | ✅ Mobile Responsive | ✅ Secure Authentication | ✅ Automated Deployment
