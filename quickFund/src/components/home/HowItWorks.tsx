"use client";

import { DocumentTextIcon, ClockIcon, BanknotesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const steps = [
  {
    icon: DocumentTextIcon,
    title: "Apply Online",
    description: "Fill out our simple application form in just 5 minutes. No paperwork, no hassle.",
    step: "01"
  },
  {
    icon: ClockIcon,
    title: "Get Instant Approval",
    description: "Our AI-powered system reviews your application and provides instant approval decisions.",
    step: "02"
  },
  {
    icon: BanknotesIcon,
    title: "Receive Funds",
    description: "Once approved, funds are transferred directly to your bank account within 24 hours.",
    step: "03"
  },
  {
    icon: CheckCircleIcon,
    title: "Repay Easily",
    description: "Choose flexible repayment options that fit your budget and timeline.",
    step: "04"
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 sm:mb-4">
            How It Works
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto">
            Getting the funds you need has never been easier. Our streamlined process 
            gets you from application to approval in minutes, not days.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step Number */}
              <div className="absolute -top-3 sm:-top-4 -left-3 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg z-10">
                {step.step}
              </div>
              
              {/* Step Content */}
              <div className="bg-white rounded-lg p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                <div className="flex flex-col items-center text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-cyan-100 rounded-full mb-4 sm:mb-6">
                    <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-8 sm:mt-12">
          <Link 
            href="/signup"
            className="inline-block w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 md:px-8 md:py-4 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 focus:bg-cyan-700 active:bg-cyan-800 hover:scale-105 focus:scale-105 active:scale-95 hover:shadow-lg focus:shadow-lg active:shadow-md transition-all duration-300 touch-manipulation select-none text-sm sm:text-base"
          >
            Start Your Application
          </Link>
        </div>
      </div>
    </section>
  );
} 