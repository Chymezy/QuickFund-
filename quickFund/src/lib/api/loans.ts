import { apiClient } from './client';

// Types for loan data
export interface LoanApplication {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  term: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';
  notes?: string;
  monthlyIncome?: number;
  employmentStatus?: string;
  employerName?: string;
  rejectionReason?: string;
  approvedDate?: string;
  disbursedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplyLoanRequest {
  amount: number;
  purpose: string;
  term: number;
  notes?: string;
}

export interface LoanDetails extends LoanApplication {
  interestRate: number;
  monthlyPayment: number;
  totalAmount: number;
  remainingBalance: number;
  nextPaymentDate?: string;
  paymentHistory: Payment[];
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  type: 'INSTALLMENT' | 'EARLY_REPAYMENT' | 'LATE_FEE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

export interface LoanStats {
  totalLoans: number;
  activeLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
  outstandingBalance: number;
  nextPaymentAmount: number;
  nextPaymentDate?: string;
}

// Loan API functions
export const loanApi = {
  // Apply for a loan
  applyForLoan: async (data: ApplyLoanRequest): Promise<LoanApplication> => {
    try {
      const response = await apiClient.post('/loans/apply', data);
      return response.data;
    } catch (error) {
      console.error('Failed to apply for loan:', error);
      throw error;
    }
  },

  // Get user's loan applications
  getMyApplications: async (): Promise<LoanApplication[]> => {
    try {
      const response = await apiClient.get('/loans/my-applications');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch loan applications:', error);
      throw error;
    }
  },

  // Get specific loan application
  getApplication: async (id: string): Promise<LoanDetails> => {
    try {
      const response = await apiClient.get(`/loans/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch loan application:', error);
      throw error;
    }
  },

  // Get user's active loans
  getMyLoans: async (): Promise<LoanDetails[]> => {
    try {
      const response = await apiClient.get('/loans/my-loans');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user loans:', error);
      throw error;
    }
  },

  // Get loan statistics
  getLoanStats: async (): Promise<LoanStats> => {
    try {
      const response = await apiClient.get('/loans/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch loan stats:', error);
      throw error;
    }
  },

  // Make a payment
  makePayment: async (loanId: string, amount: number, type: 'INSTALLMENT' | 'EARLY_REPAYMENT' = 'INSTALLMENT'): Promise<Payment> => {
    try {
      const response = await apiClient.post(`/loans/${loanId}/payments`, {
        amount,
        type
      });
      return response.data;
    } catch (error) {
      console.error('Failed to make payment:', error);
      throw error;
    }
  },

  // Get payment history for a loan
  getPaymentHistory: async (loanId: string): Promise<Payment[]> => {
    try {
      const response = await apiClient.get(`/loans/${loanId}/payments`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      throw error;
    }
  },

  // Cancel loan application (if still pending)
  cancelApplication: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/loans/applications/${id}`);
    } catch (error) {
      console.error('Failed to cancel application:', error);
      throw error;
    }
  },

  // Request early repayment
  requestEarlyRepayment: async (loanId: string): Promise<{ totalAmount: number; discount: number }> => {
    try {
      const response = await apiClient.post(`/loans/${loanId}/early-repayment`);
      return response.data;
    } catch (error) {
      console.error('Failed to request early repayment:', error);
      throw error;
    }
  },

  // Get loan agreement
  getLoanAgreement: async (loanId: string): Promise<{ agreement: string; terms: string[] }> => {
    try {
      const response = await apiClient.get(`/loans/${loanId}/agreement`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch loan agreement:', error);
      throw error;
    }
  },

  // Accept loan agreement
  acceptLoanAgreement: async (loanId: string): Promise<void> => {
    try {
      await apiClient.post(`/loans/${loanId}/accept-agreement`);
    } catch (error) {
      console.error('Failed to accept loan agreement:', error);
      throw error;
    }
  }
}; 