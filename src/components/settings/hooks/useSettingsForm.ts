import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../constants';
import { NotificationPreferences } from '@/types/auth';
import { useFormSubmission } from './useFormSubmission';

export function useSettingsForm() {
  const { data: session } = useSession();

  const [profileData, setProfileData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(session?.user?.notifications || {}),
  });

  const {
    isLoadingProfile,
    isLoadingNotifications,
    message,
    formErrors,
    handleProfileSubmit: submitProfile,
    handleNotificationsSubmit: submitNotifications,
  } = useFormSubmission(session?.user?.id || '');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitProfile(profileData);
  };

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitNotifications(notifications);
  };

  const handleNotificationChange = (key: keyof NotificationPreferences) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return {
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
  };
}