/**
 * @jest-environment jsdom
 */

import { z } from 'zod';
import {
  createFormResolver,
  createFormOptions,
  validateFormSubmission,
  validateField,
  validateFieldAsync,
  useFormValidation,
  createMultiStepValidator,
  createServerValidator,
  formatValidationErrors,
  hasValidationErrors,
  getFirstValidationError,
} from '../form-integration';
import { ValidationError } from '../base';
import { renderHook } from '@testing-library/react';

// Test schema
const testSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  age: z.number().min(18, 'Must be at least 18'),
});

describe('Form Integration', () => {
  describe('createFormResolver', () => {
    it('should create a resolver function', () => {
      const resolver = createFormResolver(testSchema);
      expect(typeof resolver).toBe('function');
    });
  });

  describe('createFormOptions', () => {
    it('should create form options with resolver', () => {
      const options = createFormOptions(testSchema, { name: 'John' });

      expect(options).toHaveProperty('resolver');
      expect(options).toHaveProperty('defaultValues');
      expect(options.defaultValues).toEqual({ name: 'John' });
      expect(options.mode).toBe('onChange');
      expect(options.reValidateMode).toBe('onChange');
    });

    it('should create form options without default values', () => {
      const options = createFormOptions(testSchema);

      expect(options).toHaveProperty('resolver');
      expect(options.mode).toBe('onChange');
    });
  });

  describe('validateFormSubmission', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
    };

    it('should validate correct form data', () => {
      const result = validateFormSubmission(testSchema, validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should return errors for invalid data', () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        age: 17,
      };

      const result = validateFormSubmission(testSchema, invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toHaveProperty('name');
        expect(result.errors).toHaveProperty('email');
        expect(result.errors).toHaveProperty('age');
        expect(result.errors.name).toBe('Name is required');
        expect(result.errors.email).toBe('Invalid email format');
        expect(result.errors.age).toBe('Must be at least 18');
      }
    });

    it('should handle partial errors', () => {
      const partiallyInvalidData = {
        name: 'John',
        email: 'invalid-email',
        age: 25,
      };

      const result = validateFormSubmission(testSchema, partiallyInvalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toHaveProperty('email');
        expect(result.errors).not.toHaveProperty('name');
        expect(result.errors).not.toHaveProperty('age');
      }
    });
  });

  describe('createServerValidator', () => {
    const validator = createServerValidator(testSchema);

    describe('validateRequest', () => {
      it('should validate request with valid JSON', async () => {
        const validData = {
          name: 'John Doe',
          email: 'john@example.com',
          age: 25,
        };

        const mockRequest = {
          json: jest.fn().mockResolvedValue(validData),
        } as unknown as Request;

        const result = await validator.validateRequest(mockRequest);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      it('should return errors for invalid JSON data', async () => {
        const invalidData = {
          name: '',
          email: 'invalid-email',
          age: 17,
        };

        const mockRequest = {
          json: jest.fn().mockResolvedValue(invalidData),
        } as unknown as Request;

        const result = await validator.validateRequest(mockRequest);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.status).toBe(400);
          expect(result.errors).toHaveProperty('name');
          expect(result.errors).toHaveProperty('email');
          expect(result.errors).toHaveProperty('age');
        }
      });

      it('should handle invalid JSON', async () => {
        const mockRequest = {
          json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        } as unknown as Request;

        const result = await validator.validateRequest(mockRequest);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.status).toBe(400);
          expect(result.errors).toHaveProperty('_root');
          expect(result.errors._root).toBe('Invalid JSON in request body');
        }
      });
    });

    describe('validateApiInput', () => {
      it('should validate API input', () => {
        const validData = {
          name: 'John Doe',
          email: 'john@example.com',
          age: 25,
        };

        const result = validator.validateApiInput(validData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      it('should return errors for invalid API input', () => {
        const invalidData = {
          name: '',
          email: 'invalid-email',
          age: 17,
        };

        const result = validator.validateApiInput(invalidData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors).toHaveProperty('name');
          expect(result.errors).toHaveProperty('email');
          expect(result.errors).toHaveProperty('age');
        }
      });
    });
  });

  describe('validateField', () => {
    it('should return error for field not in schema', () => {
      const error = validateField(testSchema, 'nonexistent' as any, 'value');
      expect(error).toBeInstanceOf(ValidationError);
      expect(error?.message).toBe('Field not found in schema');
      expect(error?.field).toBe('nonexistent');
    });

    it('should return error for non-object schema', () => {
      const stringSchema = z.string();
      const error = validateField(stringSchema as any, 'field' as any, 'value');
      expect(error).toBeInstanceOf(ValidationError);
      expect(error?.message).toBe('Field validation not supported for this schema type');
    });
  });

  describe('validateFieldAsync', () => {
    it('should return sync error if sync validation fails', async () => {
      const error = await validateFieldAsync(testSchema, 'nonexistent' as any, 'value');
      expect(error).toBeInstanceOf(ValidationError);
      expect(error?.message).toBe('Field not found in schema');
    });
  });

  describe('useFormValidation', () => {
    it('should return validation functions and resolver', () => {
      const { result } = renderHook(() => useFormValidation(testSchema));

      expect(result.current).toHaveProperty('validateSync');
      expect(result.current).toHaveProperty('validateField');
      expect(result.current).toHaveProperty('validateFieldAsync');
      expect(result.current).toHaveProperty('resolver');
      expect(typeof result.current.validateSync).toBe('function');
      expect(typeof result.current.validateField).toBe('function');
      expect(typeof result.current.validateFieldAsync).toBe('function');
      expect(typeof result.current.resolver).toBe('function');
    });

    it('should validate data using validateSync', () => {
      const { result } = renderHook(() => useFormValidation(testSchema));

      const validData = { name: 'John', email: 'john@example.com', age: 25 };
      const validResult = result.current.validateSync(validData);
      expect(validResult.success).toBe(true);

      const invalidData = { name: '', email: 'invalid', age: 17 };
      const invalidResult = result.current.validateSync(invalidData);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('createMultiStepValidator', () => {
    const stepSchemas = {
      step1: z.object({
        firstName: z.string().min(1, 'First name required'),
        lastName: z.string().min(1, 'Last name required'),
      }),
      step2: z.object({
        email: z.string().email('Invalid email'),
        phone: z.string().min(10, 'Phone must be at least 10 digits'),
      }),
    };

    const validator = createMultiStepValidator(stepSchemas);

    describe('validateStep', () => {
      it('should validate a single step successfully', () => {
        const validStep1Data = { firstName: 'John', lastName: 'Doe' };
        const result = validator.validateStep('step1', validStep1Data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validStep1Data);
        }
      });

      it('should return errors for invalid step data', () => {
        const invalidStep1Data = { firstName: '', lastName: 'Doe' };
        const result = validator.validateStep('step1', invalidStep1Data);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors).toHaveProperty('firstName');
          expect(result.errors.firstName).toBe('First name required');
        }
      });

      it('should validate step2 correctly', () => {
        const validStep2Data = { email: 'john@example.com', phone: '1234567890' };
        const result = validator.validateStep('step2', validStep2Data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validStep2Data);
        }
      });
    });

    describe('validateAllSteps', () => {
      it('should validate all steps successfully', () => {
        const allStepsData = {
          step1: { firstName: 'John', lastName: 'Doe' },
          step2: { email: 'john@example.com', phone: '1234567890' },
        };

        const result = validator.validateAllSteps(allStepsData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.step1).toEqual(allStepsData.step1);
          expect(result.data.step2).toEqual(allStepsData.step2);
        }
      });

      it('should return errors for any invalid step', () => {
        const allStepsData = {
          step1: { firstName: '', lastName: 'Doe' },
          step2: { email: 'john@example.com', phone: '123' },
        };

        const result = validator.validateAllSteps(allStepsData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors).toHaveProperty('step1');
          expect(result.errors).toHaveProperty('step2');
          expect(result.errors.step1).toHaveProperty('firstName');
          expect(result.errors.step2).toHaveProperty('phone');
        }
      });

      it('should handle mixed valid and invalid steps', () => {
        const allStepsData = {
          step1: { firstName: 'John', lastName: 'Doe' },
          step2: { email: 'invalid-email', phone: '1234567890' },
        };

        const result = validator.validateAllSteps(allStepsData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors).toHaveProperty('step2');
          expect(result.errors).not.toHaveProperty('step1');
          expect(result.errors.step2).toHaveProperty('email');
        }
      });
    });
  });

  describe('Error utilities', () => {
    describe('formatValidationErrors', () => {
      it('should format validation errors', () => {
        const errors = [
          new ValidationError('Name is required', 'name'),
          new ValidationError('Invalid email', 'email'),
        ];

        const formatted = formatValidationErrors(errors);

        expect(formatted).toEqual({
          name: 'Name is required',
          email: 'Invalid email',
        });
      });

      it('should handle errors without field', () => {
        const errors = [
          new ValidationError('General error'),
          new ValidationError('Field error', 'field'),
        ];

        const formatted = formatValidationErrors(errors);

        expect(formatted).toEqual({
          field: 'Field error',
        });
      });
    });

    describe('hasValidationErrors', () => {
      it('should return true when errors exist', () => {
        const errors = { name: 'Required', email: 'Invalid' };
        expect(hasValidationErrors(errors)).toBe(true);
      });

      it('should return false when no errors', () => {
        const errors = {};
        expect(hasValidationErrors(errors)).toBe(false);
      });
    });

    describe('getFirstValidationError', () => {
      it('should return first error message', () => {
        const errors = { name: 'Required', email: 'Invalid' };
        const firstError = getFirstValidationError(errors);
        expect(firstError).toBe('Required');
      });

      it('should return null when no errors', () => {
        const errors = {};
        const firstError = getFirstValidationError(errors);
        expect(firstError).toBe(null);
      });
    });
  });
});
