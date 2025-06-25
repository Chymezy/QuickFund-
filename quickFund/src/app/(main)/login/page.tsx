"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteLayout from "@/components/layout/SiteLayout";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/stores/authStore';
import SuccessModal from '@/components/ui/SuccessModal';

export default function Login() {
  const router = useRouter();
  const { login, isLoading, error, success, clearError, clearSuccess, user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    clearError();
    clearSuccess();
    // If you have any session restore logic, you can also disable it here
    // e.g. set a flag in your AuthProvider to skip auto-refresh on this page
  }, [clearError, clearSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? e.target.checked : undefined;
    
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
    
    try {
      await login(formData);
      // Success modal will show automatically via the store
    } catch (error: any) {
      // Error is handled by the store, just log for debugging
      console.error('Login error:', error);
    }
  };

  const handleSuccessClose = () => {
    clearSuccess();
    // Redirect to the correct dashboard based on user role after success modal closes
    if (user?.role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/user');
    }
  };

  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-cyan-600 to-cyan-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 sm:mb-8">
            Welcome Back
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-cyan-100 max-w-4xl mx-auto">
            Sign in to your QuickFund account to manage your loans and applications
          </p>
        </div>
      </section>

      {/* Login Form Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                Sign In
              </h2>
              <p className="text-slate-600">
                Don't have an account?{' '}
                <Link href="/signup" className="text-cyan-600 hover:text-cyan-700 font-semibold">
                  Create one here
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
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
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
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    required
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

              <div className="flex items-center justify-between">
                <Link
                  href="/forgot-password"
                  className="text-sm text-cyan-600 hover:text-cyan-700 font-semibold"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-4 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 focus:bg-cyan-700 active:bg-cyan-800 hover:scale-105 focus:scale-105 active:scale-95 hover:shadow-lg focus:shadow-lg active:shadow-md transition-all duration-300 touch-manipulation select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 focus:bg-slate-50 active:bg-slate-100 transition-colors duration-200"
                >
                  Google
                </button>
                <button
                  type="button"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 focus:bg-slate-50 active:bg-slate-100 transition-colors duration-200"
                >
                  Apple
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-4">
                  Having trouble signing in?
                </p>
                <div className="space-y-2">
                  <Link
                    href="/contact"
                    className="block text-sm text-cyan-600 hover:text-cyan-700 font-semibold"
                  >
                    Contact Support
                  </Link>
                  <Link
                    href="/help"
                    className="block text-sm text-cyan-600 hover:text-cyan-700 font-semibold"
                  >
                    Help Center
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      <SuccessModal
        isOpen={!!success}
        onClose={handleSuccessClose}
        title="Login Successful!"
        message="Welcome back to QuickFund. You're now signed in to your account."
        actionText="Go to Dashboard"
        onAction={() => {
          if (user?.role === 'ADMIN') {
            router.push('/admin');
          } else {
            router.push('/user');
          }
        }}
        autoClose={true}
        autoCloseDelay={3000}
      />
    </SiteLayout>
  );
} 