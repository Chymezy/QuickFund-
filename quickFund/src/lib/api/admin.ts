import { apiClient } from './client';

// Types for admin data
export interface LoanApplication {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  amount: number;
  purpose: string;
  term: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';
  monthlyIncome?: number;
  employmentStatus?: string;
  employerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  loanId: string;
  userId?: string;
  amount: number;
  type: 'INSTALLMENT' | 'EARLY_REPAYMENT' | 'LATE_FEE' | 'LOAN_REPAYMENT';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'PROCESSING' | 'CANCELLED';
  reference?: string;
  gateway?: string;
  gatewayRef?: string;
  processedAt?: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  loan?: {
    id: string;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  isVerified: boolean;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  employmentStatus?: string;
  employerName?: string;
  monthlyIncome?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalLoans: number;
  totalAmount: number;
  pendingApplications: number;
  activeLoans: number;
  completedLoans: number;
  totalPayments: number;
  monthlyRevenue: number;
}

export interface ExportData {
  applications?: LoanApplication[];
  payments?: Payment[];
  users?: User[];
}

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

const getCacheKey = (endpoint: string, params?: Record<string, any>) => {
  const paramString = params ? JSON.stringify(params) : '';
  return `${endpoint}${paramString}`;
};

const isCacheValid = (timestamp: number) => {
  return Date.now() - timestamp < CACHE_DURATION;
};

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const clearCache = (pattern?: string) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};

// Admin API functions with caching
export const adminApi = {
  // Dashboard Statistics
  getStats: async (): Promise<AdminStats> => {
    const cacheKey = getCacheKey('admin/stats');
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiClient.get('/admin/stats');
      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      throw error;
    }
  },

  // Loan Applications
  getApplications: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ applications: LoanApplication[]; total: number; page: number; limit: number }> => {
    const cacheKey = getCacheKey('admin/applications', params);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiClient.get('/admin/applications', { params });
      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      throw error;
    }
  },

  getApplication: async (id: string): Promise<LoanApplication> => {
    const cacheKey = getCacheKey(`admin/applications/${id}`);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiClient.get(`/admin/applications/${id}`);
      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch application:', error);
      throw error;
    }
  },

  updateApplicationStatus: async (id: string, status: string, notes?: string): Promise<LoanApplication> => {
    try {
      const response = await apiClient.patch(`/admin/applications/${id}`, { status, notes });
      // Clear related caches
      clearCache('admin/applications');
      clearCache('admin/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to update application status:', error);
      throw error;
    }
  },

  // Loan approval/rejection
  approveLoan: async (id: string, approvedAmount?: number): Promise<LoanApplication> => {
    try {
      const response = await apiClient.patch(`/admin/applications/${id}`, { 
        status: 'APPROVED',
        notes: approvedAmount ? `Approved amount: ${approvedAmount}` : undefined
      });
      // Clear related caches
      clearCache('admin/applications');
      clearCache('admin/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to approve loan:', error);
      throw error;
    }
  },

  rejectLoan: async (id: string, reason: string): Promise<LoanApplication> => {
    try {
      const response = await apiClient.patch(`/admin/applications/${id}`, { 
        status: 'REJECTED',
        notes: reason
      });
      // Clear related caches
      clearCache('admin/applications');
      clearCache('admin/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to reject loan:', error);
      throw error;
    }
  },

  // Users Management
  getUsers: async (params?: {
    role?: string;
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<{ users: User[]; total: number; page: number; limit: number }> => {
    const cacheKey = getCacheKey('admin/users', params);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiClient.get('/admin/users', { params });
      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },

  getUser: async (id: string): Promise<User> => {
    const cacheKey = getCacheKey(`admin/users/${id}`);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiClient.get(`/admin/users/${id}`);
      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.patch(`/admin/users/${id}`, data);
      // Clear related caches
      clearCache('admin/users');
      clearCache(`admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  deactivateUser: async (id: string): Promise<User> => {
    try {
      const response = await apiClient.patch(`/admin/users/${id}/deactivate`);
      // Clear related caches
      clearCache('admin/users');
      clearCache(`admin/users/${id}`);
      clearCache('admin/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      throw error;
    }
  },

  // Payments Management
  getPayments: async (params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ payments: Payment[]; total: number; page: number; limit: number }> => {
    const cacheKey = getCacheKey('admin/payments', params);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiClient.get('/admin/payments', { params });
      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      throw error;
    }
  },

  getPayment: async (id: string): Promise<Payment> => {
    const cacheKey = getCacheKey(`admin/payments/${id}`);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiClient.get(`/admin/payments/${id}`);
      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch payment:', error);
      throw error;
    }
  },

  getLoanPaymentHistory: async (loanId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ payments: Payment[]; pagination: { page: number; total: number; totalPages: number } }> => {
    const cacheKey = getCacheKey(`admin/loans/${loanId}/payments`, params);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiClient.get(`/admin/loans/${loanId}/payments`, { params });
      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch loan payment history:', error);
      throw error;
    }
  },

  // Data Export
  exportData: async (type: 'applications' | 'payments' | 'users', params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    format?: 'csv' | 'json';
  }): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/admin/export/${type}`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  },

  // Cache Management
  clearCache: (pattern?: string) => {
    clearCache(pattern);
  },

  // Bulk Operations
  bulkUpdateApplications: async (ids: string[], status: string, notes?: string): Promise<{ updated: number; failed: number }> => {
    try {
      const response = await apiClient.patch('/admin/applications/bulk', {
        ids,
        status,
        notes
      });
      // Clear related caches
      clearCache('admin/applications');
      clearCache('admin/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to bulk update applications:', error);
      throw error;
    }
  },

  // System Health
  getSystemHealth: async (): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    services: Record<string, { status: string; responseTime: number }>;
    database: { status: string; connections: number };
  }> => {
    try {
      const response = await apiClient.get('/admin/health');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      throw error;
    }
  }
};

// Admin Loans API (for backward compatibility)
export const adminLoansApi = {
  getAllLoans: async (params?: { limit?: number; status?: string }): Promise<{ loans: LoanApplication[] }> => {
    try {
      const response = await adminApi.getApplications(params);
      return { loans: response.applications };
    } catch (error) {
      console.error('Failed to fetch all loans:', error);
      // Return mock data for now
      return { loans: [] };
    }
  },

  getLoanStatistics: async (): Promise<any> => {
    try {
      const response = await adminApi.getStats();
      return {
        totalLoans: response.totalLoans,
        pendingLoans: response.pendingApplications,
        approvedLoans: response.activeLoans,
        rejectedLoans: response.totalLoans - response.pendingApplications - response.activeLoans
      };
    } catch (error) {
      console.error('Failed to fetch loan statistics:', error);
      // Return mock data for now
      return {
        totalLoans: 0,
        pendingLoans: 0,
        approvedLoans: 0,
        rejectedLoans: 0
      };
    }
  },

  approveLoan: async (id: string, approvedAmount?: number): Promise<LoanApplication> => {
    return adminApi.approveLoan(id, approvedAmount);
  },

  rejectLoan: async (id: string, reason: string): Promise<LoanApplication> => {
    return adminApi.rejectLoan(id, reason);
  }
}; 