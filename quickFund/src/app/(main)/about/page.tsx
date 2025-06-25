import SiteLayout from "@/components/layout/SiteLayout";

export default function About() {
  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-cyan-600 to-cyan-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 sm:mb-8">
            About QuickFund
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-cyan-100 max-w-4xl mx-auto">
            Revolutionizing the lending industry with technology that puts people first
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 sm:mb-8">
                Our Mission
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-6 sm:mb-8 leading-relaxed">
                At QuickFund, we believe that financial opportunity should be accessible to everyone. 
                Traditional lending institutions have created barriers that prevent millions of people 
                from accessing the funds they need to achieve their dreams.
              </p>
              <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-6 sm:mb-8 leading-relaxed">
                We're changing that by leveraging cutting-edge technology to provide fast, transparent, 
                and fair lending solutions. Our AI-powered platform evaluates applicants based on their 
                current situation and future potential, not just their credit history.
              </p>
              <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed">
                Whether you're starting a business, pursuing education, or dealing with unexpected expenses, 
                QuickFund is here to support your journey to financial success.
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-8 sm:p-12">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">Our Values</h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Transparency</h4>
                    <p className="text-sm sm:text-base text-slate-600">No hidden fees, no surprises. Clear terms and honest communication.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Innovation</h4>
                    <p className="text-sm sm:text-base text-slate-600">Using technology to make lending faster, smarter, and more accessible.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Empowerment</h4>
                    <p className="text-sm sm:text-base text-slate-600">Giving people the tools and resources they need to succeed.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Community</h4>
                    <p className="text-sm sm:text-base text-slate-600">Building a supportive network of borrowers and lenders.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 sm:mb-6">
              Our Impact
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
              Since our founding, we've helped thousands of people achieve their financial goals
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-600 mb-2 sm:mb-4">50,000+</div>
              <div className="text-sm sm:text-base text-slate-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-600 mb-2 sm:mb-4">₦250B+</div>
              <div className="text-sm sm:text-base text-slate-600">Loans Funded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-600 mb-2 sm:mb-4">4.9/5</div>
              <div className="text-sm sm:text-base text-slate-600">Customer Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-600 mb-2 sm:mb-4">24hrs</div>
              <div className="text-sm sm:text-base text-slate-600">Average Funding Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 sm:mb-6">
              Our Team
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
              Meet the passionate team behind QuickFund's mission to democratize lending
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl mx-auto mb-4 sm:mb-6">
                JD
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">John Davis</h3>
              <p className="text-sm sm:text-base text-cyan-600 mb-3 sm:mb-4">CEO & Founder</p>
              <p className="text-sm sm:text-base text-slate-600">
                Former fintech executive with 15+ years experience in lending and technology.
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl mx-auto mb-4 sm:mb-6">
                SM
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Sarah Martinez</h3>
              <p className="text-sm sm:text-base text-cyan-600 mb-3 sm:mb-4">CTO</p>
              <p className="text-sm sm:text-base text-slate-600">
                AI and machine learning expert with a passion for financial inclusion.
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl mx-auto mb-4 sm:mb-6">
                MW
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Michael Wong</h3>
              <p className="text-sm sm:text-base text-cyan-600 mb-3 sm:mb-4">Head of Operations</p>
              <p className="text-sm sm:text-base text-slate-600">
                Operations specialist focused on creating seamless customer experiences.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
} 