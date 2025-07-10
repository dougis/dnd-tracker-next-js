'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { AppLayout } from './AppLayout';

interface AuthenticatedPageProps {
  children: React.ReactNode;
  loadingMessage?: string;
  unauthenticatedMessage?: string;
}

export function AuthenticatedPage({
  children,
  loadingMessage = 'Loading...',
  unauthenticatedMessage = 'Please sign in to access this page.'
}: AuthenticatedPageProps) {
  const { status } = useSession();

  return (
    <AppLayout>
      {status === 'loading' && (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{loadingMessage}</div>
        </div>
      )}

      {status === 'unauthenticated' && (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{unauthenticatedMessage}</div>
        </div>
      )}

      {status === 'authenticated' && children}
    </AppLayout>
  );
}