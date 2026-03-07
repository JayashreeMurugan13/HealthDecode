"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { clientAuth } from './client-auth';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const currentUser = clientAuth.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const user = clientAuth.login(email, password);
      setUser(user);
      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const user = clientAuth.signup(email, password, name);
      setUser(user);
      return { success: true, message: 'Account created successfully' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    clientAuth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}