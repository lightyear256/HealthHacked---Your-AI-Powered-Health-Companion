// const isDevelopment = process.env.NODE_ENV === 'development';
// const isProduction = process.env.NODE_ENV === 'production';

// // API Base URLs
// const API_URLS = {
//   development: 'http://localhost:5000',
//   production: 'https://healthhacked-your-ai.onrender.com'
// };

// // Get current API base URL
// const API_BASE_URL = isDevelopment ? API_URLS.development : API_URLS.production;

// // Frontend URLs
// const FRONTEND_URLS = {
//   development: 'http://localhost:5173',
//   production: 'https://health-hacked-your-ai-powered-healt.vercel.app'
// };

// const FRONTEND_URL = isDevelopment ? FRONTEND_URLS.development : FRONTEND_URLS.production;

// // API Configuration
// const apiConfig = {
//   baseURL: API_BASE_URL,
//   timeout: 10000, // 10 seconds
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true
// };

// // API Endpoints
// const endpoints = {
//   // Authentication
//   auth: {
//     register: '/api/auth/register',
//     login: '/api/auth/login',
//     logout: '/api/auth/logout',
//     me: '/api/auth/me',
//     refresh: '/api/auth/refresh',
//     forgotPassword: '/api/auth/forgot-password',
//     resetPassword: '/api/auth/reset-password'
//   },

//   // Health & Dashboard
//   health: {
//     dashboard: '/api/health/dashboard',
//     contexts: '/api/health/contexts',
//     carePlans: '/api/health/care-plans',
//     createContext: '/api/health/contexts',
//     updateContext: (id) => `/api/health/contexts/${id}`,
//     deleteContext: (id) => `/api/health/contexts/${id}`
//   },

//   // Chat & AI
//   chat: {
//     send: '/api/chat',
//     history: '/api/chat/history',
//     clear: '/api/chat/clear',
//     sessions: '/api/chat/sessions',
//     session: (id) => `/api/chat/sessions/${id}`
//   },

//   // Sleep Tracking
//   sleep: {
//     dashboard: '/api/sleep/dashboard',
//     entries: '/api/sleep/entries',
//     currentDebt: '/api/sleep/debt/current',
//     calendar: (year, month) => `/api/sleep/calendar/${year}/${month}`,
//     profile: '/api/sleep/profile',
//     insights: '/api/sleep/insights',
//     recommendations: '/api/sleep/recommendations'
//   },

//   // Drug Information
//   drugs: {
//     search: '/api/drugs/search',
//     details: (drugId) => `/api/drugs/${drugId}`,
//     interactions: '/api/drugs/interactions',
//     sideEffects: (drugId) => `/api/drugs/${drugId}/side-effects`
//   },

//   // User Profile
//   user: {
//     profile: '/api/user/profile',
//     updateProfile: '/api/user/profile',
//     preferences: '/api/user/preferences',
//     notifications: '/api/user/notifications'
//   }
// };

// // Axios instance (if using axios)
// const createApiInstance = () => {
//   if (typeof window !== 'undefined' && window.axios) {
//     return window.axios.create(apiConfig);
//   }
//   return null;
// };

// // Fetch wrapper for API calls
// const apiCall = async (endpoint, options = {}) => {
//   const url = `${API_BASE_URL}${endpoint}`;
  
//   const defaultOptions = {
//     headers: {
//       'Content-Type': 'application/json',
//       ...options.headers
//     },
//     credentials: 'include', // Include cookies
//     ...options
//   };

//   // Add auth token if available
//   const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
//   if (token) {
//     defaultOptions.headers.Authorization = `Bearer ${token}`;
//   }

//   try {
//     const response = await fetch(url, defaultOptions);
    
//     // Handle different response types
//     const contentType = response.headers.get('content-type');
//     let data;
    
//     if (contentType && contentType.includes('application/json')) {
//       data = await response.json();
//     } else {
//       data = await response.text();
//     }

//     if (!response.ok) {
//       throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
//     }

