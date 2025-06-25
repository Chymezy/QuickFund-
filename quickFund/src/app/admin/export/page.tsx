"use client";

import { useState } from 'react';
import SiteLayout from "@/components/layout/SiteLayout";
import { 
  DocumentArrowDownIcon,
  TableCellsIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { mockLoans, formatCurrency, formatDate } from '@/lib/loanHelpers';

type ExportType = 'loans' | 'repayments' | 'applications';

export default function ExportData() {
  const [exportType, setExportType] = useState<ExportType>('loans');
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const exportOptions = [
    {
      type: 'loans' as ExportType,
      title: 'Loan Data',
      description: 'Export all loan information including amounts, terms, and status',
      icon: TableCellsIcon,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      type: 'applications' as ExportType,
      title: 'Application Data',
      description: 'Export loan application details and approval status',
      icon: DocumentArrowDownIcon,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      type: 'repayments' as ExportType,
      title: 'Repayment Data',
      description: 'Export repayment history and transaction records',
      icon: CalendarIcon,
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate CSV generation and download
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate CSV data based on export type
    const csvData = generateCSVData(exportType, dateRange);
    
    // Create and download CSV file
    downloadCSV(csvData, `${exportType}_data_${new Date().toISOString().split('T')[0]}.csv`);
    
    setExportSuccess(true);
    setIsExporting(false);
    
    // Reset success message after 3 seconds
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const generateCSVData = (type: ExportType, range: string) => {
    let data: any[] = [];
    
    switch (type) {
      case 'loans':
        data = mockLoans.map(loan => ({
          'Loan ID': loan.id,
          'Amount': formatCurrency(loan.amount),
          'Purpose': loan.purpose,
          'Status': loan.status,
          'Applied Date': formatDate(loan.appliedDate),
          'Approved Date': loan.approvedDate ? formatDate(loan.approvedDate) : '',
          'Term': loan.term,
          'Interest Rate': loan.interestRate,
          'Monthly Payment': loan.monthlyPayment ? formatCurrency(loan.monthlyPayment) : '',
          'Remaining Balance': loan.remainingBalance ? formatCurrency(loan.remainingBalance) : ''
        }));
        break;
      
      case 'applications':
        data = mockLoans.map(loan => ({
          'Application ID': loan.id,
          'Amount Requested': formatCurrency(loan.amount),
          'Purpose': loan.purpose,
          'Status': loan.status,
          'Applied Date': formatDate(loan.appliedDate),
          'Approved Date': loan.approvedDate ? formatDate(loan.approvedDate) : '',
          'Term': loan.term,
          'Interest Rate': loan.interestRate,
          'Rejection Reason': loan.rejectionReason || ''
        }));
        break;
      
      case 'repayments':
        // Mock repayment data
        data = [
          {
            'Repayment ID': 'REP-001',
            'Loan ID': 'LOAN-001',
            'Amount': formatCurrency(125000),
            'Date': formatDate('2024-01-18'),
            'Status': 'completed',
            'Method': 'Bank Transfer',
            'Reference': 'TXN-2024-001'
          },
          {
            'Repayment ID': 'REP-002',
            'Loan ID': 'LOAN-004',
            'Amount': formatCurrency(105000),
            'Date': formatDate('2024-01-18'),
            'Status': 'completed',
            'Method': 'Card Payment',
            'Reference': 'TXN-2024-002'
          }
        ];
        break;
    }
    
    return data;
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStats = () => {
    const totalLoans = mockLoans.length;
    const activeLoans = mockLoans.filter(loan => loan.status === 'active').length;
    const pendingLoans = mockLoans.filter(loan => loan.status === 'pending').length;
    const approvedLoans = mockLoans.filter(loan => loan.status === 'approved').length;
    const rejectedLoans = mockLoans.filter(loan => loan.status === 'rejected').length;
    
    return {
      totalLoans,
      activeLoans,
      pendingLoans,
      approvedLoans,
      rejectedLoans
    };
  };

  const stats = getStats();

  return (
    <SiteLayout>
      <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
              Export Data
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Export loan data to CSV format for analysis and reporting
            </p>
          </div>

          {/* Data Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Loans</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.totalLoans}</p>
                </div>
                <TableCellsIcon className="w-8 h-8 text-cyan-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.activeLoans}</p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending</p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pendingLoans}</p>
                </div>
                <ClockIcon className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Approved</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.approvedLoans}</p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Rejected</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">{stats.rejectedLoans}</p>
                </div>
                <XCircleIcon className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Export Options */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Export Options</h2>
                <div className="space-y-4">
                  {exportOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.type}
                        onClick={() => setExportType(option.type)}
                        className={`w-full p-4 border rounded-lg transition-colors text-left ${
                          exportType === option.type
                            ? 'border-cyan-500 bg-cyan-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-6 h-6 ${
                            exportType === option.type ? 'text-cyan-600' : 'text-slate-400'
                          }`} />
                          <div>
                            <div className={`font-semibold ${
                              exportType === option.type ? 'text-cyan-900' : 'text-slate-900'
                            }`}>
                              {option.title}
                            </div>
                            <div className="text-sm text-slate-600">
                              {option.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Range */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Date Range</h2>
                <div className="space-y-4">
                  <button
                    onClick={() => setDateRange('all')}
                    className={`w-full p-3 border rounded-lg transition-colors text-left ${
                      dateRange === 'all'
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-900'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    All Time
                  </button>
                  <button
                    onClick={() => setDateRange('month')}
                    className={`w-full p-3 border rounded-lg transition-colors text-left ${
                      dateRange === 'month'
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-900'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    Last Month
                  </button>
                  <button
                    onClick={() => setDateRange('quarter')}
                    className={`w-full p-3 border rounded-lg transition-colors text-left ${
                      dateRange === 'quarter'
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-900'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    Last Quarter
                  </button>
                  <button
                    onClick={() => setDateRange('year')}
                    className={`w-full p-3 border rounded-lg transition-colors text-left ${
                      dateRange === 'year'
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-900'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    Last Year
                  </button>
                </div>
              </div>
            </div>

            {/* Export Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Export Preview</h2>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {exportOptions.find(opt => opt.type === exportType)?.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {exportOptions.find(opt => opt.type === exportType)?.description}
                  </p>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">Date Range</h3>
                  <p className="text-sm text-slate-600">
                    {dateRange === 'all' ? 'All Time' :
                     dateRange === 'month' ? 'Last Month' :
                     dateRange === 'quarter' ? 'Last Quarter' : 'Last Year'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full px-6 py-4 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 focus:bg-cyan-700 active:bg-cyan-800 hover:scale-105 focus:scale-105 active:scale-95 hover:shadow-lg focus:shadow-lg active:shadow-md transition-all duration-300 touch-manipulation select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating CSV...
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="w-5 h-5" />
                    Export to CSV
                  </>
                )}
              </button>

              {exportSuccess && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800">CSV file downloaded successfully!</span>
                </div>
              )}

              <div className="mt-6 text-xs text-slate-500 space-y-2">
                <p>• CSV files are generated with UTF-8 encoding</p>
                <p>• All monetary values are in Nigerian Naira (NGN)</p>
                <p>• Dates are formatted as DD/MM/YYYY</p>
                <p>• Files are automatically downloaded to your device</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
} 