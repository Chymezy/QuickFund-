"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import AccessDeniedModal from '@/components/ui/AccessDeniedModal';
import type { UserRole } from '@/lib/types/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  fallback, 
  requiredRole,
  redirectTo = '/login'
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  useEffect(() => {
    // Give the AuthProvider time to initialize
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.push(redirectTo);
    } else if (isInitialized && !isLoading && requiredRole && user?.role !== requiredRole) {
      setShowAccessDenied(true);
    }
  }, [isAuthenticated, isLoading, isInitialized, router, requiredRole, user?.role, redirectTo]);

  const handleAccessDeniedClose = () => {
    setShowAccessDenied(false);
    // Redirect to appropriate dashboard based on user role
    if (user?.role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/user');
    }
  };

  // Show loading state while checking authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show fallback or redirect if not authenticated
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show access denied modal if user doesn't have required role
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <>
        <AccessDeniedModal
          isOpen={showAccessDenied}
          onClose={handleAccessDeniedClose}
          title="Access Denied"
          message={`This page requires ${requiredRole} privileges. You currently have ${user?.role} access.`}
          showHomeButton={true}
          showBackButton={false}
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Checking permissions...</p>
          </div>
        </div>
      </>
    );
  }

  // Render children if authenticated and has required role (if specified)
  return <>{children}</>;
} 