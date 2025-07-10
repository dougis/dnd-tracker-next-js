import { useState } from 'react';
import { updateUser } from '@/lib/api/users';
import { NotificationPreferences } from '@/types/auth';
import { validateProfileForm, type ProfileData, type FormErrors } from './useFormValidation';

interface Message {
  type: 'success' | 'error';
  text: string;
}

export function useFormSubmission(userId: string) {
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleProfileSubmit = async (profileData: ProfileData) => {
    setMessage(null);
    setFormErrors({});

    const errors = validateProfileForm(profileData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoadingProfile(true);

    try {
      await updateUser(userId, {
        name: profileData.name,
        email: profileData.email,
      });
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleNotificationsSubmit = async (notifications: NotificationPreferences) => {
    setMessage(null);
    setIsLoadingNotifications(true);

    try {
      await updateUser(userId, { notifications });
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  return {
    isLoadingProfile,
    isLoadingNotifications,
    message,
    formErrors,
    handleProfileSubmit,
    handleNotificationsSubmit,
  };
}