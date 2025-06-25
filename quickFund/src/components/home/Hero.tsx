"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative overflow-hidden flex items-center justify-center min-h-[70vh] md:min-h-screen">
      {/* Image Wrapper Background - Hidden on Mobile */}
      <div className="absolute inset-0 w-full h-full hidden md:block">
        <Image
          src="/home-wrapper.webp"
          alt="Hero background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Mobile Background - Main Image */}
      <div className="absolute inset-0 w-full h-full md:hidden">
        <Image
          src="/hompage.webp"
          alt="QuickFund hero background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          style={{ 
            objectPosition: 'center 30%',
            width: '100%',
            height: '100%'
          }}
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Mobile Content - Text Only */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-8 text-center w-full md:hidden">
        <div className="text-white">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tight">
            Empowering Your Future <br className="block sm:hidden" /> With Instant Micro Loans
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl lg:text-2xl text-white/90">
            QuickFund delivers fast, transparent, and reliable financing to individuals and small businesses — right when you need it.
          </p>

          <div className="mt-4 sm:mt-6 flex flex-col gap-2 sm:gap-3 w-full max-w-xs sm:max-w-sm mx-auto">
            <Link href="/signup" className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-slate-800 font-semibold rounded-lg shadow-md hover:bg-slate-50 focus:bg-slate-50 active:bg-slate-100 hover:scale-105 focus:scale-105 active:scale-95 hover:shadow-lg focus:shadow-lg active:shadow-md transition-all duration-300 text-sm sm:text-base touch-manipulation select-none inline-block text-center">
              Get Started
            </Link>
            <button 
              onClick={scrollToHowItWorks}
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 border border-white text-white rounded-lg hover:bg-cyan-600 focus:bg-cyan-600 active:bg-cyan-700 hover:border-cyan-600 focus:border-cyan-600 active:border-cyan-700 hover:text-white focus:text-white active:text-white hover:shadow-lg focus:shadow-lg active:shadow-md transition-all duration-300 text-sm sm:text-base touch-manipulation select-none"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Text and Image Side by Side */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-0 w-full hidden md:block">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 min-h-[80vh]">
          {/* Text Content */}
          <div className="flex-1 text-white text-center lg:text-center max-w-2xl lg:max-w-none">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tight">
              Empowering Your Future With Instant Micro Loans
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl lg:text-2xl text-white/90">
              QuickFund delivers fast, transparent, and reliable financing to individuals and small businesses — right when you need it.
            </p>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Link href="/signup" className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-slate-800 font-semibold rounded-lg shadow-md hover:bg-slate-50 focus:bg-slate-50 active:bg-slate-100 hover:scale-105 focus:scale-105 active:scale-95 hover:shadow-lg focus:shadow-lg active:shadow-md transition-all duration-300 text-sm sm:text-base touch-manipulation select-none inline-block text-center">
                Get Started
              </Link>
              <button 
                onClick={scrollToHowItWorks}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-white text-white rounded-lg hover:bg-cyan-600 focus:bg-cyan-600 active:bg-cyan-700 hover:border-cyan-600 focus:border-cyan-600 active:border-cyan-700 hover:text-white focus:text-white active:text-white hover:shadow-lg focus:shadow-lg active:shadow-md transition-all duration-300 text-sm sm:text-base touch-manipulation select-none"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Main Image */}
          <div className="flex-1 flex justify-center lg:justify-end w-full max-w-sm lg:max-w-md">
            <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px]">
              <Image
                src="/hompage.webp"
                alt="QuickFund hero illustration"
                fill
                className="object-contain object-bottom"
                priority
                sizes="(max-width: 640px) 300px, (max-width: 768px) 400px, (max-width: 1024px) 500px, 600px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
