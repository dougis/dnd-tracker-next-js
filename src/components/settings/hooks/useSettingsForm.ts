import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { updateUser } from '@/lib/api/users';
import { VALIDATION_RULES, DEFAULT_NOTIFICATION_PREFERENCES } from '../constants';
import { NotificationPreferences } from '@/types/auth';

interface FormErrors {
  name?: string;
  email?: string;
}

export function useSettingsForm() {
  const { data: session } = useSession();
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [profileData, setProfileData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(session?.user?.notifications || {}),
  });

  const validateForm = (data: typeof profileData): FormErrors => {
    const errors: FormErrors = {};

    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Name is required';
    } else if (data.name.trim().length < VALIDATION_RULES.name.minLength) {
      errors.name = `Name must be at least ${VALIDATION_RULES.name.minLength} characters`;
    }

    if (!data.email || data.email.trim().length === 0) {
      errors.email = 'Email is required';
    } else if (!VALIDATION_RULES.email.pattern.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    return errors;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setFormErrors({});

    const errors = validateForm(profileData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoadingProfile(true);

    try {
      await updateUser(session!.user.id, {
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

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoadingNotifications(true);

    try {
      await updateUser(session!.user.id, {
        notifications,
      });
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch {
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