'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AuthUser,
  clearSession,
  getCachedUser,
  getToken,
  isTokenValid,
  logout as apiLogout,
} from '@/lib/api/auth';

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isTokenValid()) {
      setUser(getCachedUser());
    } else {
      clearSession();
      if (requireAuth) {
        router.push('/auth/login');
      }
    }
    setLoading(false);
  }, [requireAuth, router]);

  const logout = async () => {
    await apiLogout();
    setUser(null);
    router.push('/auth/login');
  };

  return { user, loading, logout };
}
