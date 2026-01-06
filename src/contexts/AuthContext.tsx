/* eslint-disable react-refresh/only-export-components */
import { fetchUserAttributes } from 'aws-amplify/auth';
import { fetchAuthSession } from 'aws-amplify/auth';
import { signIn, signUp, signOut, getCurrentUser } from 'aws-amplify/auth';
import React, { createContext, useState, useEffect } from 'react';
import { User } from '@/types';

/**
 * Authentication context type definition
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
}

/**
 * Authentication context
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

function getRoleFromSession(session: Awaited<ReturnType<typeof fetchAuthSession>>): 'admin' | 'user' {
  const payload = session.tokens?.idToken?.payload;
  const groupsClaim = payload?.['cognito:groups'] as string[] | string | undefined;

  if (Array.isArray(groupsClaim)) {
    return groupsClaim.includes('Admins') ? 'admin' : 'user';
  }

  if (typeof groupsClaim === 'string') {
    // Bazı durumlarda "Admins,OtherGroup" şeklinde gelebilir
    return groupsClaim.split(',').map((s) => s.trim()).includes('Admins') ? 'admin' : 'user';
  }

  return 'user';
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        const attrs = await fetchUserAttributes();
        const session = await fetchAuthSession();
        const role = getRoleFromSession(session);

        setUser({
          id: currentUser.userId,
          email: attrs.email ?? '',
          name: attrs.name ?? currentUser.username,
          role,
          createdAt: new Date().toISOString(),
        });
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { isSignedIn } = await signIn({ username: email, password });

      if (isSignedIn) {
        const currentUser = await getCurrentUser();
        const attrs = await fetchUserAttributes();
        const session = await fetchAuthSession();
        const role = getRoleFromSession(session);

        setUser({
          id: currentUser.userId,
          email: attrs.email ?? email,
          name: attrs.name ?? currentUser.username,
          role,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
