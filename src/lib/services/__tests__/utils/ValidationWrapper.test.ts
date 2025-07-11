/**
 * ValidationWrapper Tests
 * 
 * Tests for the ValidationWrapper utility to ensure proper validation 
 * chaining and error handling patterns.
 */

import { ValidationWrapper } from '../../utils/ValidationWrapper';
import { createSuccessResult, createErrorResult, CharacterServiceErrors } from '../../CharacterServiceErrors';

describe('ValidationWrapper', () => {
  describe('validateAndExecute', () => {
    it('should execute operation when all validations pass', async () => {
      const validations = [
        () => createSuccessResult(true),
        () => createSuccessResult(true),
      ];
      
      const operation = jest.fn().mockResolvedValue(createSuccessResult('success'));
      
      const result = await ValidationWrapper.validateAndExecute(validations, operation);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(operation).toHaveBeenCalled();
    });

    it('should return first validation error without executing operation', async () => {
      const validations = [
        () => createSuccessResult(true),
        () => createErrorResult(CharacterServiceErrors.invalidCharacterId('123')),
        () => createSuccessResult(true),
      ];
      
      const operation = jest.fn();
      
      const result = await ValidationWrapper.validateAndExecute(validations, operation);
      
      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Invalid character ID');
      expect(operation).not.toHaveBeenCalled();
    });

    it('should handle empty validations array', async () => {
      const operation = jest.fn().mockResolvedValue(createSuccessResult('executed'));
      
      const result = await ValidationWrapper.validateAndExecute([], operation);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('executed');
      expect(operation).toHaveBeenCalled();
    });
  });

  describe('validateAndExecuteSync', () => {
    it('should execute sync operation when validations pass', () => {
      const validations = [
        () => createSuccessResult(true),
      ];
      
      const operation = jest.fn().mockReturnValue(createSuccessResult('sync-result'));
      
      const result = ValidationWrapper.validateAndExecuteSync(validations, operation);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('sync-result');
      expect(operation).toHaveBeenCalled();
    });

    it('should return validation error for sync operation', () => {
      const validations = [
        () => createErrorResult(CharacterServiceErrors.invalidCharacterId('456')),
      ];
      
      const operation = jest.fn();
      
      const result = ValidationWrapper.validateAndExecuteSync(validations, operation);
      
      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Invalid character ID');
      expect(operation).not.toHaveBeenCalled();
    });
  });

  describe('createValidation', () => {
    it('should create a validation function', () => {
      const validator = () => createSuccessResult(true);
      const validation = ValidationWrapper.createValidation(validator);
      
      expect(typeof validation).toBe('function');
      
      const result = validation();
      expect(result.success).toBe(true);
    });
  });

  describe('combineValidations', () => {
    it('should return success when all validations pass', () => {
      const validations = [
        () => createSuccessResult(true),
        () => createSuccessResult(true),
        () => createSuccessResult(true),
      ];
      
      const result = ValidationWrapper.combineValidations(validations);
      
      expect(result.success).toBe(true);
    });

    it('should return first error when validation fails', () => {
      const validations = [
        () => createSuccessResult(true),
        () => createErrorResult(CharacterServiceErrors.invalidCharacterId('fail')),
        () => createSuccessResult(true),
      ];
      
      const result = ValidationWrapper.combineValidations(validations);
      
      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Invalid character ID');
    });

    it('should handle empty validations array', () => {
      const result = ValidationWrapper.combineValidations([]);
      
      expect(result.success).toBe(true);
    });
  });
});