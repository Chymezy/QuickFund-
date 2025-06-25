"use client";

import { useState, useMemo, useEffect } from 'react';
import SiteLayout from "@/components/layout/SiteLayout";
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { adminApi } from '@/lib/api/admin';
import { formatCurrency, formatDate, getStatusConfig } from '@/lib/loanHelpers';

type StatusFilter = 'all' | 'COMPLETED' | 'PENDING' | 'FAILED';
type PaymentTypeFilter = 'all' | 'INSTALLMENT' | 'EARLY_REPAYMENT' | 'LATE_FEE';

export default function AdminRepayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<PaymentTypeFilter>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'user'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await adminApi.getPayments({ limit: 100 });
        setPayments(response.payments || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load payments.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter and sort payments
  const filteredPayments = useMemo(() => {
    let filtered = payments;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(payment => payment.type === typeFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.loanId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.loan?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.loan?.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.loan?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.paidAt || b.processedAt || b.createdAt).getTime() - 
                      new Date(a.paidAt || a.processedAt || a.createdAt).getTime();
          break;
        case 'amount':
          comparison = b.amount - a.amount;
          break;
        case 'user':
          const aName = `${a.loan?.user?.firstName || 'Unknown'} ${a.loan?.user?.lastName || 'User'}`.toLowerCase();
          const bName = `${b.loan?.user?.firstName || 'Unknown'} ${b.loan?.user?.lastName || 'User'}`.toLowerCase();
          comparison = aName.localeCompare(bName);
          break;
      }
      
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return filtered;
  }, [searchTerm, statusFilter, typeFilter, sortBy, sortOrder, payments]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalPayments = filteredPayments.length;
    const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const completedPayments = filteredPayments.filter(p => p.status === 'COMPLETED').length;
    const pendingPayments = filteredPayments.filter(p => p.status === 'PENDING').length;
    const failedPayments = filteredPayments.filter(p => p.status === 'FAILED').length;
    const averageAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;

    return {
      totalPayments,
      totalAmount,
      completedPayments,
      pendingPayments,
      failedPayments,
      averageAmount
    };
  }, [filteredPayments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return CheckCircleIcon;
      case 'PENDING':
        return CalendarIcon;
      case 'FAILED':
        return XCircleIcon;
      default:
        return ExclamationTriangleIcon;
    }
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading payment history...</p>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (error) {
    return (
      <SiteLayout>
        <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Error</h1>
              <p className="text-slate-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
              Payment Management
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Monitor and manage all loan payments across the platform
            </p>
          </div>

          {/* Summary Statistics */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Total Payments</p>
                    <p className="text-2xl font-bold text-slate-900">{summaryStats.totalPayments}</p>
                  </div>
                  <CurrencyDollarIcon className="w-8 h-8 text-cyan-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Total Amount</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(summaryStats.totalAmount)}</p>
                  </div>
                  <DocumentTextIcon className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{summaryStats.completedPayments}</p>
                  </div>
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Average Amount</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(summaryStats.averageAmount)}</p>
                  </div>
                  <FunnelIcon className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by payment ID, loan ID, reference, or user name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  >
                    <option value="all">All Status</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                  </select>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as PaymentTypeFilter)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  >
                    <option value="all">All Types</option>
                    <option value="INSTALLMENT">Installment</option>
                    <option value="EARLY_REPAYMENT">Early Repayment</option>
                    <option value="LATE_FEE">Late Fee</option>
                  </select>

                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [sort, order] = e.target.value.split('-');
                      setSortBy(sort as 'date' | 'amount' | 'user');
                      setSortOrder(order as 'asc' | 'desc');
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  >
                    <option value="date-desc">Date (Newest)</option>
                    <option value="date-asc">Date (Oldest)</option>
                    <option value="amount-desc">Amount (High to Low)</option>
                    <option value="amount-asc">Amount (Low to High)</option>
                    <option value="user-asc">User (A-Z)</option>
                    <option value="user-desc">User (Z-A)</option>
                  </select>
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-end">
                  <span className="text-sm text-slate-600">
                    {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History Table */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Payment History</h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Payment ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Loan ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Gateway
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredPayments.map((payment) => {
                      const status = getStatusConfig(payment.status);
                      const StatusIcon = getStatusIcon(payment.status);
                      
                      return (
                        <tr key={payment.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {payment.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            <div className="flex items-center">
                              <UserIcon className="w-4 h-4 text-slate-400 mr-2" />
                              <div>
                                <div className="font-medium">
                                  {payment.loan?.user
                                    ? `${payment.loan.user.firstName || ''} ${payment.loan.user.lastName || ''}`.trim() || payment.loan.user.email || payment.loan.user.id
                                    : payment.loan?.user?.email || payment.loan?.user?.id || 'Unknown'}
                                </div>
                                <div className="text-slate-500 text-xs">
                                  {payment.loan?.user?.email || ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {payment.loanId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                              {payment.type?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {formatDate(payment.paidAt || payment.processedAt || payment.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {payment.gateway || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            <span className="font-mono text-xs">{payment.reference}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No payments found</h3>
              <p className="text-slate-600">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'No payments have been made yet.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
} 