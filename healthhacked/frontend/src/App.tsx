

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './hooks/useAuth';
import { Header } from './components/Header';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { CarePlans } from './pages/CarePlans';
import { MealPlans } from './pages/MealPlans';
import { PillProfile } from './pages/PillProfile';
import { Creators } from './pages/Creators';
import { SleepDashboard } from './components/sleep/SleepDashboard';
import { Error } from './pages/error';


// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
function ConditionalHeader() {
  const location = useLocation();
  
  // List of paths where Header should NOT be shown
  const hideHeaderPaths = ['/error', '/404'];
  
  // Check if current path matches any route that exists
  const validPaths = [
    '/',
    '/login',
    '/register',
    '/dashboard',
    '/chat',
    '/care-plans',
    '/meal-plans',
    '/sleep',
    '/pill-profile',
    '/creators'
  ];
  
  const isValidPath = validPaths.some(path => 
    location.pathname === path || 
    location.pathname.startsWith('/care-plans/')
  );
  
  // Don't show header on 404 pages (invalid paths) or explicitly hidden paths
  if (!isValidPath || hideHeaderPaths.includes(location.pathname)) {
    return null;
  }
  
  return <Header />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <ConditionalHeader/>

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/creators" element={<Creators />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/care-plans"
            element={
              <ProtectedRoute>
                <CarePlans />
              </ProtectedRoute>
            }
          />

          <Route
            path="/care-plans/:id"
            element={
              <ProtectedRoute>
                <CarePlans />
              </ProtectedRoute>
            }
          />

          <Route
            path="/meal-plans"
            element={
              <ProtectedRoute>
                <MealPlans />
              </ProtectedRoute>
            }
          />

          <Route path="/sleep" 
           element={ <ProtectedRoute>
                <SleepDashboard />
              </ProtectedRoute>} />

          {/* Pill Profile Route - WITHOUT ID */}
          <Route
            path="/pill-profile"
            element={
              <ProtectedRoute>
                <PillProfile />
              </ProtectedRoute>
            }
          />

          {/* Redirect unknown routes */}
           <Route path="*" element={<Error/>} />
        </Routes>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>

  );
}

export default App;