"use client";

import Link from 'next/link';

export default function CTA() {
  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3 sm:mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-200 max-w-3xl mx-auto mb-6 sm:mb-8">
            Join thousands of satisfied customers who have already transformed their financial future with QuickFund. 
            Your journey to financial freedom starts here.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link href="/signup" className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 md:px-8 md:py-4 bg-white text-slate-800 font-semibold rounded-lg shadow-md hover:bg-slate-50 focus:bg-slate-50 active:bg-slate-100 hover:scale-105 focus:scale-105 active:scale-95 hover:shadow-lg focus:shadow-lg active:shadow-md transition-all duration-300 touch-manipulation select-none text-sm sm:text-base inline-block text-center">
              Apply Now - It's Free
            </Link>
            <button 
              onClick={scrollToHowItWorks}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 md:px-8 md:py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-slate-800 focus:bg-white focus:text-slate-800 active:bg-slate-50 active:text-slate-800 hover:scale-105 focus:scale-105 active:scale-95 hover:shadow-lg focus:shadow-lg active:shadow-md transition-all duration-300 touch-manipulation select-none text-sm sm:text-base"
            >
              Learn More
            </button>
          </div>
          
          <div className="mt-6 sm:mt-8 text-slate-300 text-xs sm:text-sm">
            <p>✓ No application fees • ✓ No obligation • ✓ Instant approval decisions</p>
          </div>
        </div>
      </div>
    </section>
  );
} 