"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteLayout from "@/components/layout/SiteLayout";
import TermsModal from "@/components/ui/TermsModal";
import SuccessModal from "@/components/ui/SuccessModal";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import type { EmploymentStatus } from '@/lib/types/auth';
import { useAuthStore } from '@/lib/stores/authStore';

export default function Signup() {
  const router = useRouter();
  const { register, isLoading, error, success, clearError, clearSuccess } = useAuthStore();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nigeria',
    employmentStatus: '' as EmploymentStatus | '',
    employerName: '',
    monthlyIncome: '',
    agreeToTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields for loan eligibility
    if (!formData.employmentStatus || !formData.monthlyIncome) {
      alert('Employment status and monthly income are required for loan eligibility.');
      return;
    }

    // Validate terms agreement
    if (!formData.agreeToTerms) {
      alert('You must agree to the Terms of Service to continue.');
      return;
    }

    // Validate password requirements
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    // Validate phone number format if provided
    if (formData.phone && !/^\+[1-9]\d{1,14}$/.test(formData.phone)) {
      alert('Phone number must be in international format (e.g., +2348012345678)');
      return;
    }

    // Validate name lengths
    if (formData.firstName.length < 2 || formData.lastName.length < 2) {
      alert('First name and last name must be at least 2 characters long');
      return;
    }

    // Validate address length if provided
    if (formData.address && formData.address.length < 5) {
      alert('Address must be at least 5 characters long');
      return;
    }

    // Prepare data for API (remove empty strings, convert types)
    const apiData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      zipCode: formData.zipCode || undefined,
      country: formData.country || undefined,
      employmentStatus: formData.employmentStatus as EmploymentStatus,
      employerName: formData.employerName || undefined,
      monthlyIncome: parseFloat(formData.monthlyIncome),
      agreeToTerms: formData.agreeToTerms
    };
    
    try {
      await register(apiData);
      // Success modal will show automatically via the store
    } catch (error: any) {
      // Error is handled by the store, just log for debugging
      console.error('Registration error:', error);
    }
  };

  const handleSuccessClose = () => {
    clearSuccess();
    // Redirect to login after registration success modal closes
    router.push('/login');
  };

  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-cyan-600 to-cyan-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 sm:mb-8">
            Get Started with QuickFund
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-cyan-100 max-w-4xl mx-auto">
            Create your account and start your journey to financial freedom in minutes
          </p>
        </div>
      </section>

      {/* Signup Form Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                Create Your Account
              </h2>
              <p className="text-slate-600">
                Already have an account?{' '}
                <Link href="/login" className="text-cyan-600 hover:text-cyan-700 font-semibold">
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    minLength={2}
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    minLength={2}
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="john.doe@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  pattern="^\+[1-9]\d{1,14}$"
                  title="Phone number must be in international format (e.g., +2348012345678)"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="+2348012345678"
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Address Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    minLength={5}
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    placeholder="Lagos"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    placeholder="Lagos State"
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-slate-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    placeholder="100001"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Nigeria"
                />
              </div>

              {/* Employment Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="employmentStatus" className="block text-sm font-medium text-slate-700 mb-2">
                    Employment Status *
                  </label>
                  <select
                    id="employmentStatus"
                    name="employmentStatus"
                    required
                    value={formData.employmentStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  >
                    <option value="">Select employment status</option>
                    <option value="EMPLOYED">Employed</option>
                    <option value="SELF_EMPLOYED">Self Employed</option>
                    <option value="UNEMPLOYED">Unemployed</option>
                    <option value="STUDENT">Student</option>
                    <option value="RETIRED">Retired</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="monthlyIncome" className="block text-sm font-medium text-slate-700 mb-2">
                    Monthly Income (₦) *
                  </label>
                  <input
                    type="number"
                    id="monthlyIncome"
                    name="monthlyIncome"
                    required
                    min="0"
                    step="1000"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    placeholder="150000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="employerName" className="block text-sm font-medium text-slate-700 mb-2">
                  Employer Name
                </label>
                <input
                  type="text"
                  id="employerName"
                  name="employerName"
                  value={formData.employerName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Company Name"
                />
              </div>

              {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPassword(!showPassword);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-slate-600">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTermsModal(true);
                      }}
                      className="text-cyan-600 hover:text-cyan-700 font-semibold underline"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-cyan-600 hover:text-cyan-700 font-semibold">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-4 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 focus:bg-cyan-700 active:bg-cyan-800 hover:scale-105 focus:scale-105 active:scale-95 hover:shadow-lg focus:shadow-lg active:shadow-md transition-all duration-300 touch-manipulation select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="text-center text-sm text-slate-500">
                By creating an account, you agree to our{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTermsModal(true);
                  }}
                  className="text-cyan-600 hover:text-cyan-700 underline"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <Link href="/privacy" className="text-cyan-600 hover:text-cyan-700">
                  Privacy Policy
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Terms Modal */}
      <TermsModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={!!success}
        onClose={handleSuccessClose}
        title="Account Created Successfully!"
        message="Welcome to QuickFund! Your account has been created. Please sign in to access your dashboard and start applying for loans."
        actionText="Sign In Now"
        onAction={() => router.push('/login')}
        autoClose={true}
        autoCloseDelay={4000}
      />
    </SiteLayout>
  );
} 