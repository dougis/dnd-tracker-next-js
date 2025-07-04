export interface ValidationRule<T> {
  validate: (_value: T) => string | null;
}

export interface FormValidationRules<T> {
  [key: string]: ValidationRule<T[keyof T]>[];
}

// Common validation rules
export const validationRules = {
  required: <T>(message: string = 'This field is required'): ValidationRule<T> => ({
    validate: (value: T) => {
      if (typeof value === 'string' && !value.trim()) return message;
      if (value === null || value === undefined) return message;
      return null;
    }
  }),

  minValue: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value: number) => {
      if (value < min) return message || `Value must be at least ${min}`;
      return null;
    }
  }),

  nonNegative: (message: string = 'Value cannot be negative'): ValidationRule<number> => ({
    validate: (value: number) => value < 0 ? message : null
  })
};

// Generic form validator
export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: FormValidationRules<T>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    for (const rule of fieldRules) {
      const error = rule.validate(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  }

  return errors;
};