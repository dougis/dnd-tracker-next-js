'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useProfileForm } from './hooks';
import { LoadingState, SuccessState, ProfileForm } from './components';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const {
    formState,
    formData,
    updateField,
    handleSubmit,
    handleSkip,
    getFieldError,
  } = useProfileForm(session?.user?.name || '', session?.user?.id);

  // Update display name when session is loaded
  useEffect(() => {
    if (session?.user?.name && !formData.displayName) {
      updateField('displayName', session.user.name);
    }
  }, [session, formData.displayName, updateField]);

  // Redirect if user is not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/signin' as any);
      return;
    }
  }, [session, status, router]);

  // Loading state
  if (status === 'loading') {
    return <LoadingState />;
  }

  // Success state
  if (formState.success) {
    return <SuccessState />;
  }

  // Main form
  return (
    <ProfileForm
      formData={formData}
      updateField={updateField}
      handleSubmit={handleSubmit}
      handleSkip={handleSkip}
      getFieldError={getFieldError}
      isSubmitting={formState.isSubmitting}
      errors={formState.errors}
    />
  );
}