import { apiClient, setAuthToken, clearAuthToken } from './client';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  RegisterResponse, 
  ProfileResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User
} from '../types/auth';

// Secure token storage - sessionStorage is more secure than localStorage
const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('quickfund-refresh-token');
};

const setRefreshToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('quickfund-refresh-token', token);
  }
};

const clearRefreshToken = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('quickfund-refresh-token');
  }
};

// Authentication API functions
export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // Store access token in memory only (secure)
    setAuthToken(response.data.accessToken);
    
    // Store refresh token in sessionStorage (more secure than localStorage)
    setRefreshToken(response.data.refreshToken);
    
    return response.data;
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', userData);
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ProfileResponse>('/auth/profile');
    return response.data.user;
  },

  // Refresh access token
  refreshToken: async (refreshData?: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken
    });
    
    // Update stored tokens
    setAuthToken(response.data.accessToken);
    setRefreshToken(response.data.refreshToken);
    
    return response.data;
  },

  // Logout user
  logout: async (sessionId?: string): Promise<void> => {
    try {
      // Call logout endpoint to invalidate session
      await apiClient.post('/auth/logout', { sessionId });
    } catch (error) {
      // Even if logout fails, clear local tokens
      console.warn('Logout request failed, but clearing local tokens:', error);
    } finally {
      // Always clear local tokens
      clearAuthToken();
      clearRefreshToken();
    }
  },

  // Validate token (optional - can be used to check if token is still valid)
  validateToken: async (): Promise<boolean> => {
    try {
      await apiClient.get('/auth/profile');
      return true;
    } catch (error) {
      return false;
    }
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', {
      token,
      newPassword
    });
  }
};

// Export individual functions for convenience
export const {
  login,
  register,
  getProfile,
  refreshToken,
  logout,
  validateToken,
  changePassword,
  forgotPassword,
  resetPassword
} = authApi;
