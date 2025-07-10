'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSettingsForm } from './hooks/useSettingsForm';
import { ProfileSection } from './components/ProfileSection';
import { NotificationsSection } from './components/NotificationsSection';
import { SubscriptionSection } from './components/SubscriptionSection';
import { SecuritySection } from './components/SecuritySection';
import { ThemeSection } from './components/ThemeSection';
import { UpgradeModal, PasswordModal, DeleteModal } from './components/SettingsModals';
import { type SubscriptionTier } from './constants';

export function Settings() {
  const { data: session, status } = useSession();
  const {
    profileData,
    setProfileData,
    notifications,
    handleNotificationChange,
    formErrors,
    message,
    isLoadingProfile,
    isLoadingNotifications,
    handleProfileSubmit,
    handleNotificationsSubmit,
  } = useSettingsForm();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (status !== 'authenticated' || !session?.user) {
    return null;
  }

  const currentTier = (session.user.subscriptionTier as SubscriptionTier) || 'free';

  return (
    <div data-testid="settings-container" className="space-y-6">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div data-testid="settings-grid" className="grid gap-6 lg:grid-cols-2">
        <ProfileSection
          profileData={profileData}
          setProfileData={setProfileData}
          formErrors={formErrors}
          isLoadingProfile={isLoadingProfile}
          onSubmit={handleProfileSubmit}
        />

        <NotificationsSection
          notifications={notifications}
          onNotificationChange={handleNotificationChange}
          isLoadingNotifications={isLoadingNotifications}
          onSubmit={handleNotificationsSubmit}
        />

        <ThemeSection />

        <SubscriptionSection
          currentTier={currentTier}
          onUpgradeClick={() => setShowUpgradeModal(true)}
        />

        <SecuritySection
          onChangePasswordClick={() => setShowPasswordModal(true)}
          onDeleteAccountClick={() => setShowDeleteModal(true)}
        />
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          // TODO: Implement account deletion
          setShowDeleteModal(false);
        }}
      />
    </div>
  );
}