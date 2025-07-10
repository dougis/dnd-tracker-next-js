'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Settings } from '@/components/settings';

export default function SettingsPage() {
  const { data: session, status } = useSession();

  return (
    <AppLayout>
      {status === 'loading' && (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      )}

      {(status === 'unauthenticated' || (status === 'authenticated' && !session?.user?.id)) && (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Please sign in to access your settings.</div>
        </div>
      )}

      {status === 'authenticated' && session?.user?.id && (
        <main className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and preferences
            </p>
          </header>

          <Settings />
        </main>
      )}
    </AppLayout>
  );
}