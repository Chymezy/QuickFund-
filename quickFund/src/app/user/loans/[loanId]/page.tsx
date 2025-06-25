"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import { loanApi, LoanDetails } from '@/lib/api/loans';
import { paymentApi } from '@/lib/api/payments';
// Use the Payment type from loanApi for paymentHistory
type LoanPayment = LoanDetails['paymentHistory'][number];
import { 
  DocumentTextIcon, 
  CurrencyDollarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CreditCardIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

export default function LoanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.loanId as string;

  const [loan, setLoan] = useState<LoanDetails | null>(null);
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStats, setPaymentStats] = useState({
    totalPaid: 0,
    remainingBalance: 0,
    paymentsCount: 0,
    nextPaymentDue: 0
  });

  useEffect(() => {
    if (loanId) {
      loadLoan();
    }
    // eslint-disable-next-line
  }, [loanId]);

  const loadLoan = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [loanData, paymentHistory] = await Promise.all([
        loanApi.getApplication(loanId),
        paymentApi.getPaymentHistory(loanId, { limit: 50 })
      ]);
      
      setLoan(loanData);
      setPayments(paymentHistory.payments || loanData.paymentHistory || []);
      
      // Calculate payment statistics
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const remainingBalance = Math.max(0, (loanData.totalAmount || loanData.amount) - totalPaid);
      const nextPaymentDue = loanData.monthlyPayment || 0;
      
      setPaymentStats({
        totalPaid,
        remainingBalance,
        paymentsCount: payments.length,
        nextPaymentDue
      });
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
        error.message ||
        'Failed to load loan details.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <SiteLayout>
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading loan details...</p>
          </div>
        </SiteLayout>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <SiteLayout>
          <div className="py-16 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Error</h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={loadLoan}
              className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </SiteLayout>
      </AuthGuard>
    );
  }

  if (!loan) {
    return null;
  }

  // Status config
  const statusConfig = {
    PENDING: { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: ClockIcon },
    APPROVED: { label: 'Approved', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircleIcon },
    REJECTED: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50', icon: XCircleIcon },
    ACTIVE: { label: 'Active', color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircleIcon },
    COMPLETED: { label: 'Completed', color: 'text-gray-600', bg: 'bg-gray-50', icon: CheckCircleIcon },
  };
  const status = statusConfig[loan.status as keyof typeof statusConfig] || statusConfig.PENDING;

  return (
    <AuthGuard>
      <SiteLayout>
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <button
              onClick={() => router.push('/user/loans')}
              className="text-cyan-600 hover:text-cyan-700 text-sm font-medium flex items-center gap-1"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Loans
            </button>
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
              <status.icon className="w-4 h-4" />
              {status.label}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-6">Loan Details</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Loan Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <DocumentTextIcon className="w-6 h-6 text-cyan-600" />
                  Loan Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-slate-600 text-sm">Loan Amount</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(loan.amount)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Purpose</p>
                    <p className="text-lg font-semibold text-slate-900">{loan.purpose}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Term</p>
                    <p className="text-lg font-semibold text-slate-900">{loan.term} months</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Interest Rate</p>
                    <p className="text-lg font-semibold text-slate-900">{loan.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Monthly Payment</p>
                    <p className="text-lg font-semibold text-slate-900">{formatCurrency(loan.monthlyPayment)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Total Amount</p>
                    <p className="text-lg font-semibold text-slate-900">{formatCurrency(loan.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Applied</p>
                    <p className="text-lg font-semibold text-slate-900">{formatDate(loan.createdAt)}</p>
                  </div>
                  {loan.approvedDate && (
                    <div>
                      <p className="text-slate-600 text-sm">Approved</p>
                      <p className="text-lg font-semibold text-slate-900">{formatDate(loan.approvedDate)}</p>
                    </div>
                  )}
                  {loan.disbursedDate && (
                    <div>
                      <p className="text-slate-600 text-sm">Disbursed</p>
                      <p className="text-lg font-semibold text-slate-900">{formatDate(loan.disbursedDate)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment History */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CurrencyDollarIcon className="w-6 h-6 text-cyan-600" />
                  Payment History
                </h2>
                {payments.length === 0 ? (
                  <div className="text-center py-8">
                    <CurrencyDollarIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">No payments made yet for this loan.</p>
                    {loan.status === 'ACTIVE' && (
                      <button
                        onClick={() => router.push(`/user/repayment/${loan.id}`)}
                        className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
                      >
                        Make Your First Payment
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-slate-600 border-b border-slate-200">
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left">Amount</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Reference</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((p) => (
                            <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-medium">{formatDate(p.paidAt || p.dueDate)}</div>
                                  <div className="text-xs text-slate-500">
                                    {formatDateTime(p.paidAt || p.dueDate)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-semibold">{formatCurrency(p.amount)}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  p.type === 'INSTALLMENT' ? 'bg-blue-50 text-blue-600' :
                                  p.type === 'EARLY_REPAYMENT' ? 'bg-green-50 text-green-600' :
                                  'bg-orange-50 text-orange-600'
                                }`}>
                                  {p.type === 'INSTALLMENT' && <CalendarIcon className="w-3 h-3" />}
                                  {p.type === 'EARLY_REPAYMENT' && <CreditCardIcon className="w-3 h-3" />}
                                  {p.type === 'LATE_FEE' && <ExclamationTriangleIcon className="w-3 h-3" />}
                                  {p.type.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  p.status === 'COMPLETED' ? 'bg-green-50 text-green-600' :
                                  p.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' :
                                  'bg-red-50 text-red-600'
                                }`}>
                                  {p.status === 'COMPLETED' && <CheckCircleIcon className="w-3 h-3" />}
                                  {p.status === 'PENDING' && <ClockIcon className="w-3 h-3" />}
                                  {p.status === 'FAILED' && <XCircleIcon className="w-3 h-3" />}
                                  {p.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-mono text-xs text-slate-600">{p.type || 'N/A'}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BanknotesIcon className="w-5 h-5 text-cyan-600" />
                  Payment Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Paid:</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(paymentStats.totalPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Remaining Balance:</span>
                    <span className={`font-semibold ${paymentStats.remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(paymentStats.remainingBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Payments Made:</span>
                    <span className="font-semibold text-slate-900">{paymentStats.paymentsCount}</span>
                  </div>
                  {loan.status === 'ACTIVE' && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Next Payment:</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(paymentStats.nextPaymentDue)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Actions */}
              {loan.status === 'ACTIVE' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push(`/user/repayment/${loan.id}`)}
                      className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CurrencyDollarIcon className="w-5 h-5" />
                      Make Payment
                    </button>
                    <button
                      onClick={() => router.push(`/user/agreement/${loan.id}`)}
                      className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <DocumentTextIcon className="w-5 h-5" />
                      View Agreement
                    </button>
                  </div>
                </div>
              )}

              {/* Loan Status */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Loan Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    <span className={`font-semibold ${status.color}`}>{status.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Applied:</span>
                    <span className="font-semibold text-slate-900">{formatDate(loan.createdAt)}</span>
                  </div>
                  {loan.updatedAt && loan.updatedAt !== loan.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Last Updated:</span>
                      <span className="font-semibold text-slate-900">{formatDate(loan.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SiteLayout>
    </AuthGuard>
  );
} 