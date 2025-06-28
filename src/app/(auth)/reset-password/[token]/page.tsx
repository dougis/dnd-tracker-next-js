'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { passwordResetSchema } from '@/lib/validations/user';
import {
  FormWrapper,
  FormInput,
  FormSubmitButton,
  FormValidationError,
} from '@/components/forms';
import { Check } from 'lucide-react';

type FormState = {
  success: boolean;
  errors: FormValidationError[];
  isSubmitting: boolean;
};

export default function ResetPasswordWithTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const _router = useRouter();
  const [token, setToken] = useState<string>('');

  // Extract token from params promise
  useEffect(() => {
    params.then(({ token }) => setToken(token));
  }, [params]);

  const [formState, setFormState] = useState<FormState>({
    success: false,
    errors: [],
    isSubmitting: false,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormState(prev => ({ ...prev, isSubmitting: true, errors: [] }));

    try {
      const formData = new FormData(event.currentTarget);
      const data = Object.fromEntries(formData.entries());

      // Validate the form data with Zod
      const validatedData = passwordResetSchema.parse({
        ...data,
        token,
      });

      // Make API request
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to reset password');
      }

      // Success
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

  const getFieldError = (field: string) => {
    return formState.errors.find(err => err.field === field)?.message;
  };

  // Show success screen if the password was reset
  if (formState.success) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <Check className="h-6 w-6 text-green-600 dark:text-green-300" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Password Reset Successful</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Your password has been reset successfully.
        </p>
        <div className="pt-2">
          <Link
            href={'/auth/signin' as any}
            className="text-primary font-medium hover:underline"
          >
            Sign in with your new password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Create a new password</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Enter a new password for your account
        </p>
      </div>

      <FormWrapper
        onSubmit={handleSubmit}
        errors={formState.errors}
        isSubmitting={formState.isSubmitting}
      >
        <FormInput
          label="New Password"
          name="password"
          type="password"
          placeholder="Create a strong password"
          required
          error={getFieldError('password')}
          helperText="Min 8 characters with uppercase, lowercase, number, and symbol"
        />

        <FormInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your new password"
          required
          error={getFieldError('confirmPassword')}
        />

        <FormSubmitButton loadingText="Resetting password...">
          Reset Password
        </FormSubmitButton>

        <div className="text-center text-sm">
          <Link
            href={'/auth/signin' as any}
            className="text-primary hover:underline"
          >
            Return to Sign In
          </Link>
        </div>
      </FormWrapper>
    </div>
  );
}
