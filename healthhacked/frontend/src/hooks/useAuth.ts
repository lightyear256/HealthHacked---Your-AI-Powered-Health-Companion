

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  profile: {
    name: string;
    age?: number;
    gender?: string;
    timezone?: string;
  };
  preferences: {
    notificationTime: string;
    followUpFrequency: number;
    emailNotifications: boolean;
  };
  lastActive: string;
  activeHealthContexts?: any[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasInitialized: false,

      initialize: () => {
        const state = get();
        if (!state.hasInitialized && state.token) {
          console.log('🔄 Initializing auth store with existing token');
          set({ hasInitialized: true });
          // Don't auto-refresh on initialize to prevent loops
        } else {
          set({ hasInitialized: true });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('🔑 Attempting login with:', { email });
          
          const response = await authAPI.login(email, password);
          console.log('✅ Login response:', response);
          
          if (response.success) {
            const { user, token } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              hasInitialized: true
            });
            
            toast.success(`Welcome back, ${user.profile.name}!`);
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error: any) {
          console.error('❌ Login error:', error);
          
          const errorMessage = error.response?.data?.error || error.message || 'Login failed';
          
          set({ 
            isLoading: false, 
            error: errorMessage,
            user: null,
            token: null,
            isAuthenticated: false
          });
          
          throw new Error(errorMessage);
        }
      },

      register: async (userData: { name: string; email: string; password: string }) => {
        set({ isLoading: true, error: null });
        try {
          console.log('📝 Attempting registration with:', { 
            name: userData.name, 
            email: userData.email 
          });
          
          const response = await authAPI.register(userData);
          console.log('✅ Registration response:', response);
          
          if (response.success) {
            const { user, token } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              hasInitialized: true
            });
            
            toast.success(`Welcome to HealthHacked, ${user.profile.name}!`);
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error: any) {
          console.error('❌ Registration error:', error);
          
          const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
          
          set({ 
            isLoading: false, 
            error: errorMessage,
            user: null,
            token: null,
            isAuthenticated: false
          });
          
          throw new Error(errorMessage);
        }
      },

      logout: () => {
        console.log('👋 Logging out user');
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          hasInitialized: true
        });
        
        toast.success('Logged out successfully');
      },

      updateProfile: async (profileData: any) => {
        set({ isLoading: true, error: null });
        try {
          console.log('📝 Updating profile:', profileData);
          
          const response = await authAPI.updateProfile(profileData);
          
          if (response.success) {
            const updatedUser = response.data.user;
            
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            set({
              user: updatedUser,
              isLoading: false,
              error: null
            });
            
            toast.success('Profile updated successfully');
          } else {
            throw new Error(response.message || 'Profile update failed');
          }
        } catch (error: any) {
          console.error('❌ Profile update error:', error);
          
          const errorMessage = error.response?.data?.error || error.message || 'Profile update failed';
          
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          
          throw new Error(errorMessage);
        }
      },

      refreshUser: async () => {
        const { token, isLoading } = get();
        
        // Prevent multiple concurrent refresh calls
        if (!token || isLoading) {
          console.log('❌ Skipping refresh - no token or already loading');
          return;
        }

        try {
          console.log('🔄 Refreshing user data (manual call only)');
          
          set({ isLoading: true });
          const response = await authAPI.me();
          
          if (response.success) {
            const user = response.data.user;
            localStorage.setItem('user', JSON.stringify(user));
            
            set({ 
              user, 
              error: null,
              isLoading: false 
            });
            console.log('✅ User data refreshed');
          }
        } catch (error: any) {
          console.error('❌ Refresh user error:', error);
          
          // If refresh fails with 401, logout
          if (error.response?.status === 401) {
            console.log('🔓 Token expired, logging out');
            get().logout();
          } else {
            set({ isLoading: false });
          }
        }
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Only initialize, don't auto-refresh to prevent loops
        if (state) {
          state.initialize?.();
        }
      }
    }
  )
);