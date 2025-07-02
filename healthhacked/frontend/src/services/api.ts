// import axios from 'axios';
// import toast from 'react-hot-toast';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// // Create axios instance
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 10000,
// });

// // Add auth token to requests
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Handle response errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('API Error:', error);

//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//       toast.error('Session expired. Please login again.');
//     } else if (error.response?.status === 403) {
//       toast.error('Access denied');
//     } else if (error.response?.status >= 500) {
//       toast.error('Server error. Please try again later.');
//     } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
//       toast.error('Cannot connect to server. Please check if the backend is running.');
//     } else {
//       const message = error.response?.data?.error || error.message || 'An error occurred';
//       toast.error(message);
//     }

//     return Promise.reject(error);
//   }
// );

// // Auth API
// export const authAPI = {
//   login: async (email: string, password: string) => {
//     try {
//       const response = await api.post('/auth/login', { email, password });
//       return response.data;
//     } catch (error) {
//       console.error('Login error:', error);
//       throw error;
//     }
//   },

//   register: async (userData: { name: string; email: string; password: string }) => {
//     try {
//       const response = await api.post('/auth/register', userData);
//       return response.data;
//     } catch (error) {
//       console.error('Registration error:', error);
//       throw error;
//     }
//   },

//   me: async () => {
//     try {
//       const response = await api.get('/auth/me');
//       return response.data;
//     } catch (error) {
//       console.error('Get user error:', error);
//       throw error;
//     }
//   },

//   updateProfile: async (profileData: any) => {
//     try {
//       const response = await api.put('/auth/profile', profileData);
//       return response.data;
//     } catch (error) {
//       console.error('Update profile error:', error);
//       throw error;
//     }
//   }
// };

// // Chat API
// export const chatAPI = {
//   sendMessage: async (message: string) => {
//     try {
//       const response = await api.post('/chat', { message });
//       return response.data;
//     } catch (error) {
//       console.error('Chat error:', error);
//       throw error;
//     }
//   }
// };

// // Drug Information APIs
// export const drugAPI = {
//   searchDrug: async (searchTerm: string) => {
//     const response = await api.get('/drugs/search', {
//       params: { q: searchTerm }
//     });
//     return response.data;
//   },

//   getDrugInfo: async (drugName: string) => {
//     const response = await api.get(`/drugs/${encodeURIComponent(drugName)}`);
//     return response.data;
//   },

//   checkInteractions: async (drugs: string[]) => {
//     const response = await api.post('/drugs/interactions', { drugs });
//     return response.data;
//   },

//   getCommonIndianMedicines: async () => {
//     const response = await api.get('/drugs/common/india');
//     return response.data;
//   }
// };

// // Health API
// export const healthAPI = {
//   getDashboard: async () => {
//     try {
//       const response = await api.get('/health/dashboard');
//       return response.data;
//     } catch (error) {
//       console.error('Dashboard error:', error);
//       throw error;
//     }
//   },

//   getHealthContexts: async (status?: string) => {
//     try {
//       const params = status ? { status } : {};
//       const response = await api.get('/health/contexts', { params });
//       return response.data;
//     } catch (error) {
//       console.error('Health contexts error:', error);
//       throw error;
//     }
//   },

//   getHealthContext: async (id: string) => {
//     try {
//       const response = await api.get(`/health/contexts/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error('Health context error:', error);
//       throw error;
//     }
//   },

//   updateContextStatus: async (id: string, status: string, notes?: string) => {
//     try {
//       const response = await api.put(`/health/contexts/${id}/status`, { status, notes });
//       return response.data;
//     } catch (error) {
//       console.error('Update context status error:', error);
//       throw error;
//     }
//   },

//   getCarePlans: async (status?: string) => {
//     try {
//       const params = status ? { status } : {};
//       const response = await api.get('/health/care-plans', { params });
//       return response.data;
//     } catch (error) {
//       console.error('Care plans error:', error);
//       throw error;
//     }
//   },

//   getCarePlan: async (id: string) => {
//     try {
//       const response = await api.get(`/health/care-plans/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error('Care plan error:', error);
//       throw error;
//     }
//   },

//   completeRecommendation: async (carePlanId: string, recommendationId: string, notes?: string) => {
//     try {
//       const response = await api.put(
//         `/health/care-plans/${carePlanId}/recommendations/${recommendationId}/complete`,
//         { notes }
//       );
//       return response.data;
//     } catch (error) {
//       console.error('Complete recommendation error:', error);
//       throw error;
//     }
//   },

//   addRecommendation: async (carePlanId: string, recommendation: any) => {
//     try {
//       const response = await api.post(`/health/care-plans/${carePlanId}/recommendations`, recommendation);
//       return response.data;
//     } catch (error) {
//       console.error('Add recommendation error:', error);
//       throw error;
//     }
//   },
//   deleteHealthContext: async (contextId: string) => {
//     const response = await api.delete(`/health/contexts/${contextId}`);
//     return response.data;
//   },

//   // Delete care plan
//   deleteCarePlan: async (carePlanId: string) => {
//     const response = await api.delete(`/health/care-plans/${carePlanId}`);
//     return response.data;
//   },

//   generateRecommendations: async (contextId: string) => {
//     try {
//       const response = await api.post('/health/recommendations/generate', { contextId });
//       return response.data;
//     } catch (error) {
//       console.error('Generate recommendations error:', error);
//       throw error;
//     }
//   },

