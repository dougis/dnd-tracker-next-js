// Form validation utilities
export type ValidationRule<T = any> = {
  test: (_value: T) => boolean;
  message: string;
};

export type FieldValidator<T = any> = {
  field: string;
  rules: ValidationRule<T>[];
};

export interface FormData {
  [key: string]: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
}

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    test: (value: any) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    test: (value: string) => !value || value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    test: (value: string) => !value || value.length <= max,
    message: message || `Must be no more than ${max} characters`,
  }),

  email: (
    message = 'Must be a valid email address'
  ): ValidationRule<string> => ({
    test: (value: string) => {
      if (!value) return true; // Allow empty for optional fields
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  number: (
    message = 'Must be a valid number'
  ): ValidationRule<string | number> => ({
    test: (value: string | number) => {
      if (!value && value !== 0) return true; // Allow empty for optional fields
      return !isNaN(Number(value));
    },
    message,
  }),

  min: (min: number, message?: string): ValidationRule<string | number> => ({
    test: (value: string | number) => {
      if (!value && value !== 0) return true; // Allow empty for optional fields
      return Number(value) >= min;
    },
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule<string | number> => ({
    test: (value: string | number) => {
      if (!value && value !== 0) return true; // Allow empty for optional fields
      return Number(value) <= max;
    },
    message: message || `Must be no more than ${max}`,
  }),

  pattern: (
    regex: RegExp,
    message = 'Invalid format'
  ): ValidationRule<string> => ({
    test: (value: string) => !value || regex.test(value),
    message,
  }),
};

// Validate form data against validators
export function validateForm(
  data: FormData,
  validators: FieldValidator[]
): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  for (const validator of validators) {
    const value = data[validator.field];

    for (const rule of validator.rules) {
      if (!rule.test(value)) {
        errors.push({
          field: validator.field,
          message: rule.message,
        });
        break; // Stop at first error for this field
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Common form patterns for D&D
export const dndValidators = {
  characterName: [
    validationRules.required('Character name is required'),
    validationRules.minLength(
      2,
      'Character name must be at least 2 characters'
    ),
    validationRules.maxLength(
      50,
      'Character name must be no more than 50 characters'
    ),
  ],

  abilityScore: [
    validationRules.required('Ability score is required'),
    validationRules.number('Ability score must be a number'),
    validationRules.min(1, 'Ability score must be at least 1'),
    validationRules.max(30, 'Ability score cannot exceed 30'),
  ],

  hitPoints: [
    validationRules.required('Hit points are required'),
    validationRules.number('Hit points must be a number'),
    validationRules.min(0, 'Hit points cannot be negative'),
    validationRules.max(9999, 'Hit points cannot exceed 9999'),
  ],

  armorClass: [
    validationRules.required('Armor class is required'),
    validationRules.number('Armor class must be a number'),
    validationRules.min(1, 'Armor class must be at least 1'),
    validationRules.max(30, 'Armor class cannot exceed 30'),
  ],

  initiative: [
    validationRules.number('Initiative must be a number'),
    validationRules.min(-10, 'Initiative modifier cannot be less than -10'),
    validationRules.max(20, 'Initiative modifier cannot exceed +20'),
  ],

  level: [
    validationRules.required('Level is required'),
    validationRules.number('Level must be a number'),
    validationRules.min(1, 'Level must be at least 1'),
    validationRules.max(20, 'Level cannot exceed 20'),
  ],
};

// Form data extraction helpers
export function extractFormData(formElement: HTMLFormElement): FormData {
  const formData = new FormData(formElement);
  const data: FormData = {};

  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }

  return data;
}

// Convert form validation errors to our error format
export function formatValidationErrors(
  errors: Array<{ field: string; message: string }>
): Array<{ field: string; message: string }> {
  return errors.map(error => ({
    field: error.field,
    message: error.message,
  }));
}
