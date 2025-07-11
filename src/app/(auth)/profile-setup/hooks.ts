import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { userProfileUpdateSchema } from '@/lib/validations/user';
import { FormValidationError } from '@/components/forms';
import { DEFAULT_FORM_VALUES } from './constants';

type FormState = {
  success: boolean;
  errors: FormValidationError[];
  isSubmitting: boolean;
};

type ProfileFormData = {
  displayName: string;
  timezone: string;
  dndEdition: string;
  experienceLevel: string;
  primaryRole: string;
};

export function useProfileForm(initialDisplayName: string = '', userId?: string) {
  const router = useRouter();

  const [formState, setFormState] = useState<FormState>({
    success: false,
    errors: [],
    isSubmitting: false,
  });

  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: initialDisplayName,
    ...DEFAULT_FORM_VALUES,
  });

  const updateField = useCallback((field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const setError = useCallback((errors: FormValidationError[]) => {
    setFormState(prev => ({ ...prev, errors, isSubmitting: false }));
  }, []);

  const setSuccess = useCallback(() => {
    setFormState({ success: true, errors: [], isSubmitting: false });
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setFormState(prev => ({ ...prev, isSubmitting, errors: [] }));
  }, []);

  const handleSkip = useCallback(() => {
    router.push('/dashboard' as any);
  }, [router]);

  const getFieldError = useCallback((field: string) => {
    return formState.errors.find(err => err.field === field)?.message;
  }, [formState.errors]);

  const createFormDataObject = useCallback(() => {
    return {
      displayName: formData.displayName || undefined,
      timezone: formData.timezone || undefined,
      dndEdition: formData.dndEdition || undefined,
      experienceLevel: formData.experienceLevel || undefined,
      primaryRole: formData.primaryRole || undefined,
    };
  }, [formData]);

  const submitProfileData = useCallback(async (userId: string, data: any) => {
    const response = await fetch(`/api/users/${userId}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 400 && result.errors) {
        throw { type: 'validation', errors: result.errors };
      }
      throw new Error(result.message || 'Profile setup failed');
    }

    return result;
  }, []);

  const handleValidationError = useCallback((error: z.ZodError) => {
    setError(error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    })));
  }, [setError]);

  const handleApiError = useCallback((error: any) => {
    if (error.type === 'validation') {
      setError(error.errors.map((err: any) => ({
        field: err.field || '',
        message: err.message,
      })));
      return;
    }

    setError([{
      field: '',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    }]);
  }, [setError]);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userId) {
      setError([{ field: '', message: 'User session not found' }]);
      return;
    }

    setSubmitting(true);

    try {
      const data = createFormDataObject();
      const validatedData = userProfileUpdateSchema.parse(data);
      await submitProfileData(userId, validatedData);
      setSuccess();
    } catch (error) {
      if (error instanceof z.ZodError) {
        handleValidationError(error);
      } else {
        handleApiError(error);
      }
    }
  }, [userId, createFormDataObject, submitProfileData, handleValidationError, handleApiError, setError, setSubmitting, setSuccess]);

  return {
    formState,
    formData,
    updateField,
    handleSubmit,
    handleSkip,
    getFieldError,
  };
}