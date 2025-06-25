import SiteLayout from "@/components/layout/SiteLayout";

export default function Terms() {
  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-cyan-600 to-cyan-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 sm:mb-8">
            Terms of Service
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-cyan-100 max-w-4xl mx-auto">
            Please read these terms carefully before using our services
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate max-w-none">
            <div className="text-sm text-slate-500 mb-8">
              <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using QuickFund's website and services, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              QuickFund provides digital lending services, including personal loans, auto loans, business loans, and student loans. 
              Our services include loan application processing, approval decisions, fund disbursement, and loan management.
            </p>

            <h2>3. Eligibility Requirements</h2>
            <ul>
              <li>You must be at least 18 years old</li>
              <li>You must be a legal resident of Nigeria</li>
              <li>You must have a valid government-issued ID</li>
              <li>You must have a valid Nigerian bank account</li>
              <li>You must provide accurate and complete information</li>
              <li>You must not have declared bankruptcy in the past 7 years</li>
            </ul>

            <h2>4. Loan Terms and Conditions</h2>
            <h3>4.1 Loan Amounts</h3>
            <ul>
              <li>Personal Loans: ₦250,000 - ₦12,500,000</li>
              <li>Auto Loans: ₦500,000 - ₦25,000,000</li>
              <li>Business Loans: ₦2,500,000 - ₦50,000,000</li>
              <li>Student Loans: ₦1,000,000 - ₦15,000,000</li>
            </ul>

            <h3>4.2 Interest Rates</h3>
            <p>
              Interest rates vary based on loan type, amount, and your financial profile. 
              Rates start from 15% APR and are clearly disclosed before loan acceptance.
            </p>

            <h3>4.3 Repayment Terms</h3>
            <p>
              Repayment terms range from 6 to 60 months depending on loan type and amount. 
              All payments are automatically deducted from your designated bank account.
            </p>

            <h2>5. Application Process</h2>
            <p>
              By submitting a loan application, you authorize QuickFund to:
            </p>
            <ul>
              <li>Verify your identity and financial information</li>
              <li>Perform credit checks and background verification</li>
              <li>Contact references and employers as needed</li>
              <li>Use third-party services for verification</li>
            </ul>

            <h2>6. Privacy and Data Protection</h2>
            <p>
              Your privacy is important to us. We collect, use, and protect your personal information in accordance with our Privacy Policy 
              and applicable data protection laws. We use bank-level encryption and security measures to protect your data.
            </p>

            <h2>7. Fees and Charges</h2>
            <ul>
              <li>No application fees</li>
              <li>No hidden fees</li>
              <li>No prepayment penalties</li>
              <li>Late payment fees may apply</li>
              <li>All fees are clearly disclosed upfront</li>
            </ul>

            <h2>8. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Make timely payments as agreed</li>
              <li>Notify us of any changes to your contact information</li>
              <li>Not use our services for illegal purposes</li>
              <li>Not provide false or misleading information</li>
            </ul>

            <h2>9. Prohibited Activities</h2>
            <p>You may not:</p>
            <ul>
              <li>Use our services for illegal activities</li>
              <li>Provide false or misleading information</li>
              <li>Attempt to circumvent our security measures</li>
              <li>Use automated systems to access our services</li>
              <li>Interfere with the proper functioning of our platform</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>

            <h2>10. Disclaimers</h2>
            <p>
              QuickFund provides its services "as is" without warranties of any kind. 
              We do not guarantee loan approval or specific loan terms. 
              All loan decisions are subject to our underwriting criteria and regulatory requirements.
            </p>

            <h2>11. Limitation of Liability</h2>
            <p>
              QuickFund's liability is limited to the amount of fees paid by you in the 12 months preceding the claim. 
              We are not liable for indirect, incidental, or consequential damages.
            </p>

            <h2>12. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless QuickFund from any claims, damages, or expenses arising from your use of our services 
              or violation of these terms.
            </p>

            <h2>13. Termination</h2>
            <p>
              We may terminate or suspend your account at any time for violation of these terms. 
              You may close your account at any time by contacting customer support.
            </p>

            <h2>14. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. We will notify you of any material changes via email or through our website. 
              Continued use of our services after changes constitutes acceptance of the new terms.
            </p>

            <h2>15. Governing Law</h2>
            <p>
              These terms are governed by the laws of Nigeria. Any disputes will be resolved in Nigerian courts.
            </p>

            <h2>16. Contact Information</h2>
            <p>
              If you have questions about these terms, please contact us at:
            </p>
            <div className="bg-slate-50 p-6 rounded-lg">
              <p><strong>QuickFund</strong></p>
              <p>Email: legal@quickfund.ng</p>
              <p>Phone: +234 800 QUICKFUND</p>
              <p>Address: [Your Business Address]</p>
            </div>

            <div className="mt-12 p-6 bg-cyan-50 rounded-lg">
              <h3 className="text-cyan-900">Important Notice</h3>
              <p className="text-cyan-800">
                These terms constitute a legally binding agreement between you and QuickFund. 
                By using our services, you acknowledge that you have read, understood, and agree to be bound by these terms.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
} 