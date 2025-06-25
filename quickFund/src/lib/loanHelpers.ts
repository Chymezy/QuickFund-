import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon
} from '@heroicons/react/24/outline';

// Types
export interface Loan {
  id: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'active';
  appliedDate: string;
  approvedDate: string | null;
  disbursedDate: string | null;
  term: string;
  interestRate: string;
  monthlyPayment: number | null;
  remainingBalance: number | null;
  nextPaymentDate: string | null;
  rejectionReason?: string;
}

export interface StatusConfig {
  label: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
}

// Mock data - replace with actual API calls
export const mockLoans: Loan[] = [
  {
    id: 'LOAN-001',
    amount: 2500000,
    purpose: 'Business Expansion',
    status: 'approved',
    appliedDate: '2024-01-15',
    approvedDate: '2024-01-17',
    disbursedDate: '2024-01-18',
    term: '24 months',
    interestRate: '18%',
    monthlyPayment: 125000,
    remainingBalance: 2250000,
    nextPaymentDate: '2024-02-18'
  },
  {
    id: 'LOAN-002',
    amount: 1000000,
    purpose: 'Personal Expenses',
    status: 'pending',
    appliedDate: '2024-01-20',
    approvedDate: null,
    disbursedDate: null,
    term: '12 months',
    interestRate: '20%',
    monthlyPayment: 92000,
    remainingBalance: null,
    nextPaymentDate: null
  },
  {
    id: 'LOAN-003',
    amount: 500000,
    purpose: 'Education',
    status: 'rejected',
    appliedDate: '2024-01-10',
    approvedDate: null,
    disbursedDate: null,
    term: '18 months',
    interestRate: '22%',
    monthlyPayment: 35000,
    remainingBalance: null,
    nextPaymentDate: null,
    rejectionReason: 'Insufficient income documentation'
  },
  {
    id: 'LOAN-004',
    amount: 3000000,
    purpose: 'Home Improvement',
    status: 'active',
    appliedDate: '2023-11-15',
    approvedDate: '2023-11-17',
    disbursedDate: '2023-11-18',
    term: '36 months',
    interestRate: '16%',
    monthlyPayment: 105000,
    remainingBalance: 2100000,
    nextPaymentDate: '2024-02-18'
  },
  {
    id: 'LOAN-005',
    amount: 1500000,
    purpose: 'Vehicle Purchase',
    status: 'active',
    appliedDate: '2023-10-20',
    approvedDate: '2023-10-22',
    disbursedDate: '2023-10-23',
    term: '48 months',
    interestRate: '19%',
    monthlyPayment: 45000,
    remainingBalance: 1200000,
    nextPaymentDate: '2024-02-23'
  },
  {
    id: 'LOAN-006',
    amount: 800000,
    purpose: 'Medical Expenses',
    status: 'pending',
    appliedDate: '2024-01-25',
    approvedDate: null,
    disbursedDate: null,
    term: '15 months',
    interestRate: '21%',
    monthlyPayment: 65000,
    remainingBalance: null,
    nextPaymentDate: null
  }
];

export const statusConfig: Record<string, StatusConfig> = {
  pending: {
    label: 'Under Review',
    icon: ClockIcon,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  rejected: {
    label: 'Rejected',
    icon: XCircleIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  active: {
    label: 'Active',
    icon: CheckCircleIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  }
};

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getStatusConfig = (status: string): StatusConfig => {
  return statusConfig[status] || statusConfig.pending;
};

export const filterLoansByStatus = (loans: Loan[], status: string): Loan[] => {
  if (status === 'all') return loans;
  return loans.filter(loan => loan.status === status);
};

export const getLoanStats = (loans: Loan[]) => {
  return {
    total: loans.length,
    active: loans.filter(loan => loan.status === 'active').length,
    pending: loans.filter(loan => loan.status === 'pending').length,
    totalBorrowed: loans
      .filter(loan => loan.status === 'active')
      .reduce((sum, loan) => sum + loan.amount, 0)
  };
}; 