// ================================
// File: frontend/src/App.tsx
// ================================
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './hooks/useAuth';
import { Header } from './components/layout/Header';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { ChatInterface } from './components/chat/ChatInterface';
import './globals.css';

const queryClient = new QueryClient();

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/chat" 
                element={
                  isAuthenticated ? (
                    <div className="h-screen pt-16">
                      <ChatInterface />
                    </div>
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
              {/* Add more protected routes here */}
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;