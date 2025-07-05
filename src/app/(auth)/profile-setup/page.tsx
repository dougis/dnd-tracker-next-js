'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import { userProfileUpdateSchema } from '@/lib/validations/user';
import {
  FormWrapper,
  FormInput,
  FormSelect,
  FormSubmitButton,
  FormValidationError,
} from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, CheckCircle } from 'lucide-react';

type FormState = {
  success: boolean;
  errors: FormValidationError[];
  isSubmitting: boolean;
};

const timezoneOptions = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'GMT (London)' },
  { value: 'Europe/Paris', label: 'CET (Paris)' },
  { value: 'Asia/Tokyo', label: 'JST (Tokyo)' },
  { value: 'Australia/Sydney', label: 'AEST (Sydney)' },
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [formState, setFormState] = useState<FormState>({
    success: false,
    errors: [],
    isSubmitting: false,
  });

  // Redirect if user is not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormState(prev => ({ ...prev, isSubmitting: true, errors: [] }));

    try {
      const formData = new FormData(event.currentTarget);
      const data = Object.fromEntries(formData.entries());

      // Validate the form data with Zod
      const validatedData = userProfileUpdateSchema.parse(data);

      // Make API request to update profile
      const response = await fetch(`/api/users/${session?.user?.id}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle server validation errors
        if (response.status === 400 && result.errors) {
          setFormState({
            success: false,
            errors: result.errors.map((err: any) => ({
              field: err.field || '',
              message: err.message,
            })),
            isSubmitting: false,
          });
          return;
        }

        throw new Error(result.message || 'Profile setup failed');
      }

      // Success - mark profile as set up
      setFormState({
        success: true,
        errors: [],
        isSubmitting: false,
      });

    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        setFormState({
          success: false,
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
          isSubmitting: false,
        });
        return;
      }

      // Handle other errors
      setFormState({
        success: false,
        errors: [
          {
            field: '',
            message:
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred',
          },
        ],
        isSubmitting: false,
      });
    }
  };

  const handleSkip = () => {
    // Allow users to skip profile setup for now
    router.push('/dashboard');
  };

  const getFieldError = (field: string) => {
    return formState.errors.find(err => err.field === field)?.message;
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (formState.success) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Profile Setup Complete!</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Welcome to D&D Encounter Tracker! Your profile has been set up successfully.
          </p>
          <div className="pt-2">
            <Button onClick={() => router.push('/dashboard')}>
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Avatar className="w-16 h-16">
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Help us personalize your D&D Encounter Tracker experience
          </p>
        </div>
      </div>

      <FormWrapper
        onSubmit={handleSubmit}
        errors={formState.errors}
        isSubmitting={formState.isSubmitting}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Display Name"
            name="displayName"
            placeholder="How should we display your name?"
            defaultValue={session?.user?.name || ''}
            error={getFieldError('displayName')}
            helperText="This is how others will see your name in shared encounters"
          />
          <FormSelect
            label="Timezone"
            name="timezone"
            options={timezoneOptions}
            defaultValue="UTC"
            error={getFieldError('timezone')}
            helperText="Used for scheduling encounters and notifications"
          />
        </div>

        <FormInput
          label="Preferred D&D Edition"
          name="dndEdition"
          placeholder="e.g., 5th Edition, Pathfinder 2e"
          defaultValue="5th Edition"
          error={getFieldError('dndEdition')}
          helperText="Helps us customize features for your preferred game system"
        />

        <FormSelect
          label="Experience Level"
          name="experienceLevel"
          options={[
            { value: 'new', label: 'New to D&D' },
            { value: 'beginner', label: 'Beginner (0-2 years)' },
            { value: 'intermediate', label: 'Intermediate (2-5 years)' },
            { value: 'experienced', label: 'Experienced (5+ years)' },
            { value: 'veteran', label: 'Veteran (10+ years)' },
          ]}
          error={getFieldError('experienceLevel')}
          helperText="Helps us provide appropriate content and tips"
        />

        <FormSelect
          label="Primary Role"
          name="primaryRole"
          options={[
            { value: 'dm', label: 'Dungeon Master' },
            { value: 'player', label: 'Player' },
            { value: 'both', label: 'Both DM and Player' },
          ]}
          error={getFieldError('primaryRole')}
          helperText="How do you primarily engage with D&D?"
        />

        <div className="flex gap-3 pt-4">
          <FormSubmitButton 
            loadingText="Setting up profile..."
            className="flex-1"
          >
            Complete Setup
          </FormSubmitButton>
          
          <Button 
            type="button"
            variant="outline"
            onClick={handleSkip}
            disabled={formState.isSubmitting}
          >
            Skip for Now
          </Button>
        </div>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          You can update these preferences anytime in your account settings.
        </div>
      </FormWrapper>
    </div>
  );
}