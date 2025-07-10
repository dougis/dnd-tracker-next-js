'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useSettingsForm } from './hooks/useSettingsForm';
import { ProfileSection } from './components/ProfileSection';
import { NotificationsSection } from './components/NotificationsSection';
import { SubscriptionSection } from './components/SubscriptionSection';
import { SecuritySection } from './components/SecuritySection';
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

        {/* Theme & Display */}
        <Card>
          <CardHeader>
            <CardTitle>Theme & Display</CardTitle>
            <CardDescription>Customize your application appearance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label>Theme</label>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </CardContent>
        </Card>

        <SubscriptionSection
          currentTier={currentTier}
          onUpgradeClick={() => setShowUpgradeModal(true)}
        />

        <SecuritySection
          onChangePasswordClick={() => setShowPasswordModal(true)}
          onDeleteAccountClick={() => setShowDeleteModal(true)}
        />
      </div>

      {/* Modals - Simplified for now */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Choose Your Plan</CardTitle>
              <CardDescription>Upgrade to unlock more features</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Plan upgrade functionality coming soon!</p>
              <Button onClick={() => setShowUpgradeModal(false)} className="mt-4">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Password change functionality coming soon!</p>
              <Button onClick={() => setShowPasswordModal(false)} className="mt-4">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Delete Account</CardTitle>
              <CardDescription>This action cannot be undone</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-destructive mb-4">
                Are you sure you want to delete your account? All your data will be permanently removed.
              </p>
              <div className="flex gap-4">
                <Button variant="destructive">Confirm Delete</Button>
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}