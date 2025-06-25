"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SiteLayout from "@/components/layout/SiteLayout";
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { adminApi } from '@/lib/api/admin';
import { formatCurrency, formatDate, getStatusConfig } from '@/lib/loanHelpers';

export default function ApplicationReview() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.loanId as string;
  
  const [loan, setLoan] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    const fetchLoan = async () => {
      setLoading(true);
      setError(null);
      try {
        const [loanResponse, paymentsResponse] = await Promise.all([
          adminApi.getApplication(loanId),
          adminApi.getLoanPaymentHistory(loanId, { limit: 50 })
        ]);
        setLoan(loanResponse);
        setPayments(paymentsResponse.payments || []);
      } catch (err: any) {
        console.error('Failed to fetch loan:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load loan application.');
      } finally {
        setLoading(false);
      }
    };

    if (loanId) {
      fetchLoan();
    }
  }, [loanId]);

  const handleApprove = async () => {
    setIsProcessing(true);
    setActionType('approve');
    
    try {
      await adminApi.approveLoan(loanId);
      setShowSuccess(true);
    } catch (err: any) {
      console.error('Failed to approve loan:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to approve loan.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    setActionType('reject');
    
    try {
      await adminApi.rejectLoan(loanId, rejectionReason);
      setShowRejectModal(false);
      setShowSuccess(true);
    } catch (err: any) {
      console.error('Failed to reject loan:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to reject loan.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToApplications = () => {
    router.push('/admin/applications');
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading application...</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (error) {
    return (
      <SiteLayout>
        <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Application</h1>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={handleBackToApplications}
              className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Back to Applications
            </button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (!loan) {
    return (
      <SiteLayout>
        <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Application Not Found</h1>
            <p className="text-slate-600">The loan application you're looking for doesn't exist.</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (showSuccess) {
    return (
      <SiteLayout>
        <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12">
              {actionType === 'approve' ? (
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-6" />
              ) : (
                <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-6" />
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                {actionType === 'approve' ? 'Application Approved!' : 'Application Rejected'}
              </h1>
              <p className="text-slate-600 mb-8">
                {actionType === 'approve' 
                  ? `Loan application ${loan.id} has been approved successfully.`
                  : `Loan application ${loan.id} has been rejected.`
                }
              </p>
              <div className="space-y-4">
                <button
                  onClick={handleBackToApplications}
                  className="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Back to Applications
                </button>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="w-full px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Review Another Application
                </button>
              </div>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  const status = getStatusConfig(loan.status);

  return (
    <SiteLayout>
      <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <button
              onClick={handleBackToApplications}
              className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-4 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Applications
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
                  Review Application
                </h1>
                <p className="text-sm sm:text-base text-slate-600">
                  Application ID: {loan.id}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                  {status.icon && <status.icon className="w-4 h-4" />}
                  {status.label}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Loan Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <DocumentTextIcon className="w-6 h-6 text-cyan-600" />
                  Loan Details
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
                    <p className="text-slate-600 text-sm">Loan Term</p>
                    <p className="text-lg font-semibold text-slate-900">{loan.term} months</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Interest Rate</p>
                    <p className="text-lg font-semibold text-slate-900">{loan.interestRate}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Applied Date</p>
                    <p className="text-lg font-semibold text-slate-900">{formatDate(loan.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Monthly Payment</p>
                    <p className="text-lg font-semibold text-slate-900">{formatCurrency(loan.monthlyPayment!)}</p>
                  </div>
                </div>
              </div>

              {/* Applicant Information */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <UserIcon className="w-6 h-6 text-cyan-600" />
                  Applicant Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-slate-600 text-sm">Full Name</p>
                    <p className="text-lg font-semibold text-slate-900">{loan.user.firstName} {loan.user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Email</p>
                    <p className="text-lg font-semibold text-slate-900">{loan.user.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Phone</p>
                    <p className="text-lg font-semibold text-slate-900">{loan.user.phone}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Date of Birth</p>
                    <p className="text-lg font-semibold text-slate-900">{loan.user.dateOfBirth}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-slate-600 text-sm">Address</p>
                    <p className="text-lg font-semibold text-slate-900">{loan.user.address}</p>
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <BuildingOfficeIcon className="w-6 h-6 text-cyan-600" />
                  Employment Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-slate-600 text-sm">Employer</p>
                    <p className="text-lg font-semibold text-slate-900">{loan.employerName}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Position</p>
                    <p className="text-lg font-semibold text-slate-900">{loan.position}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Monthly Income</p>
                    <p className="text-lg font-semibold text-slate-900">{formatCurrency(loan.monthlyIncome)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Employment Duration</p>
                    <p className="text-lg font-semibold text-slate-900">{loan.employmentDuration}</p>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {loan.status === 'ACTIVE' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <CurrencyDollarIcon className="w-6 h-6 text-cyan-600" />
                    Payment History
                  </h2>
                  {payments.length === 0 ? (
                    <div className="text-center py-8">
                      <CurrencyDollarIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">No payments made yet for this loan.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-50 rounded-lg p-4">
                          <p className="text-slate-600 text-sm">Total Paid</p>
                          <p className="text-xl font-bold text-slate-900">
                            {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                          <p className="text-slate-600 text-sm">Payments Made</p>
                          <p className="text-xl font-bold text-slate-900">{payments.length}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                          <p className="text-slate-600 text-sm">Remaining Balance</p>
                          <p className="text-xl font-bold text-slate-900">
                            {formatCurrency((loan.amount || 0) - payments.reduce((sum, p) => sum + p.amount, 0))}
                          </p>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-slate-600 border-b border-slate-200">
                              <th className="px-4 py-3 text-left">Date</th>
                              <th className="px-4 py-3 text-left">Amount</th>
                              <th className="px-4 py-3 text-left">Type</th>
                              <th className="px-4 py-3 text-left">Status</th>
                              <th className="px-4 py-3 text-left">Method</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payments.map((payment) => (
                              <tr key={payment.id} className="border-b border-slate-100">
                                <td className="px-4 py-3">{formatDate(payment.paidAt || payment.dueDate)}</td>
                                <td className="px-4 py-3 font-semibold">{formatCurrency(payment.amount)}</td>
                                <td className="px-4 py-3">{payment.type.replace('_', ' ')}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                    payment.status === 'COMPLETED' ? 'bg-green-50 text-green-600' :
                                    payment.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' :
                                    'bg-red-50 text-red-600'
                                  }`}>
                                    {payment.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3">{payment.paymentMethod || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar - Actions */}
            <div className="space-y-6">
              {/* Action Buttons */}
              {loan.status === 'PENDING' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Review Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isProcessing && actionType === 'approve' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-5 h-5" />
                          Approve Loan
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={isProcessing}
                      className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircleIcon className="w-5 h-5" />
                      Reject Loan
                    </button>
                  </div>
                </div>
              )}

              {/* Application Status */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Application Status</h3>
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
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Reject Application</h3>
            <p className="text-slate-600 mb-4">Please provide a reason for rejecting this loan application.</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors resize-none"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
} 