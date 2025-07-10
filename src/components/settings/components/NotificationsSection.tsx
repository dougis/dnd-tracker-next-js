import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { NotificationPreferences } from '@/types/auth';

interface NotificationsSectionProps {
  notifications: NotificationPreferences;
  onNotificationChange: (_key: keyof NotificationPreferences) => void;
  isLoadingNotifications: boolean;
  onSubmit: (_e: React.FormEvent) => void;
}

export function NotificationsSection({
  notifications,
  onNotificationChange,
  isLoadingNotifications,
  onSubmit,
}: NotificationsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how you receive updates and alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email notifications</Label>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={() => onNotificationChange('email')}
                disabled={isLoadingNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="combat-reminders">Combat reminders</Label>
              <Switch
                id="combat-reminders"
                checked={notifications.combat}
                onCheckedChange={() => onNotificationChange('combat')}
                disabled={isLoadingNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="encounter-updates">Encounter updates</Label>
              <Switch
                id="encounter-updates"
                checked={notifications.encounters}
                onCheckedChange={() => onNotificationChange('encounters')}
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
  );
}