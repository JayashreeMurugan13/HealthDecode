"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './types';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUser(user);
      } catch (error) {
        Cookies.remove('auth_token');
        localStorage.removeItem('user');
      }
    } else if (!token && storedUser) {
      localStorage.removeItem('user');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('Attempting login for:', email);
      
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      console.log('Login response status:', res.status);
      
      if (!res.ok) {
        const text = await res.text();
        console.log('Login error response:', text);
        try {
          const data = JSON.parse(text);
          return { success: false, message: data.error || 'Login failed' };
        } catch {
          console.error('Server error:', text);
          return { success: false, message: 'Server error. Please try again.' };
        }
      }
      
      const data = await res.json();
      console.log('Login successful, setting user data:', data);
      
      // Set cookie and localStorage
      Cookies.set('auth_token', data.token, { expires: 7 });
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Force update the user state
      setUser(data.user);
      
      // Small delay to ensure state is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include',
      });
      
      if (!res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          return { success: false, message: data.error || 'Signup failed' };
        } catch {
          console.error('Server error:', text);
          return { success: false, message: 'Server error. Please try again.' };
        }
      }
      
      const data = await res.json();
      Cookies.set('auth_token', data.token, { expires: 7 });
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      return { success: true, message: 'Account created successfully' };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    Cookies.remove('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
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
