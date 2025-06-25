"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Attempt to restore session using refresh token (HTTP-only cookie)
        await initialize();
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Silent fail - user will need to login again
      }
    };

    initAuth();
  }, [initialize]);

  return <>{children}</>;
} 