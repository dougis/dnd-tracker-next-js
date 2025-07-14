import { zodResolver } from '@hookform/resolvers/zod';
import { UseFormProps, FieldValues, Path, Resolver } from 'react-hook-form';
import { z } from 'zod';
import { ValidationError, safeValidate } from './base';

/**
 * Form validation integration utilities for React Hook Form with Zod
 */

// Create a typed form resolver
export function createFormResolver<T extends FieldValues>(
  schema: z.ZodSchema<T>
) {
  return zodResolver(schema as any);
}

// Enhanced form options with validation
export function createFormOptions<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  defaultValues?: Partial<T>
): UseFormProps<T> {
  return {
    resolver: createFormResolver(schema),
    defaultValues: defaultValues as any,
    mode: 'onChange',
    reValidateMode: 'onChange',
  };
}

// Type for a Zod schema that has a shape
export type ZodSchemaWithShape<T> = z.ZodObject<any, any, any, T>;

// Validate individual form fields
export function validateField<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  fieldName: Path<T>,
  value: unknown
): ValidationError | null {
  // Handle refined schemas by getting the underlying object schema
  let objectSchema = schema as any;

  // If this is a refined schema, get the underlying schema
  if (objectSchema._def?.schema) {
    objectSchema = objectSchema._def.schema;
  }

  // Check if we now have a shape property
  if (!objectSchema._def?.shape) {
    // Fallback: try to validate the whole partial object if the schema supports it
    try {
      if (typeof (schema as any).partial === 'function') {
        const partialObject = { [fieldName]: value };
        const result = (schema as any).partial().safeParse(partialObject);

        if (!result.success) {
          const fieldError = result.error.errors.find((err: any) =>
            err.path.join('.') === fieldName
          );
          if (fieldError) {
            return new ValidationError(fieldError.message, fieldName);
          }
        }
        return null;
      } else {
        return new ValidationError('Field validation not supported for this schema type', fieldName);
      }
    } catch {
      return new ValidationError('Field validation not supported for this schema type', fieldName);
    }
  }

  // Get the shape from the schema
  const shape = objectSchema._def.shape;
  const fieldSchema = shape[fieldName as string];

  if (!fieldSchema) {
    return new ValidationError('Field not found in schema', fieldName);
  }

  // Ensure fieldSchema is a valid Zod schema
  if (!fieldSchema || typeof fieldSchema.safeParse !== 'function') {
    return new ValidationError('Invalid field schema', fieldName);
  }

  const result = safeValidate(fieldSchema, value);

  if (!result.success) {
    return (
      result.errors[0] || new ValidationError('Validation failed', fieldName)
    );
  }

  return null;
}

// Async field validation (useful for server-side checks)
export async function validateFieldAsync<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  fieldName: Path<T>,
  value: unknown,
  asyncValidator?: (_value: unknown) => Promise<boolean | string>
): Promise<ValidationError | null> {
  // First run synchronous validation
  const syncError = validateField(schema, fieldName, value);
  if (syncError) {
    return syncError;
  }

  // Then run async validation if provided
  if (asyncValidator) {
    try {
      const asyncResult = await asyncValidator(value);

      if (asyncResult === false) {
        return new ValidationError('Async validation failed', fieldName);
      }

      if (typeof asyncResult === 'string') {
        return new ValidationError(asyncResult, fieldName);
      }
    } catch (error) {
      return new ValidationError(
        error instanceof Error ? error.message : 'Async validation error',
        fieldName
      );
    }
  }

  return null;
}

// Form submission validation wrapper
export function validateFormSubmission<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  data: unknown
): FormValidationResult<T> {
  const result = safeValidate(schema, data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Convert validation errors to form-friendly format
  const formErrors: Record<string, string> = {};
  result.errors.forEach(error => {
    if (error.field) {
      formErrors[error.field] = error.message;
    }
  });

  return { success: false, errors: formErrors };
}

// Custom hook for form validation
export function useFormValidation<T extends FieldValues>(
  schema: z.ZodSchema<T>
) {
  const validateSync = (data: unknown) => validateFormSubmission(schema, data);

  const validateFieldFn = (fieldName: Path<T>, value: unknown) =>
    validateField(schema, fieldName, value);

  const validateFieldAsyncFn = async (
    fieldName: Path<T>,
    _value: unknown,
    asyncValidator?: (_value: unknown) => Promise<boolean | string>
  ) => validateFieldAsync(schema, fieldName, _value, asyncValidator);

  return {
    validateSync,
    validateField: validateFieldFn,
    validateFieldAsync: validateFieldAsyncFn,
    resolver: createFormResolver(schema),
  };
}

// Multi-step form validation
export function createMultiStepValidator<T extends Record<string, z.ZodSchema>>(
  stepSchemas: T
) {
  return {
    validateStep<K extends keyof T>(
      step: K,
      data: unknown
    ): FormValidationResult<z.infer<T[K]>> {
      return validateFormSubmission(stepSchemas[step], data);
    },

    validateAllSteps(
      data: Record<keyof T, unknown>
    ):
      | { success: true; data: { [K in keyof T]: z.infer<T[K]> } }
      | { success: false; errors: Record<string, Record<string, string>> } {
      const results: Record<string, any> = {};
      const errors: Record<string, Record<string, string>> = {};
      let hasErrors = false;

      for (const [stepName, stepData] of Object.entries(data)) {
        const stepResult = this.validateStep(stepName as keyof T, stepData);

        if (stepResult.success) {
          results[stepName] = stepResult.data;
        } else {
          errors[stepName] = stepResult.errors;
          hasErrors = true;
        }
      }

      if (hasErrors) {
        return { success: false, errors };
      }

      return {
        success: true,
        data: results as { [K in keyof T]: z.infer<T[K]> },
      };
    },
  };
}

// Server-side validation helpers
export function createServerValidator<T extends FieldValues>(
  schema: z.ZodSchema<T>
) {
  return {
    async validateRequest(
      request: Request
    ): Promise<
      | { success: true; data: T }
      | { success: false; errors: Record<string, string>; status: number }
    > {
      try {
        const body = await request.json();
        const result = validateFormSubmission(schema, body);

        if (result.success) {
          return { success: true, data: result.data };
        }

        return { success: false, errors: result.errors, status: 400 };
      } catch {
        return {
          success: false,
          errors: { _root: 'Invalid JSON in request body' },
          status: 400,
        };
      }
    },

    validateApiInput(input: unknown): FormValidationResult<T> {
      return validateFormSubmission(schema, input);
    },
  };
}

// Form error utilities
export function formatValidationErrors(
  errors: ValidationError[]
): Record<string, string> {
  const formattedErrors: Record<string, string> = {};

  errors.forEach(error => {
    if (error.field) {
      formattedErrors[error.field] = error.message;
    }
  });

  return formattedErrors;
}

export function hasValidationErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}

export function getFirstValidationError(
  errors: Record<string, string>
): string | null {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
}

// Type utilities for form integration
export type FormResolver<T extends FieldValues> = Resolver<T>;
export type FormOptions<T extends FieldValues> = UseFormProps<T>;
export type FormValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

// Re-export commonly used types from react-hook-form
export type {
  UseFormProps,
  FieldValues,
  Path,
  FieldError,
  FieldErrors,
} from 'react-hook-form';
