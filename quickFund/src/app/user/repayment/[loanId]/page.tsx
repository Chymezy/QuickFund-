"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SiteLayout from "@/components/layout/SiteLayout";
import { 
  CreditCardIcon, 
  BuildingLibraryIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { loanApi, LoanDetails } from '@/lib/api/loans';
import { paymentApi } from '@/lib/api/payments';

// Payment method type
type PaymentMethod = 'card' | 'virtual-account';

export default function LoanRepayment() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.loanId as string;
  
  const [loan, setLoan] = useState<LoanDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [virtualAccountNumber, setVirtualAccountNumber] = useState('');

  useEffect(() => {
    if (loanId) {
      fetchLoan();
    }
    // eslint-disable-next-line
  }, [loanId]);

  const fetchLoan = async () => {
    setError(null);
    try {
      const loanData = await loanApi.getApplication(loanId);
      setLoan(loanData);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
        error.message ||
        'Failed to load loan details.'
      );
    }
  };

  // Handle card expiry input with automatic "/" separator
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    
    setExpiry(value);
  };

  // Handle CVV input to only allow digits
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setCvv(value.slice(0, 3)); // Limit to 3 digits
  };

  // Handle card number input to only allow digits
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setCardNumber(value.slice(0, 16)); // Limit to 16 digits
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    
    // Validate card details if using card payment
    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.length !== 16) {
        setError('Please enter a valid 16-digit card number');
        setIsProcessing(false);
        return;
      }
      if (!expiry || expiry.length !== 5 || !expiry.includes('/')) {
        setError('Please enter a valid expiry date (MM/YY)');
        setIsProcessing(false);
        return;
      }
      if (!cvv || cvv.length !== 3) {
        setError('Please enter a valid 3-digit CVV');
        setIsProcessing(false);
        return;
      }
    }
    
    // Validate virtual account if using virtual account payment
    if (paymentMethod === 'virtual-account') {
      if (!virtualAccountNumber || virtualAccountNumber.length < 8) {
        setError('Please enter a valid virtual account number');
        setIsProcessing(false);
        return;
      }
    }
    
    try {
      const paymentPayload: any = {
        amount: loan?.monthlyPayment || 0,
        type: 'LOAN_REPAYMENT', // Fixed: use correct type for backend
        paymentMethod: paymentMethod === 'card' ? 'card' : 'virtual_account',
      };
      
      if (paymentMethod === 'card') {
        paymentPayload.cardNumber = cardNumber;
        paymentPayload.expiry = expiry;
        paymentPayload.cvv = cvv;
      } else if (paymentMethod === 'virtual-account') {
        paymentPayload.virtualAccountNumber = virtualAccountNumber;
      }
      
      await paymentApi.makePayment(loanId, paymentPayload);
      setShowSuccess(true);
      fetchLoan();
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
        error.message ||
        'Payment failed. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToLoans = () => {
    router.push('/user/loans');
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

  if (error) {
    return (
      <SiteLayout>
        <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Error</h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={fetchLoan}
              className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (!loan) {
    return (
      <SiteLayout>
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading loan details...</p>
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
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                Payment Successful!
              </h1>
              <p className="text-slate-600 mb-8">
                Your payment of {formatCurrency(loan.monthlyPayment!)} has been processed successfully.
              </p>
              <div className="space-y-4">
                <button
                  onClick={handleBackToLoans}
                  className="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Back to My Loans
                </button>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="w-full px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Make Another Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <button
              onClick={handleBackToLoans}
              className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-4 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to My Loans
            </button>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
              Make Loan Repayment
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Choose your preferred payment method to make your loan payment
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Loan Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Loan Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Loan ID</span>
                  <span className="font-semibold text-slate-900">{loan.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Loan Amount</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(loan.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Purpose</span>
                  <span className="font-semibold text-slate-900">{loan.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Interest Rate</span>
                  <span className="font-semibold text-slate-900">{loan.interestRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Monthly Payment</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(loan.monthlyPayment!)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Remaining Balance</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(loan.remainingBalance!)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Next Payment Due</span>
                  <span className="font-semibold text-slate-900">{loan.nextPaymentDate ? formatDate(loan.nextPaymentDate) : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Payment Method</h2>
              {/* Payment Method Selection */}
              <div className="space-y-4 mb-8">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-4 border rounded-lg transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCardIcon className={`w-6 h-6 ${
                      paymentMethod === 'card' ? 'text-cyan-600' : 'text-slate-400'
                    }`} />
                    <div className="text-left">
                      <div className={`font-semibold ${
                        paymentMethod === 'card' ? 'text-cyan-900' : 'text-slate-900'
                      }`}>
                        Credit/Debit Card
                      </div>
                      <div className="text-sm text-slate-600">
                        Pay securely with your card
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('virtual-account')}
                  className={`w-full p-4 border rounded-lg transition-colors ${
                    paymentMethod === 'virtual-account'
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BuildingLibraryIcon className={`w-6 h-6 ${
                      paymentMethod === 'virtual-account' ? 'text-cyan-600' : 'text-slate-400'
                    }`} />
                    <div className="text-left">
                      <div className={`font-semibold ${
                        paymentMethod === 'virtual-account' ? 'text-cyan-900' : 'text-slate-900'
                      }`}>
                        Virtual Account
                      </div>
                      <div className="text-sm text-slate-600">
                        Pay via bank transfer
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Payment Form */}
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Amount to Pay</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(loan.monthlyPayment!)}</span>
                </div>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                {paymentMethod === 'card' && (
                  <>
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                        placeholder="4111111111111111"
                        maxLength={16}
                        required
                      />
                      <p className="text-xs text-slate-500 mt-1">Use 4111111111111111 for demo</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label htmlFor="expiry" className="block text-sm font-medium text-slate-700 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          id="expiry"
                          name="expiry"
                          value={expiry}
                          onChange={handleExpiryChange}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                          placeholder="12/34"
                          maxLength={5}
                          required
                        />
                        <p className="text-xs text-slate-500 mt-1">Use 12/34 for demo</p>
                      </div>
                      <div className="flex-1">
                        <label htmlFor="cvv" className="block text-sm font-medium text-slate-700 mb-1">CVV</label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          value={cvv}
                          onChange={handleCvvChange}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                          placeholder="123"
                          maxLength={3}
                          required
                        />
                        <p className="text-xs text-slate-500 mt-1">Use 123 for demo</p>
                      </div>
                    </div>
                  </>
                )}
                {paymentMethod === 'virtual-account' && (
                  <div>
                    <label htmlFor="virtualAccountNumber" className="block text-sm font-medium text-slate-700 mb-1">Virtual Account Number</label>
                    <input
                      type="text"
                      id="virtualAccountNumber"
                      name="virtualAccountNumber"
                      value={virtualAccountNumber}
                      onChange={e => setVirtualAccountNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                      placeholder="1234567890"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">Use 1234567890 for demo (ensure account has sufficient balance)</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing Payment...' : 'Pay Now'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
} 