"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SiteLayout from "@/components/layout/SiteLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import { loanApi, LoanApplication, LoanDetails } from '@/lib/api/loans';
import { 
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function UserLoans() {
  const router = useRouter();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [activeLoans, setActiveLoans] = useState<LoanDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'applications' | 'loans'>('applications');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [applicationsData, loansData] = await Promise.all([
        loanApi.getMyApplications(),
        loanApi.getMyLoans()
      ]);
      
      setApplications(applicationsData);
      setActiveLoans(loansData.filter(loan => loan.status === 'ACTIVE'));
    } catch (error: any) {
      console.error('Failed to load loan data:', error);
      setError('Failed to load loan data. Please try again.');
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

  if (isLoading) {
    return (
      <AuthGuard>
        <SiteLayout>
          <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading your loan information...</p>
              </div>
            </div>
          </div>
        </SiteLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
    <SiteLayout>
        <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
              My Loans
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Track your loan applications and manage your active loans
            </p>
          </div>

            <div className="mb-8">
              <button
                onClick={() => router.push('/user/apply')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <DocumentTextIcon className="w-5 h-5" />
                Apply for New Loan
              </button>
            </div>

            <div className="mb-8">
              <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('applications')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'applications'
                        ? 'border-cyan-500 text-cyan-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Applications ({applications.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('loans')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'loans'
                        ? 'border-cyan-500 text-cyan-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Active Loans ({activeLoans.length})
                  </button>
                </nav>
              </div>
            </div>

            <div className="space-y-6">
              {activeTab === 'applications' && (
                applications.length === 0 ? (
              <div className="text-center py-12">
                    <DocumentTextIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Applications Yet</h3>
                    <p className="text-slate-600 mb-6">
                      You haven't submitted any loan applications yet.
                    </p>
                    <button
                      onClick={() => router.push('/user/apply')}
                      className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                      Apply for Your First Loan
                    </button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map(app => (
                  <div key={app.id} className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50">
                    <div>
                      <div className="font-semibold text-slate-900">Amount: {formatCurrency(app.amount)}</div>
                      <div className="text-slate-700 text-sm">Purpose: {app.purpose}</div>
                      <div className="text-slate-700 text-sm">Term: {app.term} months</div>
                      <div className="text-slate-700 text-sm">Applied: {new Date(app.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="mt-2 sm:mt-0 flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {app.status === 'ACTIVE' ? 'Active' :
                          app.status === 'REJECTED' ? 'Rejected' :
                          app.status === 'PENDING' ? 'Under Review' :
                          app.status}
                      </span>
                      {app.status === 'REJECTED' && app.rejectionReason && (
                        <span className="text-xs text-red-600 mt-1">Reason: {app.rejectionReason}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

              {activeTab === 'loans' && (
                activeLoans.length === 0 ? (
                  <div className="text-center py-12">
                    <CurrencyDollarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Active Loans</h3>
                    <p className="text-slate-600 mb-6">
                      You don't have any active loans at the moment.
                    </p>
                    <button
                      onClick={() => router.push('/user/apply')}
                      className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                      Apply for a Loan
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeLoans.map(loan => (
                      <div key={loan.id} className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50">
                        <div>
                          <div className="font-semibold text-slate-900">Amount: {formatCurrency(loan.amount)}</div>
                          <div className="text-slate-700 text-sm">Purpose: {loan.purpose}</div>
                          <div className="text-slate-700 text-sm">Term: {loan.term} months</div>
                          <div className="text-slate-700 text-sm">Status: {loan.status}</div>
                          <div className="text-slate-700 text-sm">Applied: {new Date(loan.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="mt-2 sm:mt-0 flex flex-col items-end gap-2">
                          <button
                            onClick={() => router.push(`/user/repayment/${loan.id}`)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CurrencyDollarIcon className="w-4 h-4" />
                            Make Repayment
                          </button>
                          <button
                            onClick={() => router.push(`/user/loans/${loan.id}`)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors"
                          >
                            <EyeIcon className="w-4 h-4" />
                            View Details & History
                          </button>
                          <button
                            onClick={() => router.push(`/user/agreement/${loan.id}`)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <DocumentTextIcon className="w-4 h-4" />
                            Download Agreement
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
    </SiteLayout>
    </AuthGuard>
  );
} 