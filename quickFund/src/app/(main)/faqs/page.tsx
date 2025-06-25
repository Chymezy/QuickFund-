"use client";

import { useState } from 'react';
import SiteLayout from "@/components/layout/SiteLayout";
import { ChevronDownIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

const faqCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    questions: [
      {
        question: "What is QuickFund and how does it work?",
        answer: "QuickFund is a digital lending platform that provides fast, transparent loans to individuals and small businesses. Our AI-powered system evaluates your application in minutes and provides instant approval decisions. Once approved, funds are transferred to your bank account within 24 hours."
      },
      {
        question: "How do I create an account?",
        answer: "Creating an account is simple! Click the 'Get Started' button on our homepage, fill out the basic information form, and verify your email address. The entire process takes less than 2 minutes."
      },
      {
        question: "What documents do I need to apply?",
        answer: "You'll need a valid government ID, proof of income (pay stubs, bank statements, or tax returns), and basic personal information. The application process is entirely online and takes about 5 minutes."
      }
    ]
  },
  {
    id: 'loan-types',
    title: 'Loan Types & Amounts',
    questions: [
      {
        question: "What types of loans do you offer?",
        answer: "We offer personal loans (₦250,000-₦12,500,000), auto loans (₦500,000-₦25,000,000), business loans (₦2,500,000-₦50,000,000), and student loans (₦1,000,000-₦15,000,000). Each loan type has competitive rates starting as low as 10% APR."
      },
      {
        question: "What's the maximum loan amount I can get?",
        answer: "The maximum loan amount depends on the loan type and your financial profile. Personal loans go up to $25,000, auto loans up to $50,000, business loans up to $100,000, and student loans up to $30,000."
      },
      {
        question: "Can I apply for multiple loans?",
        answer: "You can have multiple loans with us, but the total amount depends on your income and ability to repay. Each application is evaluated individually based on your current financial situation."
      }
    ]
  },
  {
    id: 'eligibility',
    title: 'Eligibility & Requirements',
    questions: [
      {
        question: "Do I need a good credit score to qualify?",
        answer: "No! We don't require a traditional credit score. Our AI system evaluates your current financial situation, income, and future potential rather than just your credit history. This makes our loans accessible to more people."
      },
      {
        question: "What are the minimum requirements?",
        answer: "You must be at least 18 years old, have a valid government ID, provide proof of income, and have a U.S. bank account. We also require that you haven't declared bankruptcy in the past 7 years."
      },
      {
        question: "Can I apply if I'm self-employed?",
        answer: "Yes! Self-employed individuals can absolutely apply. You'll need to provide additional documentation such as tax returns, bank statements, or business financial records to verify your income."
      }
    ]
  },
  {
    id: 'application',
    title: 'Application Process',
    questions: [
      {
        question: "How long does the application take?",
        answer: "The initial application takes about 5 minutes to complete. Our AI system provides instant approval decisions, and once approved, funds are typically transferred within 24 hours."
      },
      {
        question: "How fast can I get approved and receive funds?",
        answer: "Our approval process takes just minutes. Once approved, funds are typically transferred to your bank account within 24 hours. Some customers receive funds the same day."
      },
      {
        question: "Can I save my application and finish later?",
        answer: "Yes! You can save your application at any point and return to complete it later. We'll send you a reminder email with a link to continue where you left off."
      }
    ]
  },
  {
    id: 'rates-fees',
    title: 'Rates & Fees',
    questions: [
      {
        question: "What are the interest rates and fees?",
        answer: "Our rates start as low as 10% APR depending on the loan type and your profile. We have no hidden fees, no application fees, and no prepayment penalties. All costs are clearly disclosed upfront."
      },
      {
        question: "Are there any hidden fees?",
        answer: "No hidden fees whatsoever! We believe in complete transparency. All fees are clearly disclosed during the application process, and you'll see the exact amount you'll pay before accepting the loan."
      },
      {
        question: "Can I pay off my loan early?",
        answer: "Yes! There are no prepayment penalties. You can pay off your loan early at any time and save on interest charges. We encourage early repayment when possible."
      }
    ]
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    questions: [
      {
        question: "Is my personal information secure?",
        answer: "Absolutely. We use bank-level encryption and security measures to protect your personal and financial information. We're fully compliant with all data protection regulations."
      },
      {
        question: "How do you protect my data?",
        answer: "We use 256-bit SSL encryption, secure data centers, and strict access controls. Your information is never sold to third parties and is only used for loan processing and customer service."
      },
      {
        question: "What happens to my information after I apply?",
        answer: "Your information is securely stored and only used for loan processing, customer service, and regulatory compliance. We never sell your personal information to third parties."
      }
    ]
  },
  {
    id: 'payments',
    title: 'Payments & Repayment',
    questions: [
      {
        question: "How do I make payments?",
        answer: "Payments are automatically deducted from your bank account on your scheduled due date. You can also make manual payments through your online account or by calling our customer service."
      },
      {
        question: "What happens if I miss a payment?",
        answer: "We understand that life happens. If you're having trouble making a payment, contact us immediately. We offer flexible payment options and will work with you to find a solution that fits your situation."
      },
      {
        question: "Can I change my payment date?",
        answer: "Yes! You can change your payment date up to 3 days before your scheduled payment. Contact our customer service team to make this change."
      }
    ]
  }
];

