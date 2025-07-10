'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_TIERS, DEFAULT_NOTIFICATION_PREFERENCES, VALIDATION_RULES, type SubscriptionTier } from './constants';
import { updateUser } from '@/lib/api/users';

interface SettingsProps {}

interface NotificationPreferences {
  email: boolean;
  combat: boolean;
  encounters: boolean;
  weeklyDigest: boolean;
  productUpdates: boolean;
  securityAlerts: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
}

export function Settings({}: SettingsProps) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // Form state
  const [profileData, setProfileData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
  });
  
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(session?.user?.notifications || {}),
  });

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (status !== 'authenticated' || !session?.user) {
    return null;
  }

  const currentTier = (session.user.subscriptionTier as SubscriptionTier) || 'free';
  const tierInfo = SUBSCRIPTION_TIERS[currentTier];

  const validateForm = (data: typeof profileData): FormErrors => {
    const errors: FormErrors = {};

    if (!data.name || data.name.trim().length < VALIDATION_RULES.name.minLength) {
      errors.name = 'Name is required';
    }

    if (!data.email || !VALIDATION_RULES.email.pattern.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    return errors;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const errors = validateForm(profileData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoadingProfile(true);

    try {
      await updateUser(session.user.id, {
        name: profileData.name,
        email: profileData.email,
      });
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoadingNotifications(true);

    try {
      await updateUser(session.user.id, {
        notifications,
      });
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleNotificationChange = (key: keyof NotificationPreferences) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div data-testid="settings-container" className="space-y-6">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div data-testid="settings-grid" className="grid gap-6 lg:grid-cols-2">
        {/* User Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Update your personal information and account details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isLoadingProfile}
                />
                {formErrors.name && (
                  <p className="text-sm text-destructive">{formErrors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={isLoadingProfile}
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>
              
              <Button type="submit" disabled={isLoadingProfile}>
                {isLoadingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Manage how you receive updates and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNotificationsSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email notifications</Label>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={() => handleNotificationChange('email')}
                    disabled={isLoadingNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="combat-reminders">Combat reminders</Label>
                  <Switch
                    id="combat-reminders"
                    checked={notifications.combat}
                    onCheckedChange={() => handleNotificationChange('combat')}
                    disabled={isLoadingNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="encounter-updates">Encounter updates</Label>
                  <Switch
                    id="encounter-updates"
                    checked={notifications.encounters}
                    onCheckedChange={() => handleNotificationChange('encounters')}
                    disabled={isLoadingNotifications}
                  />
                </div>
              </div>
              
              <Button type="submit" disabled={isLoadingNotifications}>
                {isLoadingNotifications ? 'Saving...' : 'Save Notifications'}
              </Button>
            </form>
          </CardContent>
        </Card>

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
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Management */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Management</CardTitle>
            <CardDescription>Manage your subscription and billing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div data-testid="current-subscription-tier">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{tierInfo.name}</h4>
                    <p className="text-sm text-muted-foreground">{tierInfo.price}/{tierInfo.period}</p>
                  </div>
                  <Badge variant="secondary">{currentTier === 'free' ? 'Free' : 'Premium'}</Badge>
                </div>
              </div>
              
              <Separator />
              
              <div data-testid="subscription-features">
                <p className="font-medium mb-2">Your plan includes:</p>
                <ul className="text-sm space-y-1">
                  {tierInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              {currentTier === 'free' && (
                <Button onClick={() => setShowUpgradeModal(true)}>
                  Upgrade Plan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>Manage your account security and authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                Change Password
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Modal */}
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

      {/* Change Password Modal */}
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

      {/* Delete Account Modal */}
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