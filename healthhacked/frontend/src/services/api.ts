// File: frontend/src/services/api.ts
// REPLACE THE EXISTING FILE COMPLETELY

import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('Access denied');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      toast.error('Cannot connect to server. Please check if the backend is running.');
    } else {
      const message = error.response?.data?.error || error.message || 'An error occurred';
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  me: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },
  
  updateProfile: async (profileData: any) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};

// Chat API
export const chatAPI = {
  sendMessage: async (message: string) => {
    try {
      const response = await api.post('/chat', { message });
      return response.data;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }
};

// Health API
export const healthAPI = {
  getDashboard: async () => {
    try {
      const response = await api.get('/health/dashboard');
      return response.data;
    } catch (error) {
      console.error('Dashboard error:', error);
      throw error;
    }
  },
  
  getHealthContexts: async (status?: string) => {
    try {
      const params = status ? { status } : {};
      const response = await api.get('/health/contexts', { params });
      return response.data;
    } catch (error) {
      console.error('Health contexts error:', error);
      throw error;
    }
  },
  
  getHealthContext: async (id: string) => {
    try {
      const response = await api.get(`/health/contexts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Health context error:', error);
      throw error;
    }
  },
  
  updateContextStatus: async (id: string, status: string, notes?: string) => {
    try {
      const response = await api.put(`/health/contexts/${id}/status`, { status, notes });
      return response.data;
    } catch (error) {
      console.error('Update context status error:', error);
      throw error;
    }
  },
  
  getCarePlans: async (status?: string) => {
    try {
      const params = status ? { status } : {};
      const response = await api.get('/health/care-plans', { params });
      return response.data;
    } catch (error) {
      console.error('Care plans error:', error);
      throw error;
    }
  },
  
  getCarePlan: async (id: string) => {
    try {
      const response = await api.get(`/health/care-plans/${id}`);
      return response.data;
    } catch (error) {
      console.error('Care plan error:', error);
      throw error;
    }
  },
  
  completeRecommendation: async (carePlanId: string, recommendationId: string, notes?: string) => {
    try {
      const response = await api.put(
        `/health/care-plans/${carePlanId}/recommendations/${recommendationId}/complete`,
        { notes }
      );
      return response.data;
    } catch (error) {
      console.error('Complete recommendation error:', error);
      throw error;
    }
  },
  
  addRecommendation: async (carePlanId: string, recommendation: any) => {
    try {
      const response = await api.post(`/health/care-plans/${carePlanId}/recommendations`, recommendation);
      return response.data;
    } catch (error) {
      console.error('Add recommendation error:', error);
      throw error;
    }
  },
  
  generateRecommendations: async (contextId: string) => {
    try {
      const response = await api.post('/health/recommendations/generate', { contextId });
      return response.data;
    } catch (error) {
      console.error('Generate recommendations error:', error);
      throw error;
    }
  }
};

// Test API connection
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

export default api;