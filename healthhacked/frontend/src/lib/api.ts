// ================================
// STEP 4: Create the API client
// File: frontend/src/lib/api.ts
// ================================
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, User } from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('healthhacked_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('healthhacked_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = 
      await this.client.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    age?: number;
    gender?: string;
    timezone?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = 
      await this.client.post('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = 
      await this.client.get('/auth/me');
    return response.data;
  }

  async sendMessage(message: string, sessionId?: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.client.post('/chat', { message, sessionId });
    return response.data;
  }
}

export const apiClient = new ApiClient();