//     return data;
//   } catch (error) {
//     console.error('API call failed:', error);
//     throw error;
//   }
// };

// // Convenient API methods
// const api = {
//   // GET request
//   get: (endpoint, params = {}) => {
//     const url = new URL(`${API_BASE_URL}${endpoint}`);
//     Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
//     return apiCall(url.pathname + url.search, {
//       method: 'GET'
//     });
//   },

//   // POST request
//   post: (endpoint, data = {}) => {
//     return apiCall(endpoint, {
//       method: 'POST',
//       body: JSON.stringify(data)
//     });
//   },

//   // PUT request
//   put: (endpoint, data = {}) => {
//     return apiCall(endpoint, {
//       method: 'PUT',
//       body: JSON.stringify(data)
//     });
//   },

//   // PATCH request
//   patch: (endpoint, data = {}) => {
//     return apiCall(endpoint, {
//       method: 'PATCH',
//       body: JSON.stringify(data)
//     });
//   },

//   // DELETE request
//   delete: (endpoint) => {
//     return apiCall(endpoint, {
//       method: 'DELETE'
//     });
//   },

//   // File upload
//   upload: (endpoint, formData) => {
//     return apiCall(endpoint, {
//       method: 'POST',
//       body: formData,
//       headers: {} // Let browser set content-type for FormData
//     });
//   }
// };

// // Auth helpers
// const auth = {
//   setToken: (token) => {
//     localStorage.setItem('authToken', token);
//   },
  
//   getToken: () => {
//     return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
//   },
  
//   removeToken: () => {
//     localStorage.removeItem('authToken');
//     sessionStorage.removeItem('authToken');
//   },
  
//   isAuthenticated: () => {
//     return !!auth.getToken();
//   }
// };

// // Environment info
// const env = {
//   isDevelopment,
//   isProduction,
//   API_BASE_URL,
//   FRONTEND_URL,
//   NODE_ENV: process.env.NODE_ENV || 'development'
// };

// // Export for different module systems
// if (typeof module !== 'undefined' && module.exports) {
//   // Node.js/CommonJS
//   module.exports = {
//     apiConfig,
//     endpoints,
//     api,
//     auth,
//     env,
//     createApiInstance,
//     API_BASE_URL,
//     FRONTEND_URL
//   };
// } else if (typeof window !== 'undefined') {
//   // Browser
//   window.HealthHackedAPI = {
//     apiConfig,
//     endpoints,
//     api,
//     auth,
//     env,
//     createApiInstance,
//     API_BASE_URL,
//     FRONTEND_URL
//   };
// }

// // Default export for ES modules
// export default {
//   apiConfig,
//   endpoints,
//   api,
//   auth,
//   env,
//   createApiInstance,
//   API_BASE_URL,
//   FRONTEND_URL
// };

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

require('dotenv').config();

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const healthRoutes = require('./routes/health');
const drugsRoutes = require('./routes/drugs');
const sleepRoutes = require('./routes/sleepTracking');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175',
    'https://healthhacked-your-ai.onrender.com',
    'https://health-hacked-your-ai-powered-healt.vercel.app'
  ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ROOT ROUTE HANDLER - CRITICAL FOR RENDER HEALTH CHECKS
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HealthHacked API is running! 🚀',
    service: 'HealthHacked Backend',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'HealthHacked API',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'HealthHacked API is working!',
    timestamp: new Date().toISOString(),
    features: [
      'AI-powered health conversations',
      'Health context tracking', 
      'Automated care plan generation',
      'Progress monitoring',
      'Real-time chat history',
      'Sleep Intelligence tracking'
    ],
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login', 
      'GET /api/auth/me',
      'POST /api/chat',
      'GET /api/health/dashboard',
      'GET /api/health/contexts',
      'GET /api/health/care-plans',
      'POST /api/sleep/entries',
      'GET /api/sleep/debt/current',
      'GET /api/sleep/calendar/:year/:month'
    ]
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/drugs', drugsRoutes);
app.use('/api/sleep', sleepRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// CRITICAL: Export the app
module.exports = app;