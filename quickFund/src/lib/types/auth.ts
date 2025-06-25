// User roles from backend
export type UserRole = 'USER' | 'ADMIN';

// Employment status
export type EmploymentStatus = 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'STUDENT' | 'RETIRED';

// User profile interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  employmentStatus?: EmploymentStatus;
  employerName?: string;
  monthlyIncome?: number;
  createdAt: string;
  updatedAt: string;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Register request - Updated to match backend DTO exactly
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string; // Made optional to match backend
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  employmentStatus?: EmploymentStatus;
  employerName?: string;
  monthlyIncome?: number;
  agreeToTerms?: boolean; // Made optional to match backend
}

// Authentication response
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType: string;
  user: User;
}

// Register response
export interface RegisterResponse {
  user: User;
  message: string;
}

// Profile response
export interface ProfileResponse {
  user: User;
}

// Refresh token request/response
export interface RefreshTokenRequest {
  refreshToken?: string; // Optional, will use cookie if not provided
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string; // Backend returns new refresh token
  expiresIn: string;
  tokenType: string;
}

// Error response
export interface AuthError {
  message: string;
  status: number;
  code?: string;
  field?: string;
}

// Authentication state
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Form validation errors
export interface ValidationErrors {
  [key: string]: string;
}
