'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

/**
 * Session context type definition
 */
export interface SessionContextType {
  // Session data
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // User information
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  subscriptionTier: string;

  // Utility functions
  hasMinimumTier: (requiredTier: string) => boolean;
  refresh: () => Promise<Session | null>;
}

/**
 * Session context
 */
const SessionContext = createContext<SessionContextType | undefined>(undefined);

/**
 * Props for SessionContextProvider
 */
interface SessionContextProviderProps {
  children: ReactNode;
}

/**
 * Subscription tier hierarchy for access control
 */
const SUBSCRIPTION_TIERS = ['free', 'basic', 'premium', 'pro', 'enterprise'];

/**
 * Session context provider component
 */
export function SessionContextProvider({ children }: SessionContextProviderProps) {
  const { data: session, status, update } = useSession();

  // Extract user information
  const userId = session?.user ? (session.user as any).id || null : null;
  const userEmail = session?.user?.email || null;
  const userName = session?.user?.name || null;
  const subscriptionTier = session?.user ?
    (session.user as any).subscriptionTier || 'free' : 'free';

  // Check if user has minimum subscription tier
  const hasMinimumTier = (requiredTier: string): boolean => {
    if (!session) return false;

    const userTierIndex = SUBSCRIPTION_TIERS.indexOf(subscriptionTier);
    const requiredTierIndex = SUBSCRIPTION_TIERS.indexOf(requiredTier);

    return userTierIndex >= requiredTierIndex;
  };

  // Refresh session data
  const refresh = async (): Promise<Session | null> => {
    const result = await update();
    return result || null;
  };

  const contextValue: SessionContextType = {
    session,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    userId,
    userEmail,
    userName,
    subscriptionTier,
    hasMinimumTier,
    refresh,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * Hook to use session context
 */
export function useSessionContext(): SessionContextType {
  const context = useContext(SessionContext);

  if (context === undefined) {
    throw new Error('useSessionContext must be used within a SessionContextProvider');
  }

  return context;
}

/**
 * HOC to wrap components with session context requirement
 */
export function withSessionContext<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WrappedComponent(props: P) {
    return (
      <SessionContextProvider>
        <Component {...props} />
      </SessionContextProvider>
    );
  };
}
