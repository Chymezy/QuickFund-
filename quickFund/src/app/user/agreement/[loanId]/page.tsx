"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import SiteLayout from "@/components/layout/SiteLayout";
import { 
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { loanApi, LoanDetails } from '@/lib/api/loans';
import { formatCurrency, formatDate } from '@/lib/loanHelpers';
import { useAuthStore } from '@/lib/stores/authStore';

export default function LoanAgreement() {
  const params = useParams();
  const loanId = params.loanId as string;
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [loan, setLoan] = useState<LoanDetails | null>(null);
  const [agreement, setAgreement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore(state => state.user);

  useEffect(() => {
    const fetchAgreement = async () => {
      setLoading(true);
      setError(null);
      try {
        const loanData = await loanApi.getApplication(loanId);
        setLoan(loanData);
        // Use user's name from auth store if available
        const userName = user ? `${user.firstName} ${user.lastName}` : 'Borrower';
        // Generate agreement HTML using loan details and user name
        const agreementHtml = generateAgreementHtml(loanData, userName);
        setAgreement(agreementHtml);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load agreement.');
      } finally {
        setLoading(false);
      }
    };
    if (loanId) fetchAgreement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanId, user?.firstName, user?.lastName]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading loan agreement...</p>
        </div>
      </SiteLayout>
    );
  }
  if (error || !loan) {
    return (
      <SiteLayout>
        <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Error</h1>
            <p className="text-slate-600">{error || 'The loan agreement you\'re looking for doesn\'t exist.'}</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  const handleDownload = async () => {
    if (!agreement) return;
    setIsDownloading(true);
    try {
      // Dynamically import html2pdf.js only in the browser
      const html2pdf = (await import('html2pdf.js')).default;
      // Find the agreement content div
      const agreementElement = document.getElementById('agreement-content');
      if (!agreementElement) throw new Error('Agreement content not found');
      // Use html2pdf to generate and download the PDF
      await html2pdf().from(agreementElement).set({
        margin: 0.5,
        filename: `loan-agreement-${loan?.id || loanId}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      }).save();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBackToLoans = () => {
    window.location.href = '/user/loans';
  };

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
              Loan Agreement
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Review and download your loan agreement document
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Loan Agreement Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">LOAN AGREEMENT</h2>
                  
                  <div className="space-y-6 text-sm">
                    {agreement ? (
                      <div id="agreement-content" dangerouslySetInnerHTML={{ __html: agreement }} />
                    ) : (
                      <p className="text-slate-600">No agreement found for this loan.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Download Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 sticky top-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Download Agreement</h2>
                
                <div className="space-y-6">
                  <div className="bg-cyan-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-cyan-900 mb-2">Loan Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-cyan-700">Loan ID:</span>
                        <span className="font-semibold text-cyan-900">{loan.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cyan-700">Amount:</span>
                        <span className="font-semibold text-cyan-900">{formatCurrency(loan.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cyan-700">Status:</span>
                        <span className="font-semibold text-cyan-900 capitalize">{loan.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cyan-700">Approved:</span>
                        <span className="font-semibold text-cyan-900">{formatDate(loan.approvedDate || (loan as any).appliedDate)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full px-6 py-4 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 focus:bg-cyan-700 active:bg-cyan-800 hover:scale-105 focus:scale-105 active:scale-95 hover:shadow-lg focus:shadow-lg active:shadow-md transition-all duration-300 touch-manipulation select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <DocumentArrowDownIcon className="w-5 h-5" />
                        Download PDF
                      </>
                    )}
                  </button>

                  {downloadSuccess && (
                    <div className="bg-green-50 p-4 rounded-lg flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-800">PDF downloaded successfully!</span>
                    </div>
                  )}

                  <div className="text-xs text-slate-500 space-y-2">
                    <p>• PDF will be generated with your loan details</p>
                    <p>• Document is legally binding once signed</p>
                    <p>• Keep a copy for your records</p>
                    <p>• Contact support if you need assistance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function generateAgreementHtml(loan: LoanDetails, userName: string) {
  const amount = formatCurrency(loan.amount);
  const term = loan.term;
  const interest = loan.interestRate;
  const date = formatDate(loan.approvedDate || (loan as any).appliedDate || loan.createdAt);
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #222;">
      <h2 style="text-align:center; margin-bottom: 1.5em;">Loan Agreement</h2>
      <p>This Loan Agreement (the "Agreement") is made and entered into on <strong>${date}</strong> by and between:</p>
      <p><strong>Borrower:</strong> ${userName}</p>
      <p><strong>Lender:</strong> QuickFund</p>
      <h3>Loan Details</h3>
      <ul>
        <li><strong>Loan Amount:</strong> ${amount}</li>
        <li><strong>Term:</strong> ${term} months</li>
        <li><strong>Interest Rate:</strong> ${interest}%</li>
      </ul>
      <h3>Agreement Terms</h3>
      <ol>
        <li>The Lender agrees to lend the Borrower the amount stated above, subject to the terms and conditions of this Agreement.</li>
        <li>The Borrower agrees to repay the loan in monthly installments as specified in the repayment schedule.</li>
        <li>Interest will accrue on the outstanding balance at the rate specified above.</li>
        <li>Late payments may incur additional fees as outlined in the platform's terms.</li>
        <li>This Agreement is binding upon both parties and governed by the laws of Nigeria.</li>
      </ol>
      <p style="margin-top:2em;">Signed,</p>
      <p><strong>Borrower:</strong> ${userName}</p>
      <p><strong>Lender:</strong> QuickFund</p>
    </div>
  `;
} 