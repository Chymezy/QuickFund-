"use client";

import { useState, useEffect } from 'react';
import SiteLayout from "@/components/layout/SiteLayout";
import { 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { adminLoansApi } from '@/lib/api/admin';
import AuthGuard from '@/components/auth/AuthGuard';

export default function AdminDashboard() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <AdminDashboardContent />
    </AuthGuard>
  );
}

function AdminDashboardContent() {
  const [loans, setLoans] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [loansRes, statsRes] = await Promise.all([
          adminLoansApi.getAllLoans({ limit: 100 }),
          adminLoansApi.getLoanStatistics(),
        ]);
        console.log('Loans response:', loansRes);
        console.log('Stats response:', statsRes);
        setLoans(loansRes.loans || []);
        setStats(statsRes || {});
      } catch (err: any) {
        console.error('Admin dashboard error:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingLoans = loans.filter(loan => loan.status === 'PENDING').slice(0, 5);
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

  const quickActions = [
    {
      title: 'Review Applications',
      description: 'View and process pending loan applications',
      href: '/admin/applications',
      icon: DocumentTextIcon,
      color: 'bg-cyan-600 hover:bg-cyan-700'
    },
    {
      title: 'Repayment Logs',
      description: 'View loan repayment history',
      href: '/admin/repayments',
      icon: EyeIcon,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Export Data',
      description: 'Export loan data to CSV',
      href: '/admin/export',
      icon: ClockIcon,
      color: 'bg-green-600 hover:bg-green-700'
    }
  ];

  return (
    <SiteLayout>
      <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Manage loan applications and monitor QuickFund operations
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading admin data...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Content - only show when not loading */}
          {!loading && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Loans</p>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.totalLoans ?? 0}</p>
                    </div>
                    <DocumentTextIcon className="w-8 h-8 text-cyan-600" />
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Pending Review</p>
                      <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pendingLoans ?? 0}</p>
                    </div>
                    <ClockIcon className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Approved</p>
                      <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.approvedLoans ?? 0}</p>
                    </div>
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Rejected</p>
                      <p className="text-2xl sm:text-3xl font-bold text-red-600">{stats.rejectedLoans ?? 0}</p>
                    </div>
                    <XCircleIcon className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <a
                        key={action.title}
                        href={action.href}
                        className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{action.title}</h3>
                            <p className="text-sm text-slate-600 mb-4">{action.description}</p>
                            <button className={`inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${action.color}`}>
                              Access
                              <ArrowRightIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <Icon className="w-8 h-8 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Pending Applications */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Pending Applications</h2>
                  <a
                    href="/admin/applications"
                    className="text-cyan-600 hover:text-cyan-700 font-medium text-sm flex items-center gap-1"
                  >
                    View All
                    <ArrowRightIcon className="w-4 h-4" />
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {pendingLoans.map((loan) => (
                    <div key={loan.id} className="bg-white rounded-xl border border-slate-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900">{loan.id}</h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
                          Pending Review
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
                          <span className="font-semibold text-slate-900">{new Date(loan.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <a
                          href={`/admin/applications/${loan.id}`}
                          className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
                        >
                          Review Application →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                {pendingLoans.length === 0 && (
                  <div className="text-center py-8">
                    <ClockIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No pending applications at the moment.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </SiteLayout>
  );
} 