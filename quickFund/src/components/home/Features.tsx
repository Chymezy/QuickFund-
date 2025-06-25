"use client";

import { CheckCircleIcon, ClockIcon, ShieldCheckIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const features = [
  {
    icon: ClockIcon,
    title: "Lightning Fast Approval",
    description: "Get approved in minutes, not days. Our streamlined process ensures you get the funds you need when you need them."
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure & Transparent",
    description: "Your data is protected with bank-level security. No hidden fees, no surprises - just clear, honest terms."
  },
  {
    icon: CurrencyDollarIcon,
    title: "Flexible Loan Options",
    description: "From $500 to $50,000, choose the amount that fits your needs. Repayment terms that work for you."
  },
  {
    icon: CheckCircleIcon,
    title: "No Credit Score Required",
    description: "We believe in your potential, not just your past. Get approved based on your current situation and future plans."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 sm:mb-4">
            Why Choose QuickFund?
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto">
            We're revolutionizing the lending industry with technology that puts people first. 
            Get the financial support you deserve without the traditional barriers.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-cyan-600 rounded-full mb-4 sm:mb-6 group-hover:bg-cyan-700 transition-colors duration-300">
                <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 