export default function FAQs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set());
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    name: '',
    email: '',
    category: '',
    question: ''
  });

  // Filter questions based on search term and selected category
  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const displayedCategories = selectedCategory 
    ? filteredCategories.filter(cat => cat.id === selectedCategory)
    : filteredCategories;

  const toggleQuestion = (questionId: string) => {
    const newOpenQuestions = new Set(openQuestions);
    if (newOpenQuestions.has(questionId)) {
      newOpenQuestions.delete(questionId);
    } else {
      newOpenQuestions.add(questionId);
    }
    setOpenQuestions(newOpenQuestions);
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Submitted question:', submitForm);
    alert('Thank you for your question! We\'ll get back to you within 24 hours.');
    setSubmitForm({ name: '', email: '', category: '', question: '' });
    setShowSubmitForm(false);
  };

  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-cyan-600 to-cyan-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 sm:mb-8">
            Frequently Asked Questions
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-cyan-100 max-w-4xl mx-auto mb-8 sm:mb-12">
            Everything you need to know about QuickFund's lending services
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-lg shadow-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-slate-900 placeholder-slate-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-8 sm:py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === null
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{category.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {searchTerm && (
            <div className="mb-8">
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-6">
                <h3 className="text-cyan-900 font-semibold mb-2">Search Results</h3>
                <p className="text-cyan-800 text-sm">
                  Found {filteredCategories.reduce((total, cat) => total + cat.questions.length, 0)} matching questions for "{searchTerm}"
                </p>
              </div>
              
              {/* Quick Search Results */}
              <div className="space-y-3 mb-8">
                {filteredCategories.slice(0, 3).map((category) => 
                  category.questions.map((faq, index) => (
                    <div key={`${category.id}-${index}`} className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors duration-200">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-slate-900 mb-1">{faq.question}</h4>
                          <p className="text-xs text-slate-600 line-clamp-2">{faq.answer.substring(0, 120)}...</p>
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full">
                              {category.title}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="space-y-8 sm:space-y-12">
            {displayedCategories.map((category) => (
              <div key={category.id} className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 flex items-center gap-3">
                  <span className="w-1 h-6 bg-cyan-600 rounded-full"></span>
                  <span>{category.title}</span>
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  {category.questions.map((faq, index) => {
                    const questionId = `${category.id}-${index}`;
                    const isOpen = openQuestions.has(questionId);
                    
                    return (
                      <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleQuestion(questionId)}
                          className="w-full px-6 sm:px-8 py-4 sm:py-6 text-left bg-white hover:bg-slate-50 focus:bg-slate-50 transition-colors duration-200 flex items-center justify-between"
                        >
                          <div className="flex items-start gap-4">
                            <span className="text-cyan-600 font-bold text-sm sm:text-base">Q:</span>
                            <h3 className="text-base sm:text-lg font-semibold text-slate-900 pr-4">
                              {faq.question}
                            </h3>
                          </div>
                          <ChevronDownIcon 
                            className={`w-5 h-5 sm:w-6 sm:h-6 text-slate-500 transition-transform duration-200 flex-shrink-0 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <div className="px-6 sm:px-8 pb-4 sm:pb-6">
                            <div className="flex items-start gap-4">
                              <span className="text-cyan-600 font-bold text-sm sm:text-base">A:</span>
                              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {filteredCategories.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">No questions found for "{searchTerm}"</p>
              <button
                onClick={() => setShowSubmitForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors duration-200"
              >
                <PlusIcon className="w-5 h-5" />
                Submit Your Question
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Submit Question Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 sm:mb-6">
            Still Have Questions?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 sm:mb-12 max-w-2xl mx-auto">
            Can't find what you're looking for? Submit your question and we'll get back to you within 24 hours.
          </p>
          
          {!showSubmitForm ? (
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <button
                onClick={() => setShowSubmitForm(true)}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 focus:bg-cyan-700 active:bg-cyan-800 hover:scale-105 focus:scale-105 active:scale-95 hover:shadow-lg focus:shadow-lg active:shadow-md transition-all duration-300 touch-manipulation select-none"
              >
                <PlusIcon className="w-5 h-5" />
                Submit Your Question
              </button>
              <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-cyan-600 text-cyan-600 font-semibold rounded-lg hover:bg-cyan-600 hover:text-white focus:bg-cyan-600 focus:text-white active:bg-cyan-700 active:text-white hover:scale-105 focus:scale-105 active:scale-95 transition-all duration-300 touch-manipulation select-none">
                Contact Support
              </button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmitQuestion} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={submitForm.name}
                      onChange={(e) => setSubmitForm({...submitForm, name: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={submitForm.email}
                      onChange={(e) => setSubmitForm({...submitForm, email: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select
                    id="category"
                    required
                    value={submitForm.category}
                    onChange={(e) => setSubmitForm({...submitForm, category: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="">Select a category</option>
                    {faqCategories.map((category) => (
                      <option key={category.id} value={category.id}>{category.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-slate-700 mb-2">Your Question</label>
                  <textarea
                    id="question"
                    required
                    rows={4}
                    value={submitForm.question}
                    onChange={(e) => setSubmitForm({...submitForm, question: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Please describe your question in detail..."
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    type="submit"
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 focus:bg-cyan-700 active:bg-cyan-800 hover:scale-105 focus:scale-105 active:scale-95 hover:shadow-lg focus:shadow-lg active:shadow-md transition-all duration-300 touch-manipulation select-none"
                  >
                    Submit Question
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubmitForm(false)}
                    className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 focus:bg-slate-50 active:bg-slate-100 transition-all duration-300 touch-manipulation select-none"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
} 