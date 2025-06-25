'use client';

import Link from 'next/link';
import { useState } from 'react';
import { z } from 'zod';
import { passwordResetRequestSchema } from '@/lib/validations/user';
import {
  FormWrapper,
  FormInput,
  FormSubmitButton,
  FormValidationError,
} from '@/components/forms';
import { Mail } from 'lucide-react';

type FormState = {
  success: boolean;
  errors: FormValidationError[];
  isSubmitting: boolean;
};

export default function ResetPasswordPage() {
  const [formState, setFormState] = useState<FormState>({
    success: false,
    errors: [],
    isSubmitting: false,
  });
  const [email, setEmail] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormState(prev => ({ ...prev, isSubmitting: true, errors: [] }));

    try {
      const formData = new FormData(event.currentTarget);
      const data = Object.fromEntries(formData.entries());

      // Validate the form data with Zod
      const validatedData = passwordResetRequestSchema.parse(data);
      setEmail(validatedData.email);

      // Make API request
      const response = await fetch('/api/auth/reset-password-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to request password reset');
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

  // Show success screen if the reset email was sent
  if (formState.success) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Check Your Email</h1>
        <p className="text-slate-500 dark:text-slate-400">
          We&apos;ve sent password reset instructions to:
        </p>
        <p className="font-medium">{email}</p>
        <p className="text-slate-500 dark:text-slate-400">
          Click the link in the email to reset your password.
        </p>
        <div className="pt-2">
          <Link
            href="/auth/signin"
            className="text-sm text-primary hover:underline"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Enter your email and we&apos;ll send you instructions to reset your
          password
        </p>
      </div>

      <FormWrapper
        onSubmit={handleSubmit}
        errors={formState.errors}
        isSubmitting={formState.isSubmitting}
      >
        <FormInput
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          error={getFieldError('email')}
        />

        <FormSubmitButton loadingText="Sending instructions...">
          Send Reset Instructions
        </FormSubmitButton>

        <div className="text-center text-sm">
          <Link href="/auth/signin" className="text-primary hover:underline">
            Return to Sign In
          </Link>
        </div>
      </FormWrapper>
    </div>
  );
}
