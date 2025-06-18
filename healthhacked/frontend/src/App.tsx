// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { Toaster } from 'react-hot-toast';

// // Simple components
// function SimpleHome({ isAuthenticated }: { isAuthenticated: boolean }) {
//   return (
//     <div>
//       <div className="hero">
//         <h1>🏥 HealthHacked</h1>
//         <p>Your AI-powered health companion</p>
//         {!isAuthenticated ? (
//           <div>
//             <a href="/register" className="btn" style={{marginRight: '10px'}}>Get Started</a>
//             <a href="/login" className="btn btn-outline">Login</a>
//           </div>
//         ) : (
//           <a href="/chat" className="btn">Go to Chat</a>
//         )}
//       </div>
//     </div>
//   );
// }

// function SimpleLogin({ setIsAuthenticated }: { setIsAuthenticated: (auth: boolean) => void }) {
//   const [email, setEmail] = React.useState('');
//   const [password, setPassword] = React.useState('');
//   const [loading, setLoading] = React.useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       const response = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password })
//       });
      
//       const data = await response.json();
      
//       if (data.success) {
//         localStorage.setItem('healthhacked_token', data.data.token);
//         setIsAuthenticated(true);
//         alert('Login successful! Redirecting...');
//         window.location.href = '/chat';
//       } else {
//         alert('Login failed: ' + data.error);
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       alert('Login failed: Network error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <div className="card">
//           <div className="text-center mb-6">
//             <h2>Welcome Back</h2>
//             <p>Sign in to your account</p>
//           </div>
//           <form onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label>Email</label>
//               <input 
//                 type="email" 
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required 
//                 autoComplete="email"
//               />
//             </div>
//             <div className="form-group">
//               <label>Password</label>
//               <input 
//                 type="password" 
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required 
//                 autoComplete="current-password"
//               />
//             </div>
//             <button type="submit" className="btn" style={{width: '100%'}} disabled={loading}>
//               {loading ? 'Signing in...' : 'Sign In'}
//             </button>
//           </form>
//           <div className="text-center mt-4">
//             <a href="/register">Don't have an account? Sign up</a>
//           </div>
          
//           <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', fontSize: '12px' }}>
//             <strong>Debug:</strong><br />
//             Email: {email}<br />
//             Password: {password ? '***' : 'empty'}<br />
//             Loading: {loading ? 'Yes' : 'No'}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function SimpleRegister({ setIsAuthenticated }: { setIsAuthenticated: (auth: boolean) => void }) {
//   const [name, setName] = React.useState('');
//   const [email, setEmail] = React.useState('');
//   const [password, setPassword] = React.useState('');
//   const [loading, setLoading] = React.useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       const response = await fetch('/api/auth/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ name, email, password })
//       });
      
//       const data = await response.json();
      
//       if (data.success) {
//         localStorage.setItem('healthhacked_token', data.data.token);
//         setIsAuthenticated(true);
//         alert('Registration successful! Redirecting...');
//         window.location.href = '/chat';
//       } else {
//         alert('Registration failed: ' + data.error);
//       }
//     } catch (error) {
//       console.error('Registration error:', error);
//       alert('Registration failed: Network error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <div className="card">
//           <div className="text-center mb-6">
//             <h2>Create Account</h2>
//             <p>Sign up for HealthHacked</p>
//           </div>
//           <form onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label>Full Name</label>
//               <input 
//                 type="text" 
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 required 
//               />
//             </div>
//             <div className="form-group">
//               <label>Email</label>
//               <input 
//                 type="email" 
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required 
//               />
//             </div>
//             <div className="form-group">
//               <label>Password</label>
//               <input 
//                 type="password" 
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required 
//               />
//             </div>
//             <button type="submit" className="btn" style={{width: '100%'}} disabled={loading}>
//               {loading ? 'Creating account...' : 'Create Account'}
//             </button>
//           </form>
//           <div className="text-center mt-4">
//             <a href="/login">Already have an account? Sign in</a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function SimpleChat() {
//   const [messages, setMessages] = React.useState<any[]>([]);
//   const [isLoading, setIsLoading] = React.useState(false);
//   const [input, setInput] = React.useState('');

//   const sendMessage = async (message: string) => {
//     const userMessage = {
//       role: 'user',
//       content: message,
//       timestamp: new Date().toISOString()
//     };
    
//     setMessages(prev => [...prev, userMessage]);
//     setIsLoading(true);

//     try {
//       const response = await fetch('/api/chat', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('healthhacked_token')}`
//         },
//         body: JSON.stringify({ message })
//       });

//       if (response.ok) {
//         const data = await response.json();
//         const aiMessage = {
//           role: 'assistant',
//           content: data.data?.response || 'AI response received',
//           timestamp: new Date().toISOString()
//         };
//         setMessages(prev => [...prev, aiMessage]);
//       } else {
//         throw new Error('API call failed');
//       }
//     } catch (error) {
//       const errorMessage = {
//         role: 'assistant',
//         content: 'Sorry, I am having trouble connecting to the AI service right now. Please try again later.',
//         timestamp: new Date().toISOString()
//       };
//       setMessages(prev => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!input.trim()) return;
    
//     const message = input;
//     setInput('');
    
//     await sendMessage(message);
//   };

//   return (
//     <div className="chat-container">
//       <div className="chat-messages">
//         {messages.length === 0 ? (
//           <div className="text-center" style={{ padding: '50px 20px' }}>
//             <h3>🏥 Welcome to HealthHacked Chat</h3>
//             <p>Ask me about your health concerns and I'll help you understand them better.</p>
//             <p style={{ color: '#666', fontSize: '14px', marginTop: '20px' }}>
//               Try asking: "I have a headache" or "I'm feeling tired lately"
//             </p>
//           </div>
//         ) : (
//           messages.map((msg: any, idx: number) => (
//             <div key={idx} className={`message ${msg.role}`}>
//               <div className="message-bubble">
//                 <strong>{msg.role === 'user' ? 'You' : 'HealthHacked AI'}:</strong>
//                 <br />
//                 {msg.content}
//                 <div style={{ fontSize: '11px', color: msg.role === 'user' ? '#ccc' : '#666', marginTop: '5px' }}>
//                   {new Date(msg.timestamp).toLocaleTimeString()}
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//         {isLoading && (
//           <div className="loading">
//             <div className="message assistant">
//               <div className="message-bubble">
//                 <strong>HealthHacked AI:</strong><br />
//                 Thinking... 🤔
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//       <div className="chat-input">
//         <form onSubmit={handleSubmit} className="chat-form">
//           <input
//             type="text"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder="Describe your symptoms or ask a health question..."
//             disabled={isLoading}
//             style={{ fontSize: '14px' }}
//           />
//           <button type="submit" className="btn" disabled={!input.trim() || isLoading}>
//             {isLoading ? 'Sending...' : 'Send'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// const queryClient = new QueryClient();

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = React.useState(false);
//   const [loading, setLoading] = React.useState(true);

//   React.useEffect(() => {
//     const token = localStorage.getItem('healthhacked_token');
//     setIsAuthenticated(!!token);
//     setLoading(false);
//   }, []);

//   React.useEffect(() => {
//     const handleStorageChange = () => {
//       const token = localStorage.getItem('healthhacked_token');
//       setIsAuthenticated(!!token);
//     };

//     window.addEventListener('storage', handleStorageChange);
    
//     const interval = setInterval(() => {
//       const token = localStorage.getItem('healthhacked_token');
//       setIsAuthenticated(!!token);
//     }, 1000);

//     return () => {
//       window.removeEventListener('storage', handleStorageChange);
//       clearInterval(interval);
//     };
//   }, []);

//   if (loading) {
//     return <div style={{ padding: '50px', textAlign: 'center' }}>Loading HealthHacked...</div>;
//   }

//   return (
//     <QueryClientProvider client={queryClient}>
//       <Router>
//         <div>
//           <header className="header">
//             <div className="header-content">
//               <a href="/" className="logo">HealthHacked</a>
//               <nav className="nav">
//                 {isAuthenticated ? (
//                   <>
//                     <a href="/chat">Chat</a>
//                     <button onClick={() => {
//                       localStorage.removeItem('healthhacked_token');
//                       setIsAuthenticated(false);
//                       window.location.href = '/';
//                     }} className="btn btn-secondary">Logout</button>
//                   </>
//                 ) : (
//                   <>
//                     <a href="/login">Login</a>
//                     <a href="/register">Register</a>
//                   </>
//                 )}
//               </nav>
//             </div>
//           </header>
//           <Routes>
//             <Route path="/" element={<SimpleHome isAuthenticated={isAuthenticated} />} />
//             <Route path="/login" element={<SimpleLogin setIsAuthenticated={setIsAuthenticated} />} />
//             <Route path="/register" element={<SimpleRegister setIsAuthenticated={setIsAuthenticated} />} />
//             <Route 
//               path="/chat" 
//               element={isAuthenticated ? <SimpleChat /> : <Navigate to="/login" />} 
//             />
//           </Routes>
//           <Toaster />
//         </div>
//       </Router>
//     </QueryClientProvider>
//   );
// }

// export default App;

// File: frontend/src/App.tsx
// REPLACE THE EXISTING FILE

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './hooks/useAuth';
import { Header } from './components/layout/Header';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { CarePlans } from './pages/CarePlans';

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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          
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

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
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