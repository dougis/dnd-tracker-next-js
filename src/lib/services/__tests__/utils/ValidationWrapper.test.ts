/**
 * ValidationWrapper Tests
 *
 * Tests for the ValidationWrapper utility to ensure proper validation
 * chaining and error handling patterns.
 */

import { ValidationWrapper } from '../../utils/ValidationWrapper';
import { createSuccessResult } from '../../CharacterServiceErrors';
import {
  createSuccessValidation,
  createErrorValidation,
  createMockOperation,
  createValidationArray,
  createMixedValidationArray,
  expectValidationSuccess,
  expectValidationError,
} from './shared-utils-test-helpers';

describe('ValidationWrapper', () => {
  describe('validateAndExecute', () => {
    it('should execute operation when all validations pass', async () => {
      const validations = createValidationArray(2, true);
      const operation = createMockOperation(createSuccessResult('success'));

      const result = await ValidationWrapper.validateAndExecute(validations, operation);

      expectValidationSuccess(result, 'success', operation);
    });

    it('should return first validation error without executing operation', async () => {
      const validations = createMixedValidationArray(1, 1, '123');
      const operation = jest.fn();

      const result = await ValidationWrapper.validateAndExecute(validations, operation);

      expectValidationError(result, 'Invalid character ID', operation);
    });

    it('should handle empty validations array', async () => {
      const operation = createMockOperation(createSuccessResult('executed'));

      const result = await ValidationWrapper.validateAndExecute([], operation);

      expectValidationSuccess(result, 'executed', operation);
    });
  });

  describe('validateAndExecuteSync', () => {
    it('should execute sync operation when validations pass', () => {
      const validations = createValidationArray(1, true);
      const operation = jest.fn().mockReturnValue(createSuccessResult('sync-result'));

      const result = ValidationWrapper.validateAndExecuteSync(validations, operation);

      expectValidationSuccess(result, 'sync-result', operation);
    });

    it('should return validation error for sync operation', () => {
      const validations = [createErrorValidation('456')];
      const operation = jest.fn();

      const result = ValidationWrapper.validateAndExecuteSync(validations, operation);

      expectValidationError(result, 'Invalid character ID', operation);
    });
  });

  describe('createValidation', () => {
    it('should create a validation function', () => {
      const validator = createSuccessValidation();
      const validation = ValidationWrapper.createValidation(validator);

      expect(typeof validation).toBe('function');
      const result = validation();
      expectValidationSuccess(result, true);
    });
  });

  describe('combineValidations', () => {
    it('should return success when all validations pass', () => {
      const validations = createValidationArray(3, true);

      const result = ValidationWrapper.combineValidations(validations);

      expectValidationSuccess(result, true);
    });

    it('should return first error when validation fails', () => {
      const validations = createMixedValidationArray(1, 1, 'fail');

      const result = ValidationWrapper.combineValidations(validations);

      expectValidationError(result, 'Invalid character ID');
    });

    it('should handle empty validations array', () => {
      const result = ValidationWrapper.combineValidations([]);

      expectValidationSuccess(result, true);
    });
  });
});