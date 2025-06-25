"use client";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    content: "QuickFund helped me expand my bakery when I needed it most. The process was incredibly smooth and the rates were unbeatable. I'm so grateful for their support!",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Student",
    content: "As a student, getting a loan was always a challenge. QuickFund made it possible for me to continue my education without the stress of traditional lenders.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Entrepreneur",
    content: "The speed and transparency of QuickFund is unmatched. I got approved in minutes and had the funds in my account the next day. Highly recommend!",
    rating: 5
  },
  {
    name: "David Thompson",
    role: "Homeowner",
    content: "When I needed to make urgent home repairs, QuickFund came through with a personal loan that saved me thousands. Their customer service is exceptional.",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 sm:mb-4">
            What Our Customers Say
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what real customers have to say 
            about their experience with QuickFund.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              {/* Stars */}
              <div className="flex items-center mb-3 sm:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              {/* Content */}
              <blockquote className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>
              
              {/* Author */}
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-3 sm:ml-4">
                  <div className="font-semibold text-slate-900 text-sm sm:text-base">{testimonial.name}</div>
                  <div className="text-xs sm:text-sm text-slate-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          <div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-600 mb-1 sm:mb-2">50,000+</div>
            <div className="text-xs sm:text-sm text-slate-600">Happy Customers</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-600 mb-1 sm:mb-2">₦250B+</div>
            <div className="text-xs sm:text-sm text-slate-600">Loans Funded</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-600 mb-1 sm:mb-2">4.9/5</div>
            <div className="text-xs sm:text-sm text-slate-600">Customer Rating</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-600 mb-1 sm:mb-2">24hrs</div>
            <div className="text-xs sm:text-sm text-slate-600">Average Funding Time</div>
          </div>
        </div>
      </div>
    </section>
  );
} 