import { 
  ExclamationTriangleIcon,
  EyeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { Loan, formatCurrency, formatDate, getStatusConfig } from '@/lib/loanHelpers';

interface LoanCardProps {
  loan: Loan;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function LoanCard({ loan, isExpanded, onToggle }: LoanCardProps) {
  const status = getStatusConfig(loan.status);
  const StatusIcon = status.icon;

  const handleDownloadAgreement = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to agreement page
    window.location.href = `/user/agreement/${loan.id}`;
  };

  const handleMakePayment = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to repayment page
    window.location.href = `/user/repayment/${loan.id}`;
  };

  return (
    <div
      className={`bg-white rounded-xl border ${status.borderColor} p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer ${
        isExpanded ? 'ring-2 ring-cyan-500' : ''
      }`}
      onClick={onToggle}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left side - Loan info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-slate-900">{loan.id}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-sm">
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
              <p className="font-semibold text-slate-900">{formatDate(loan.appliedDate)}</p>
            </div>
            <div>
              <p className="text-slate-600">Term</p>
              <p className="font-semibold text-slate-900">{loan.term}</p>
            </div>
          </div>

          {/* Additional details when expanded */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-slate-600 text-sm">Interest Rate</p>
                  <p className="font-semibold text-slate-900">{loan.interestRate}</p>
                </div>
                {loan.monthlyPayment && (
                  <div>
                    <p className="text-slate-600 text-sm">Monthly Payment</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(loan.monthlyPayment)}</p>
                  </div>
                )}
                {loan.remainingBalance && (
                  <div>
                    <p className="text-slate-600 text-sm">Remaining Balance</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(loan.remainingBalance)}</p>
                  </div>
                )}
                {loan.nextPaymentDate && (
                  <div>
                    <p className="text-slate-600 text-sm">Next Payment</p>
                    <p className="font-semibold text-slate-900">{formatDate(loan.nextPaymentDate)}</p>
                  </div>
                )}
                {loan.approvedDate && (
                  <div>
                    <p className="text-slate-600 text-sm">Approved</p>
                    <p className="font-semibold text-slate-900">{formatDate(loan.approvedDate)}</p>
                  </div>
                )}
                {loan.disbursedDate && (
                  <div>
                    <p className="text-slate-600 text-sm">Disbursed</p>
                    <p className="font-semibold text-slate-900">{formatDate(loan.disbursedDate)}</p>
                  </div>
                )}
              </div>
              
              {loan.status === 'rejected' && loan.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Rejection Reason</p>
                      <p className="text-sm text-red-700">{loan.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                {loan.status === 'active' && (
                  <>
                    <button 
                      onClick={handleDownloadAgreement}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" />
                      Download Agreement
                    </button>
                    <button 
                      onClick={handleMakePayment}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CurrencyDollarIcon className="w-4 h-4" />
                      Make Payment
                    </button>
                  </>
                )}
                {loan.status === 'approved' && (
                  <button 
                    onClick={handleDownloadAgreement}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    Download Agreement
                  </button>
                )}
                {loan.status === 'pending' && (
                  <button 
                    onClick={handleDownloadAgreement}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    Download Agreement
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right side - Expand/collapse indicator */}
        <div className="flex-shrink-0">
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <EyeIcon className={`w-5 h-5 text-slate-500 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
} 