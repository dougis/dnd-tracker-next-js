'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Settings } from '@/components/settings';
import { LoadingState, UnauthenticatedState, SettingsContent } from './components/SettingsPageStates';

export default function SettingsPage() {
  const { data: session, status } = useSession();

  const renderContent = () => {
    if (status === 'loading') {
      return <LoadingState />;
    }

    if (status === 'unauthenticated' || !session?.user?.id) {
      return <UnauthenticatedState />;
    }

    return (
      <SettingsContent>
        <Settings />
      </SettingsContent>
    );
  };

  return (
    <AppLayout>
      {renderContent()}
    </AppLayout>
  );
}