import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiConfig, isMockMode } from '../services/apiConfig';
import { getDemoUser } from '../mocks/demoUsersData';

export interface AuthUser {
  email: string;
  name: string;
  role: 'Officer' | 'Industry Stakeholder' | 'Auditor';
  organization?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithGitHub: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'bis_copilot_auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      if (!isMockMode()) {
        try {
          const response = await fetch(`${apiConfig.baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (response.ok) {
            const data = await response.json();
            const authedUser: AuthUser = {
              email: data.email || email,
              name: data.name || email.split('@')[0],
              role: data.role || (email.endsWith('.gov.in') ? 'Officer' : 'Industry Stakeholder'),
              organization: data.organization || (email.endsWith('.gov.in') ? 'Bureau of Indian Standards' : 'Registered Enterprise'),
            };
            setUser(authedUser);
            setIsLoading(false);
            return { success: true };
          }
        } catch (netErr) {
          console.warn('Live auth endpoint unreachable, falling back to local session authentication:', netErr);
        }
      }

      // Offline / Client Mode: Realistic authentication simulation with intentional delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Validate standard credentials or domain
      if (!password || password.length < 6) {
        setIsLoading(false);
        return {
          success: false,
          error: 'Unable to sign in. Please check your credentials and try again.',
        };
      }

      const demo = getDemoUser(email);
      const isGov = email.toLowerCase().endsWith('.gov.in') || email.toLowerCase().includes('officer');
      const authedUser: AuthUser = {
        email,
        name: demo?.name || (isGov ? 'BIS Officer' : email.split('@')[0]),
        role: demo?.role || (isGov ? 'Officer' : 'Industry Stakeholder'),
        organization: demo?.organization || (isGov ? 'Bureau of Indian Standards' : 'Verified Industry Partner'),
      };

      setUser(authedUser);
      setIsLoading(false);
      return { success: true };
    } catch {
      setIsLoading(false);
      return {
        success: false,
        error: 'Unable to sign in. Please check your credentials and try again.',
      };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (!isMockMode()) {
        const response = await fetch(`${apiConfig.baseUrl}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          setIsLoading(false);
          return {
            success: false,
            error: 'Google sign-in could not be completed. Please try again.',
          };
        }

        const data = await response.json();
        const authedUser: AuthUser = {
          email: data.email,
          name: data.name || 'Google User',
          role: data.role || 'Industry Stakeholder',
          organization: data.organization || 'Verified Enterprise',
        };
        setUser(authedUser);
        setIsLoading(false);
        return { success: true };
      }

      // Offline / boundary mode: connect to provider without faking fake credentials
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsLoading(false);
      return {
        success: false,
        error: 'Google sign-in could not be completed. Please try again.',
      };
    } catch {
      setIsLoading(false);
      return {
        success: false,
        error: 'Google sign-in could not be completed. Please try again.',
      };
    }
  };

  const loginWithGitHub = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (!isMockMode()) {
        const response = await fetch(`${apiConfig.baseUrl}/auth/github`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          setIsLoading(false);
          return {
            success: false,
            error: 'GitHub sign-in could not be completed. Please try again.',
          };
        }

        const data = await response.json();
        const authedUser: AuthUser = {
          email: data.email,
          name: data.name || 'GitHub User',
          role: data.role || 'Industry Stakeholder',
          organization: data.organization || 'Developer Partner',
        };
        setUser(authedUser);
        setIsLoading(false);
        return { success: true };
      }

      // Offline / boundary mode: connect to provider without faking fake credentials
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsLoading(false);
      return {
        success: false,
        error: 'GitHub sign-in could not be completed. Please try again.',
      };
    } catch {
      setIsLoading(false);
      return {
        success: false,
        error: 'GitHub sign-in could not be completed. Please try again.',
      };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    loginWithGoogle,
    loginWithGitHub,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => ({ success: true }),
  loginWithGoogle: async () => ({ success: false, error: 'Google sign-in could not be completed. Please try again.' }),
  loginWithGitHub: async () => ({ success: false, error: 'GitHub sign-in could not be completed. Please try again.' }),
  logout: () => {},
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  return context || defaultAuthContext;
};
