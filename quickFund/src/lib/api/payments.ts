import { apiClient } from './client';

// Types for payment data
export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  type: 'INSTALLMENT' | 'EARLY_REPAYMENT' | 'LATE_FEE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequest {
  amount: number;
  type?: 'INSTALLMENT' | 'EARLY_REPAYMENT';
  paymentMethod?: string;
  notes?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  virtualAccountNumber?: string;
}

export interface PaymentResponse {
  payment: Payment;
  transactionId: string;
  nextPaymentDate?: string;
  remainingBalance: number;
}

export interface PaymentHistory {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
}

// Payment API functions
export const paymentApi = {
  // Make a payment for a loan
  makePayment: async (loanId: string, data: PaymentRequest): Promise<PaymentResponse> => {
    try {
      const response = await apiClient.post('/payments/repay', {
        loanId,
        amount: data.amount,
        type: 'LOAN_REPAYMENT',
        paymentMethod: data.paymentMethod?.toLowerCase() || 'card',
        notes: data.notes,
        // Include card details if provided
        ...(data.cardNumber && { cardNumber: data.cardNumber }),
        ...(data.expiry && { expiry: data.expiry }),
        ...(data.cvv && { cvv: data.cvv }),
        // Include virtual account details if provided
        ...(data.virtualAccountNumber && { virtualAccountNumber: data.virtualAccountNumber }),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to make payment:', error);
      throw error;
    }
  },

  // Get payment history for a loan
  getPaymentHistory: async (loanId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaymentHistory> => {
    try {
      const response = await apiClient.get(`/payments/loan/${loanId}/payments`, { params });
      return {
        payments: response.data.payments || [],
        total: response.data.pagination?.total || 0,
        page: response.data.pagination?.page || 1,
        limit: response.data.pagination?.limit || 10
      };
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      throw error;
    }
  },

  // Get all user payments
  getMyPayments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<PaymentHistory> => {
    try {
      const response = await apiClient.get('/payments/my-payments', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user payments:', error);
      throw error;
    }
  },

  // Get specific payment details
  getPayment: async (paymentId: string): Promise<Payment> => {
    try {
      const response = await apiClient.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch payment:', error);
      throw error;
    }
  },

  // Request payment receipt
  getPaymentReceipt: async (paymentId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/payments/${paymentId}/receipt`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch payment receipt:', error);
      throw error;
    }
  },

  // Cancel a pending payment
  cancelPayment: async (paymentId: string): Promise<void> => {
    try {
      await apiClient.delete(`/payments/${paymentId}`);
    } catch (error) {
      console.error('Failed to cancel payment:', error);
      throw error;
    }
  },

  // Get payment methods
  getPaymentMethods: async (): Promise<{
    methods: Array<{
      id: string;
      type: 'BANK_TRANSFER' | 'CARD' | 'WALLET';
      name: string;
      isDefault: boolean;
    }>;
  }> => {
    try {
      const response = await apiClient.get('/payments/methods');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      throw error;
    }
  },

  // Add payment method
  addPaymentMethod: async (data: {
    type: 'BANK_TRANSFER' | 'CARD' | 'WALLET';
    details: any;
  }): Promise<{ id: string; type: string; name: string }> => {
    try {
      const response = await apiClient.post('/payments/methods', data);
      return response.data;
    } catch (error) {
      console.error('Failed to add payment method:', error);
      throw error;
    }
  },

  // Remove payment method
  removePaymentMethod: async (methodId: string): Promise<void> => {
    try {
      await apiClient.delete(`/payments/methods/${methodId}`);
    } catch (error) {
      console.error('Failed to remove payment method:', error);
      throw error;
    }
  }
}; 