//   // Drug-related methods 
//   searchDrug: drugAPI.searchDrug,
//   getDrugInfo: drugAPI.getDrugInfo,
//   checkInteractions: drugAPI.checkInteractions,
//   getCommonIndianMedicines: drugAPI.getCommonIndianMedicines,
  
//   createSleepEntry: (entryData) => apiRequest('/sleep/entries', 'POST', entryData),
//   getSleepEntries: (params) => apiRequest('/sleep/entries', 'GET', null, params),
//   updateSleepEntry: (id, entryData) => apiRequest(`/sleep/entries/${id}`, 'PUT', entryData),
//   deleteSleepEntry: (id) => apiRequest(`/sleep/entries/${id}`, 'DELETE'),
//   getSleepCalendar: (year, month) => apiRequest(`/sleep/calendar/${year}/${month}`, 'GET'),
//   getCurrentSleepDebt: () => apiRequest('/sleep/debt/current', 'GET'),
//   getSleepTrend: (days) => apiRequest('/sleep/debt/trend', 'GET', null, { days }),
//   getProductivityCurve: (date) => apiRequest(`/sleep/productivity/${date}`, 'GET'),
//   getWeeklyAnalytics: (weekOffset) => apiRequest('/sleep/analytics/weekly', 'GET', null, { weekOffset }),
//   getMonthlyAnalytics: (year, month) => apiRequest('/sleep/analytics/monthly', 'GET', null, { year, month }),
//   getPersonalInsights: () => apiRequest('/sleep/insights/personal', 'GET'),
// };

// // Test API connection
// export const testConnection = async () => {
//   try {
//     const response = await api.get('/health');
//     return response.data;
//   } catch (error) {
//     console.error('Connection test failed:', error);
//     return false;
//   }
// };

// export default api;


import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 100000000,
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

// Generic API request helper
const apiRequest = async (endpoint: string, method: string = 'GET', data: any = null, params: any = null) => {
  try {
    const config: any = {
      method,
      url: endpoint,
    };
    
    if (data) {
      config.data = data;
    }
    
    if (params) {
      config.params = params;
    }
    
    const response = await api.request(config);
    return response.data;
  } catch (error) {
    console.error(`API ${method} ${endpoint} error:`, error);
    throw error;
  }
};

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

// Drug Information APIs
export const drugAPI = {
  searchDrug: async (searchTerm: string) => {
    const response = await api.get('/drugs/search', {
      params: { q: searchTerm }
    });
    return response.data;
  },

  getDrugInfo: async (drugName: string) => {
    const response = await api.get(`/drugs/${encodeURIComponent(drugName)}`);
    return response.data;
  },

  checkInteractions: async (drugs: string[]) => {
    const response = await api.post('/drugs/interactions', { drugs });
    return response.data;
  },

  getCommonIndianMedicines: async () => {
    const response = await api.get('/drugs/common/india');
    return response.data;
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

  deleteHealthContext: async (contextId: string) => {
    const response = await api.delete(`/health/contexts/${contextId}`);
    return response.data;
  },

  deleteCarePlan: async (carePlanId: string) => {
    const response = await api.delete(`/health/care-plans/${carePlanId}`);
    return response.data;
  },

  generateRecommendations: async (contextId: string) => {
    try {
      const response = await api.post('/health/recommendations/generate', { contextId });
      return response.data;
    } catch (error) {
      console.error('Generate recommendations error:', error);
      throw error;
    }
  },

  // Drug-related methods 
  searchDrug: drugAPI.searchDrug,
  getDrugInfo: drugAPI.getDrugInfo,
  checkInteractions: drugAPI.checkInteractions,
  getCommonIndianMedicines: drugAPI.getCommonIndianMedicines,
  
  // Sleep API methods - Fixed to use proper API calls
  createSleepEntry: async (entryData: any) => {
    return apiRequest('/sleep/entries', 'POST', entryData);
  },
  
  getSleepEntries: async (params?: any) => {
    return apiRequest('/sleep/entries', 'GET', null, params);
  },
  
  updateSleepEntry: async (id: string, entryData: any) => {
    return apiRequest(`/sleep/entries/${id}`, 'PUT', entryData);
  },
  
  deleteSleepEntry: async (id: string) => {
    return apiRequest(`/sleep/entries/${id}`, 'DELETE');
  },
  
  getSleepCalendar: async (year: number, month: number) => {
    return apiRequest(`/sleep/calendar/${year}/${month}`, 'GET');
  },
  
  getCurrentSleepDebt: async () => {
    return apiRequest('/sleep/debt/current', 'GET');
  },
  
  getSleepTrend: async (days?: number) => {
    return apiRequest('/sleep/debt/trend', 'GET', null, { days });
  },
  
  getProductivityCurve: async (date: string) => {
    return apiRequest(`/sleep/productivity/${date}`, 'GET');
  },
  
  getWeeklyAnalytics: async (weekOffset?: number) => {
    return apiRequest('/sleep/analytics/weekly', 'GET', null, { weekOffset });
  },
  
  getMonthlyAnalytics: async (year?: number, month?: number) => {
    return apiRequest('/sleep/analytics/monthly', 'GET', null, { year, month });
  },
  
  getPersonalInsights: async () => {
    return apiRequest('/sleep/insights/personal', 'GET');
  },
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