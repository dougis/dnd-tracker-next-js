'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { SUBSCRIPTION_TIERS, hasRequiredTier, getUserTier, getUserId, getUserEmail } from './session-shared';

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
  // eslint-disable-next-line no-unused-vars
  hasMinimumTier: (_requiredTier: string) => boolean;
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
 * Extract user information from session
 */
function extractUserInfo(session: Session | null) {
  return {
    userId: session?.user ? getUserId(session.user) : null,
    userEmail: session?.user ? getUserEmail(session.user) : null,
    userName: session?.user?.name || null,
    subscriptionTier: session?.user ? getUserTier(session.user) : 'free',
  };
}

/**
 * Create tier checking function
 */
function createTierChecker(session: Session | null, userTier: string) {
  return (requiredTier: string): boolean => {
    if (!session) return false;
    return hasRequiredTier(userTier, requiredTier);
  };
}

/**
 * Create session refresh function
 */
function createRefreshFunction(update: any) {
  return async (): Promise<Session | null> => {
    const result = await update();
    return result || null;
  };
}

/**
 * Session context provider component
 */
export function SessionContextProvider({ children }: SessionContextProviderProps) {
  const { data: session, status, update } = useSession();
  const userInfo = extractUserInfo(session);
  const hasMinimumTier = createTierChecker(session, userInfo.subscriptionTier);
  const refresh = createRefreshFunction(update);

  const contextValue: SessionContextType = {
    session,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    ...userInfo,
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
