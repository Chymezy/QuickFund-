"use client";

import { HomeIcon, TruckIcon, BriefcaseIcon, AcademicCapIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const loanTypes = [
  {
    icon: HomeIcon,
    title: "Personal Loans",
    amount: "₦250,000 - ₦12,500,000",
    rate: "Starting at 15%",
    description: "Flexible personal loans for any purpose. Consolidate debt, cover emergencies, or fund your dreams.",
    features: ["No collateral required", "Fixed monthly payments", "No prepayment penalties"]
  },
  {
    icon: TruckIcon,
    title: "Auto Loans",
    amount: "₦500,000 - ₦25,000,000",
    rate: "Starting at 12%",
    description: "Get behind the wheel faster with our competitive auto financing options.",
    features: ["Competitive rates", "Quick approval", "Flexible terms"]
  },
  {
    icon: BriefcaseIcon,
    title: "Business Loans",
    amount: "₦2,500,000 - ₦50,000,000",
    rate: "Starting at 18%",
    description: "Fuel your business growth with our flexible business financing solutions.",
    features: ["No business plan required", "Fast funding", "Business-friendly terms"]
  },
  {
    icon: AcademicCapIcon,
    title: "Student Loans",
    amount: "₦1,000,000 - ₦15,000,000",
    rate: "Starting at 10%",
    description: "Invest in your education with our student-friendly loan options.",
    features: ["Deferred payments available", "No cosigner required", "Competitive rates"]
  }
];

export default function LoanTypes() {
  return (
    <section id="loan-types" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 sm:mb-4">
            Loan Options That Fit Your Needs
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto">
            Whether you need funds for personal expenses, business growth, or education, 
            we have flexible loan options designed to help you succeed.
          </p>
        </div>

        {/* Loan Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {loanTypes.map((loan, index) => (
            <div key={index} className="bg-slate-50 rounded-xl p-6 sm:p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-600 rounded-lg flex items-center justify-center">
                    <loan.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                    {loan.title}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-3 sm:mb-4">
                    <span className="text-base sm:text-lg font-semibold text-cyan-600">
                      {loan.amount}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500">
                      {loan.rate} APR
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4 leading-relaxed">
                    {loan.description}
                  </p>
                  <ul className="space-y-1 sm:space-y-2">
                    {loan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-xs sm:text-sm text-slate-600">
                        <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-4 sm:mt-6 w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 focus:bg-cyan-700 active:bg-cyan-800 hover:scale-105 focus:scale-105 active:scale-95 hover:shadow-lg focus:shadow-lg active:shadow-md transition-all duration-300 touch-manipulation select-none text-sm sm:text-base">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 