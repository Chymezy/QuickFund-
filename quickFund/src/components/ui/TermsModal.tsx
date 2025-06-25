"use client";

import { X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Terms of Service</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="prose prose-slate max-w-none">
              <div className="text-sm text-slate-500 mb-6">
                <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">1. Acceptance of Terms</h3>
              <p className="text-sm text-slate-600 mb-4">
                By accessing and using QuickFund's website and services, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">2. Description of Service</h3>
              <p className="text-sm text-slate-600 mb-4">
                QuickFund provides digital lending services, including personal loans, auto loans, business loans, and student loans. 
                Our services include loan application processing, approval decisions, fund disbursement, and loan management.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">3. Eligibility Requirements</h3>
              <ul className="text-sm text-slate-600 mb-4 list-disc pl-5 space-y-1">
                <li>You must be at least 18 years old</li>
                <li>You must be a legal resident of Nigeria</li>
                <li>You must have a valid government-issued ID</li>
                <li>You must have a valid Nigerian bank account</li>
                <li>You must provide accurate and complete information</li>
                <li>You must not have declared bankruptcy in the past 7 years</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">4. Loan Terms and Conditions</h3>
              <h4 className="text-base font-semibold text-slate-800 mb-2">4.1 Loan Amounts</h4>
              <ul className="text-sm text-slate-600 mb-4 list-disc pl-5 space-y-1">
                <li>Personal Loans: ₦250,000 - ₦12,500,000</li>
                <li>Auto Loans: ₦500,000 - ₦25,000,000</li>
                <li>Business Loans: ₦2,500,000 - ₦50,000,000</li>
                <li>Student Loans: ₦1,000,000 - ₦15,000,000</li>
              </ul>

              <h4 className="text-base font-semibold text-slate-800 mb-2">4.2 Interest Rates</h4>
              <p className="text-sm text-slate-600 mb-4">
                Interest rates vary based on loan type, amount, and your financial profile. 
                Rates start from 15% APR and are clearly disclosed before loan acceptance.
              </p>

              <h4 className="text-base font-semibold text-slate-800 mb-2">4.3 Repayment Terms</h4>
              <p className="text-sm text-slate-600 mb-4">
                Repayment terms range from 6 to 60 months depending on loan type and amount. 
                All payments are automatically deducted from your designated bank account.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">5. Application Process</h3>
              <p className="text-sm text-slate-600 mb-2">By submitting a loan application, you authorize QuickFund to:</p>
              <ul className="text-sm text-slate-600 mb-4 list-disc pl-5 space-y-1">
                <li>Verify your identity and financial information</li>
                <li>Perform credit checks and background verification</li>
                <li>Contact references and employers as needed</li>
                <li>Use third-party services for verification</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">6. Privacy and Data Protection</h3>
              <p className="text-sm text-slate-600 mb-4">
                Your privacy is important to us. We collect, use, and protect your personal information in accordance with our Privacy Policy 
                and applicable data protection laws. We use bank-level encryption and security measures to protect your data.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">7. Fees and Charges</h3>
              <ul className="text-sm text-slate-600 mb-4 list-disc pl-5 space-y-1">
                <li>No application fees</li>
                <li>No hidden fees</li>
                <li>No prepayment penalties</li>
                <li>Late payment fees may apply</li>
                <li>All fees are clearly disclosed upfront</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">8. User Responsibilities</h3>
              <p className="text-sm text-slate-600 mb-2">You agree to:</p>
              <ul className="text-sm text-slate-600 mb-4 list-disc pl-5 space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Make timely payments as agreed</li>
                <li>Notify us of any changes to your contact information</li>
                <li>Not use our services for illegal purposes</li>
                <li>Not provide false or misleading information</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">9. Prohibited Activities</h3>
              <p className="text-sm text-slate-600 mb-2">You may not:</p>
              <ul className="text-sm text-slate-600 mb-4 list-disc pl-5 space-y-1">
                <li>Use our services for illegal activities</li>
                <li>Provide false or misleading information</li>
                <li>Attempt to circumvent our security measures</li>
                <li>Use automated systems to access our services</li>
                <li>Interfere with the proper functioning of our platform</li>
                <li>Attempt to gain unauthorized access to our systems</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">10. Disclaimers</h3>
              <p className="text-sm text-slate-600 mb-4">
                QuickFund provides its services "as is" without warranties of any kind. 
                We do not guarantee loan approval or specific loan terms. 
                All loan decisions are subject to our underwriting criteria and regulatory requirements.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">11. Limitation of Liability</h3>
              <p className="text-sm text-slate-600 mb-4">
                QuickFund's liability is limited to the amount of fees paid by you in the 12 months preceding the claim. 
                We are not liable for indirect, incidental, or consequential damages.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">12. Indemnification</h3>
              <p className="text-sm text-slate-600 mb-4">
                You agree to indemnify and hold harmless QuickFund from any claims, damages, or expenses arising from your use of our services 
                or violation of these terms.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">13. Termination</h3>
              <p className="text-sm text-slate-600 mb-4">
                We may terminate or suspend your account at any time for violation of these terms. 
                You may close your account at any time by contacting customer support.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">14. Changes to Terms</h3>
              <p className="text-sm text-slate-600 mb-4">
                We may update these terms from time to time. We will notify you of any material changes via email or through our website. 
                Continued use of our services after changes constitutes acceptance of the new terms.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">15. Governing Law</h3>
              <p className="text-sm text-slate-600 mb-4">
                These terms are governed by the laws of Nigeria. Any disputes will be resolved in Nigerian courts.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">16. Contact Information</h3>
              <p className="text-sm text-slate-600 mb-2">
                If you have questions about these terms, please contact us at:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-slate-600"><strong>QuickFund</strong></p>
                <p className="text-sm text-slate-600">Email: legal@quickfund.ng</p>
                <p className="text-sm text-slate-600">Phone: +234 800 QUICKFUND</p>
                <p className="text-sm text-slate-600">Address: [Your Business Address]</p>
              </div>

              <div className="p-4 bg-cyan-50 rounded-lg">
                <h4 className="text-cyan-900 font-semibold mb-2">Important Notice</h4>
                <p className="text-cyan-800 text-sm">
                  These terms constitute a legally binding agreement between you and QuickFund. 
                  By using our services, you acknowledge that you have read, understood, and agree to be bound by these terms.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 