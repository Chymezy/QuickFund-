"use client";

import { useState, useMemo, useEffect } from 'react';
import SiteLayout from "@/components/layout/SiteLayout";
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { adminLoansApi } from '@/lib/api/admin';
import { getStatusConfig, formatDate } from '@/lib/loanHelpers';

type StatusFilter = 'all' | 'PENDING' | 'REJECTED' | 'ACTIVE';

export default function ApplicationsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminLoansApi.getAllLoans({ limit: 100 });
        setApplications(res.loans || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load applications.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    let filtered = applications;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(loan => loan.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(loan => 
        loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.amount - a.amount;
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, sortBy, applications]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return ClockIcon;
      case 'APPROVED':
        return CheckCircleIcon;
      case 'REJECTED':
        return XCircleIcon;
      case 'ACTIVE':
        return CheckCircleIcon;
      default:
        return ClockIcon;
    }
  };

  return (
    <SiteLayout>
      <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
              Loan Applications
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Review and manage all loan applications
            </p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by ID or purpose..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="ACTIVE">Active</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                >
                  <option value="date">Sort by Date</option>
                  <option value="amount">Sort by Amount</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-end">
                <span className="text-sm text-slate-600">
                  {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.map((loan) => {
              const status = getStatusConfig(loan.status);
              const StatusIcon = getStatusIcon(loan.status);
              
              return (
                <div
                  key={loan.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left side - Application info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-slate-900">{loan.id}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Amount</p>
                          <p className="font-semibold text-slate-900">{formatCurrency(loan.amount)}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Purpose</p>
                          <p className="font-semibold text-slate-900">{loan.purpose}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Applied</p>
                          <p className="font-semibold text-slate-900">{formatDate(loan.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Term</p>
                          <p className="font-semibold text-slate-900">{loan.term}</p>
                        </div>
                      </div>

                      {loan.status === 'REJECTED' && loan.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-700">
                            <span className="font-medium">Rejection Reason:</span> {loan.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex-shrink-0 flex gap-2">
                      <a
                        href={`/admin/applications/${loan.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        Review
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <FunnelIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No applications found</h3>
              <p className="text-slate-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'No loan applications have been submitted yet.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
} 