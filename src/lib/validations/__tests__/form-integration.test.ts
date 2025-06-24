/**
 * @jest-environment jsdom
 */

import { z } from 'zod';
import {
  createFormResolver,
  createFormOptions,
  validateFormSubmission,
  createServerValidator,
  formatValidationErrors,
  hasValidationErrors,
  getFirstValidationError,
} from '../form-integration';
import { ValidationError } from '../base';

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
