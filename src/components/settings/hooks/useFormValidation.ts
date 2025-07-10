import { VALIDATION_RULES } from '../constants';

interface FormErrors {
  name?: string;
  email?: string;
}

interface ProfileData {
  name: string;
  email: string;
}

export function validateProfileForm(data: ProfileData): FormErrors {
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
}

export type { FormErrors, ProfileData };