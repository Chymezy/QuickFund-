import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, AuthState, LoginRequest, RegisterRequest } from '../types/auth';
import { authApi } from '../api/auth';
import { setAuthToken, clearAuthToken } from '../api/client';
import { jwtDecode } from 'jwt-decode';
import { getAuthToken } from '../api/client';

// Secure token storage helpers
const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('quickfund-refresh-token');
};

const clearRefreshToken = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('quickfund-refresh-token');
  }
};

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  getProfile: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
  clearSuccess: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  // Success state
  success: string | null;
  sessionId?: string | null;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      success: null,
      sessionId: null,

      // Set loading state
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      // Clear error
      clearError: () => set({ error: null }),

      // Clear success
      clearSuccess: () => set({ success: null }),

      // Set user directly
      setUser: (user: User) => set({ 
        user, 
        isAuthenticated: true, 
        error: null 
      }),

      // Login action
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null, success: null });
        
        try {
          const response = await authApi.login(credentials);
          // Extract sessionId from accessToken
          let sessionId = null;
          try {
            if (response.accessToken) {
              const decoded = jwtDecode<{ sessionId?: string }>(response.accessToken);
              sessionId = decoded.sessionId || undefined;
            }
          } catch (e) {
            console.warn('Failed to decode JWT for sessionId:', e);
          }
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null,
            success: 'Login successful! Welcome back.',
            sessionId
          });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.message || 'Login failed',
            success: null,
            sessionId: null
          });
          throw error;
        }
      },

      // Register action
      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null, success: null });
        
        try {
          const response = await authApi.register(userData);
          set({ 
            user: null, // Don't set user since registration doesn't return tokens
            isAuthenticated: false, // User needs to login separately
            isLoading: false, 
            error: null,
            success: 'Account created successfully! Please sign in to continue.'
          });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.message || 'Registration failed',
            success: null
          });
          throw error;
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true, error: null, success: null });
        const rawSessionId = get().sessionId;
        const sessionId = typeof rawSessionId === 'string' && rawSessionId ? rawSessionId : undefined;
        try {
          await authApi.logout(sessionId);
        } catch (error) {
          console.warn('Logout error:', error);
        } finally {
          // Always clear memory token and sessionStorage
          clearAuthToken();
          clearRefreshToken();
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: null,
            success: 'Logged out successfully. Come back soon!',
            sessionId: null
          });
        }
      },

      // Get user profile
      getProfile: async () => {
        set({ isLoading: true, error: null, success: null });
        
        try {
          const user = await authApi.getProfile();
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null,
            success: null
          });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.message || 'Failed to get profile',
            success: null
          });
          throw error;
        }
      },

      // Initialize auth state - attempt to restore session using refresh token
      initialize: async () => {
        set({ isLoading: true });
        try {
          // Check if we have a refresh token
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            // No refresh token available, user needs to login
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false, 
              error: null,
              success: null
            });
            return;
          }
          // Try to refresh the access token
          const refreshResponse = await authApi.refreshToken();
          // Get user profile to validate session
          const user = await authApi.getProfile();
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null,
            success: null
          });
        } catch (error: any) {
          // Only log a warning if refresh fails, do not treat as a hard error
          console.warn('Session refresh failed or expired:', error?.message || error);
          clearAuthToken();
          clearRefreshToken();
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: null,
            success: null
          });
        }
      },
    }),
    {
      name: 'quickfund-auth', // Storage key
      storage: createJSONStorage(() => {
        // Only persist user data and authentication state, NEVER tokens
        return {
          getItem: (name: string) => {
            try {
              const item = localStorage.getItem(name);
              return item;
            } catch {
              return null;
            }
          },
          setItem: (name: string, value: string) => {
            try {
              localStorage.setItem(name, value);
            } catch (error) {
              console.warn('Failed to persist auth state:', error);
            }
          },
          removeItem: (name: string) => {
            try {
              localStorage.removeItem(name);
            } catch (error) {
              console.warn('Failed to remove auth state:', error);
            }
          }
        };
      }),
      // Only persist user data and authentication state, NEVER tokens
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        error: state.error,
        success: state.success
      })
    }
  )
);

// Selector hooks for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useAuthSuccess = () => useAuthStore((state) => state.success);
