import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthService } from './services/auth';
import { initializeSessionMonitoring, cleanupSessionMonitoring } from './store';
import { LoginForm } from './components/auth/LoginForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Customers } from './pages/Customers';
import { Quotations } from './pages/Quotations';
import { Invoices } from './pages/Invoices';
import { Settings as SettingsPage } from './pages/Settings';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize Firebase auth listener
    AuthService.initializeAuthListener();
    
    // Initialize session monitoring
    initializeSessionMonitoring();

    // Cleanup on unmount
    return () => {
      cleanupSessionMonitoring();
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10B981',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
        
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginForm />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="customers" element={<Customers />} />
            <Route path="quotations" element={<Quotations />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch all route - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
