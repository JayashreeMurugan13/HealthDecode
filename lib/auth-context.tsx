"use client";

import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  dateOfBirth?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  profileImage?: string;
  healthScore?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => void;
  signup: (email: string, password: string, name: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    if (typeof window !== 'undefined') {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          setUser(JSON.parse(currentUser));
        }
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = (email: string, password: string) => {
    try {
      const usersData = localStorage.getItem('users');
      const users = usersData ? JSON.parse(usersData) : [];
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      setUser(user);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const signup = (email: string, password: string, name: string) => {
    try {
      const usersData = localStorage.getItem('users');
      const users = usersData ? JSON.parse(usersData) : [];
      
      if (users.find((u: any) => u.email === email)) {
        throw new Error('User already exists');
      }
      
      const newUser = { email, password, name, id: Date.now().toString() };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setUser(newUser);
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Update in users array
    const usersData = localStorage.getItem('users');
    const users = usersData ? JSON.parse(usersData) : [];
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, isLoading }}>
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