'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import type { User } from '@/types/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await authApi.whoami();
      setUser(userData);
    } catch {
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { access_token, user } = await authApi.login(email, password);
    localStorage.setItem('token', access_token);
    setUser(user);
    router.push('/tournaments');
  };

  const signup = async (email: string, password: string, username: string) => {
    const { access_token, user } = await authApi.signup(email, password, username);
    localStorage.setItem('token', access_token);
    setUser(user);
    router.push('/tournaments');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
