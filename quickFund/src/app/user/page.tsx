"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { loanApi, LoanStats } from '@/lib/api/loans';
import SuccessModal from '@/components/ui/SuccessModal';
import Breadcrumb from '@/components/ui/Breadcrumb';
import AuthGuard from '@/components/auth/AuthGuard';
import SiteLayout from "@/components/layout/SiteLayout";
import { 
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowRightIcon,
  UserIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function UserDashboard() {
  const router = useRouter();
  const { user, success, clearSuccess } = useAuthStore();
  const [stats, setStats] = useState<LoanStats | null>(null);
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Show success modal when there's a success message
  useEffect(() => {
    if (success && !showSuccessModal) {
      setShowSuccessModal(true);
    }
  }, [success, showSuccessModal]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [statsData, loansData] = await Promise.all([
        loanApi.getLoanStats(),
        loanApi.getMyLoans()
      ]);
      
      setStats(statsData);
      setRecentLoans(loansData.slice(0, 3)); // Show 3 most recent loans
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to load dashboard data. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    clearSuccess();
    setShowSuccessModal(false);
  };

  const quickActions = [
    {
      title: 'Apply for Loan',
      description: 'Submit a new loan application',
      href: '/user/apply',
      icon: DocumentTextIcon,
      color: 'bg-cyan-600 hover:bg-cyan-700'
    },
    {
      title: 'View My Loans',
      description: 'Check your loan status and history',
      href: '/user/loans',
      icon: CurrencyDollarIcon,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Make Payment',
      description: 'Pay your loan installments',
      href: '/user/loans',
      icon: ClockIcon,
      color: 'bg-blue-600 hover:bg-blue-700'
    }
  ];

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

  if (isLoading) {
    return (
      <AuthGuard>
        <SiteLayout>
          <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading your dashboard...</p>
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
          {/* Header */}
          <div className="mb-8 sm:mb-12">
              <Breadcrumb items={[{ label: 'Dashboard', href: '/user' }]} />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                    Welcome back, {user?.firstName}!
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
                    Here's an overview of your QuickFund account
            </p>
          </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Account Verified</span>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 sm:mb-12">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                      <p className="text-slate-600 text-sm">Total Loans</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.totalLoans}</p>
                    </div>
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="w-6 h-6 text-cyan-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">Active Loans</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.activeLoans}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">Total Borrowed</p>
                      <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalBorrowed)}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">Outstanding Balance</p>
                      <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.outstandingBalance)}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Quick Actions */}
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-slate-600">{action.description}</p>
                      </div>
                      <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* Recent Loans */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Recent Loans</h2>
                <Link
                href="/user/loans"
                className="text-cyan-600 hover:text-cyan-700 font-medium text-sm flex items-center gap-1"
              >
                View All
                <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
              
              {recentLoans.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                  <DocumentTextIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Loans Yet</h3>
                  <p className="text-slate-600 mb-6">
                    You haven't taken any loans yet. Start your journey with QuickFund!
                  </p>
                  <Link
                    href="/user/apply"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    <DocumentTextIcon className="w-5 h-5" />
                    Apply for Your First Loan
                  </Link>
            </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentLoans.map((loan: any) => (
                <div key={loan.id} className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900">#{loan.id}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          loan.status === 'ACTIVE' ? 'bg-green-50 text-green-600' :
                          loan.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-gray-50 text-gray-600'
                    }`}>
                          {loan.status}
                    </span>
                  </div>
                      
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Amount:</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(loan.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Purpose:</span>
                      <span className="font-semibold text-slate-900">{loan.purpose}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Applied:</span>
                          <span className="font-semibold text-slate-900">{formatDate(loan.createdAt)}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                        <Link
                      href={`/user/loans`}
                      className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
                    >
                      View Details →
                        </Link>
                  </div>
                </div>
              ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success Modal */}
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleSuccessClose}
          title="Logged Out Successfully!"
          message="You have been logged out of your QuickFund account. Thank you for using our services."
          actionText="Go to Home"
          onAction={() => router.push('/')}
          autoClose={true}
          autoCloseDelay={3000}
        />
    </SiteLayout>
    </AuthGuard>
  );
} 