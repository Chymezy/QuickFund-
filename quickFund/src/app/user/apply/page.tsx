"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SiteLayout from "@/components/layout/SiteLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import TermsModal from "@/components/ui/TermsModal";
import SuccessModal from "@/components/ui/SuccessModal";
import { useAuthStore } from '@/lib/stores/authStore';
import { loanApi, ApplyLoanRequest, LoanApplication } from '@/lib/api/loans';
import { CurrencyDollarIcon, DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ApplyForLoan() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    term: '',
    notes: '',
    agreeToTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestApplication, setLatestApplication] = useState<LoanApplication | null>(null);
  const [showFinalStatus, setShowFinalStatus] = useState(false);
  const [finalStatus, setFinalStatus] = useState<'REJECTED' | 'PENDING' | null>(null);
  const [finalReason, setFinalReason] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Amount ranges mapping
  const amountRanges = {
    '250000-500000': { min: 250000, max: 500000, default: 375000 },
    '500000-1000000': { min: 500000, max: 1000000, default: 750000 },
    '1000000-2500000': { min: 1000000, max: 2500000, default: 1750000 },
    '2500000-5000000': { min: 2500000, max: 5000000, default: 3750000 },
    '5000000-10000000': { min: 5000000, max: 10000000, default: 7500000 },
    '10000000+': { min: 10000000, max: 50000000, default: 15000000 }
  };

  // Term options mapping
  const termOptions = {
    '3': 3,
    '6': 6,
    '12': 12,
    '18': 18,
    '24': 24,
    '36': 36,
    '48': 48,
    '60': 60
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.amount) return 'Please select a loan amount';
    if (!formData.purpose) return 'Please select a loan purpose';
    if (!formData.term) return 'Please select a loan term';
    if (!formData.agreeToTerms) return 'Please agree to the terms and conditions';
    
    const selectedAmount = amountRanges[formData.amount as keyof typeof amountRanges];
    if (!selectedAmount) return 'Invalid loan amount selected';
    
    const selectedTerm = termOptions[formData.term as keyof typeof termOptions];
    if (!selectedTerm) return 'Invalid loan term selected';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const selectedAmount = amountRanges[formData.amount as keyof typeof amountRanges];
      const selectedTerm = termOptions[formData.term as keyof typeof termOptions];
      
      const loanData: ApplyLoanRequest = {
        amount: selectedAmount.default,
        purpose: formData.purpose,
        term: selectedTerm,
        notes: formData.notes || undefined
      };

      const application = await loanApi.applyForLoan(loanData);
      setLatestApplication(application);
      setShowSuccess(true);
      startPolling(application.id);
      
    } catch (error: any) {
      console.error('Failed to submit loan application:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to submit loan application. Please try again.'
      );
    } finally {
    setIsSubmitting(false);
    }
  };

  // Polling logic for loan status
  const startPolling = (loanId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const app = await loanApi.getApplication(loanId);
        setLatestApplication(app);
        if (app.status !== 'PENDING') {
          clearInterval(pollingRef.current!);
          setFinalStatus(app.status === 'REJECTED' ? 'REJECTED' : 'PENDING');
          setFinalReason(app.rejectionReason || null);
          setShowFinalStatus(true);
          setShowSuccess(false);
        }
      } catch (err) {
        // Optionally handle error
      }
    }, 2000); // Poll every 2 seconds
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push('/user/loans');
  };

  const handleFinalStatusClose = () => {
    setShowFinalStatus(false);
    router.push('/user/loans');
  };

  return (
    <AuthGuard requiredRole="USER">
      <SiteLayout>
        {/* Application Form Section */}
        <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 lg:p-12">
              <div className="text-center mb-6 sm:mb-8 lg:mb-12">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
                  Apply for a Loan
                </h1>
                <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
                  Get the funds you need in as little as 24 hours with our streamlined application process
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {/* Loan Amount */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-2">
                    <CurrencyDollarIcon className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                    Loan Amount *
                  </label>
                  <select
                    id="amount"
                    name="amount"
                    required
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-sm sm:text-base"
                  >
                    <option value="">Select loan amount</option>
                    <option value="250000-500000">₦250,000 - ₦500,000</option>
                    <option value="500000-1000000">₦500,000 - ₦1,000,000</option>
                    <option value="1000000-2500000">₦1,000,000 - ₦2,500,000</option>
                    <option value="2500000-5000000">₦2,500,000 - ₦5,000,000</option>
                    <option value="5000000-10000000">₦5,000,000 - ₦10,000,000</option>
                    <option value="10000000+">₦10,000,000+</option>
                  </select>
                </div>

                {/* Loan Purpose */}
                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium text-slate-700 mb-2">
                    <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                    Loan Purpose *
                  </label>
                  <select
                    id="purpose"
                    name="purpose"
                    required
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-sm sm:text-base"
                  >
                    <option value="">Select loan purpose</option>
                    <option value="business">Business Expansion</option>
                    <option value="personal">Personal Expenses</option>
                    <option value="education">Education</option>
                    <option value="home">Home Improvement</option>
                    <option value="vehicle">Vehicle Purchase</option>
                    <option value="medical">Medical Expenses</option>
                    <option value="debt">Debt Consolidation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Loan Term */}
                <div>
                  <label htmlFor="term" className="block text-sm font-medium text-slate-700 mb-2">
                    Loan Term (Months) *
                  </label>
                  <select
                    id="term"
                    name="term"
                    required
                    value={formData.term}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-sm sm:text-base"
                  >
                    <option value="">Select loan term</option>
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="18">18 months</option>
                    <option value="24">24 months</option>
                    <option value="36">36 months</option>
                    <option value="48">48 months</option>
                    <option value="60">60 months</option>
                  </select>
                </div>

                {/* Additional Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Please provide any additional information about your loan request..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-sm sm:text-base resize-none"
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    required
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500 flex-shrink-0"
                  />
                  <label htmlFor="agreeToTerms" className="text-xs sm:text-sm text-slate-600">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTermsModal(true);
                      }}
                      className="text-cyan-600 hover:text-cyan-700 font-semibold underline"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <a href="/privacy" className="text-cyan-600 hover:text-cyan-700 font-semibold">
                      Privacy Policy
                    </a> *
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 focus:bg-cyan-700 active:bg-cyan-800 hover:scale-105 focus:scale-105 active:scale-95 hover:shadow-lg focus:shadow-lg active:shadow-md transition-all duration-300 touch-manipulation select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting Application...
                    </div>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Terms Modal */}
        <TermsModal 
          isOpen={showTermsModal} 
          onClose={() => setShowTermsModal(false)} 
        />

        {/* Success Modal (Under Review) */}
        <SuccessModal
          isOpen={showSuccess}
          onClose={handleSuccessClose}
          title="Application Submitted!"
          message="Your loan application has been submitted and is under review. You'll be notified here as soon as a decision is made."
          actionText="View My Applications"
          onAction={handleSuccessClose}
          autoClose={false}
        />
        {/* Final Status Modal (Under Review/Rejected) */}
        <SuccessModal
          isOpen={showFinalStatus}
          onClose={handleFinalStatusClose}
          title={finalStatus === 'REJECTED' ? 'Loan Rejected' : 'Application Under Review'}
          message={
            finalStatus === 'REJECTED'
              ? `Sorry, your loan application was rejected.${finalReason ? ' Reason: ' + finalReason : ''}`
              : 'Your loan application is under review. You will be notified once an admin reviews your application.'
          }
          actionText="Go to My Loans"
          onAction={handleFinalStatusClose}
          autoClose={false}
        />
      </SiteLayout>
    </AuthGuard>
  );
} 