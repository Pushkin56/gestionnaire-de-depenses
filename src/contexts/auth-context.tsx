
"use client";

import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, username?: string) => void; // username for signup then login
  signup: (username: string, email: string) => void;
  logout: () => void;
  updateUserPreferences: (prefs: Partial<Pick<User, 'primary_currency' | 'username' | 'aiBudgetAlertsEnabled' | 'aiForecastEnabled' | 'aiInsightsEnabled'>>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking auth state from localStorage or a cookie
    const storedUser = localStorage.getItem('budgetbento_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Ensure new AI preference fields have default values if not present
      setUser({
        ...parsedUser, // Spread existing user data first
        aiBudgetAlertsEnabled: parsedUser.aiBudgetAlertsEnabled ?? true,
        aiForecastEnabled: parsedUser.aiForecastEnabled ?? true,
        aiInsightsEnabled: parsedUser.aiInsightsEnabled ?? true, // Initialize new combined preference
        // Remove old individual preferences if they exist from older versions
        ...(parsedUser.hasOwnProperty('aiTrendAnalysisEnabled') ? { aiTrendAnalysisEnabled: undefined } : {}),
        ...(parsedUser.hasOwnProperty('aiHabitAnalysisEnabled') ? { aiHabitAnalysisEnabled: undefined } : {}),
      });
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, usernameFromSignup?: string) => {
    const mockUser: User = {
      id: 'mock-user-id-' + Date.now(),
      email,
      username: usernameFromSignup || email.split('@')[0] || 'Utilisateur Anonyme',
      primary_currency: 'EUR', // Default primary currency
      aiBudgetAlertsEnabled: true, 
      aiForecastEnabled: true,     
      aiInsightsEnabled: true, // Default for new combined preference
    };
    localStorage.setItem('budgetbento_user', JSON.stringify(mockUser));
    setUser(mockUser);
    router.push('/dashboard');
  };

  const signup = (username: string, email: string) => {
    // In a real app, this would hit a backend API. Here, we just log in.
    login(email, username);
  };

  const logout = () => {
    localStorage.removeItem('budgetbento_user');
    setUser(null);
    router.push('/auth');
  };

  const updateUserPreferences = (prefs: Partial<User>) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      const updatedUser = { ...currentUser, ...prefs };
      // Clean up old properties if they somehow make it through
      delete (updatedUser as any).aiTrendAnalysisEnabled;
      delete (updatedUser as any).aiHabitAnalysisEnabled;
      localStorage.setItem('budgetbento_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout, updateUserPreferences }}>
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

    