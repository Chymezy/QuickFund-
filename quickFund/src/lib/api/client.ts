import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Environment-aware API URL configuration
const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
};

// Secure token management - memory only for access tokens
class SecureTokenManager {
  private static instance: SecureTokenManager;
  private accessToken: string | null = null;

  private constructor() {}

  static getInstance(): SecureTokenManager {
    if (!SecureTokenManager.instance) {
      SecureTokenManager.instance = new SecureTokenManager();
    }
    return SecureTokenManager.instance;
  }

  setToken(token: string): void {
    this.accessToken = token;
  }

  getToken(): string | null {
    return this.accessToken;
  }

  clearToken(): void {
    this.accessToken = null;
  }
}

const tokenManager = SecureTokenManager.getInstance();

// Create axios instance with base configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: getApiUrl(),
    timeout: 10000, // 10 seconds
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Essential for cookies and CORS
  });

  // Request interceptor - Add auth token from memory
  client.interceptors.request.use(
    (config) => {
      const token = tokenManager.getToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle errors and token refresh
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 Unauthorized - attempt token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Import authApi here to avoid circular dependency
          const { authApi } = await import('./auth');
          
          // Attempt to refresh token using stored refresh token
          const refreshResponse = await authApi.refreshToken();
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.accessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear tokens only, do not hard redirect
          tokenManager.clearToken();
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('quickfund-refresh-token');
            // Do not redirect here; let app handle it
          }
          return Promise.reject(refreshError);
        }
      }

      // Handle other errors
      return Promise.reject(error);
    }
  );

  return client;
};

// Export singleton instance
export const apiClient = createApiClient();

// Secure utility functions
export const setAuthToken = (token: string) => {
  tokenManager.setToken(token);
};

export const clearAuthToken = () => {
  tokenManager.clearToken();
};

export const getAuthToken = () => {
  return tokenManager.getToken();
};

// Type-safe API response wrapper
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Export types for use in other modules
export type { AxiosInstance, AxiosRequestConfig, AxiosResponse };
