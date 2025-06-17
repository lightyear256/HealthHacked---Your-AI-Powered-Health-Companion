// ================================
// STEP 5: Create the auth store
// File: frontend/src/hooks/useAuth.ts
// ================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { apiClient } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.login({ email, password });
          if (response.success && response.data) {
            const { user, token } = response.data;
            localStorage.setItem('healthhacked_token', token);
            set({ 
              user, 
              token, 
              isAuthenticated: true, 
              isLoading: false 
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData: any) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.register(userData);
          if (response.success && response.data) {
            const { user, token } = response.data;
            localStorage.setItem('healthhacked_token', token);
            set({ 
              user, 
              token, 
              isAuthenticated: true, 
              isLoading: false 
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('healthhacked_token');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ 
            user: { ...currentUser, ...userData } 
          });
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('healthhacked_token');
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data) {
            set({ 
              user: response.data.user, 
              token, 
              isAuthenticated: true 
            });
          }
        } catch (error) {
          localStorage.removeItem('healthhacked_token');
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false 
          });
        }
      },
    }),
    {
      name: 'healthhacked-auth',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);