import { 
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/loanHelpers';

interface LoanStatsProps {
  total: number;
  active: number;
  pending: number;
  totalBorrowed: number;
}

export default function LoanStats({ total, active, pending, totalBorrowed }: LoanStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Total Loans</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">{total}</p>
          </div>
          <DocumentTextIcon className="w-8 h-8 text-cyan-600" />
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Active Loans</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{active}</p>
          </div>
          <CheckCircleIcon className="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Pending Review</p>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{pending}</p>
          </div>
          <ClockIcon className="w-8 h-8 text-yellow-600" />
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Total Borrowed</p>
            <p className="text-lg sm:text-xl font-bold text-slate-900">
              {formatCurrency(totalBorrowed)}
            </p>
          </div>
          <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
        </div>
      </div>
    </div>
  );
} 