/**
 * OperationWrapper Tests
 * 
 * Tests for the OperationWrapper utility to ensure proper error handling
 * consolidation and operation execution patterns.
 */

import { OperationWrapper } from '../../utils/OperationWrapper';
import { createSuccessResult, createErrorResult, CharacterServiceErrors } from '../../CharacterServiceErrors';

describe('OperationWrapper', () => {
  describe('execute', () => {
    it('should return success when operation completes successfully', async () => {
      const operation = jest.fn().mockResolvedValue('success-result');

      const result = await OperationWrapper.execute(operation, 'test operation');

      expect(result.success).toBe(true);
      expect(result.data).toBe('success-result');
      expect(operation).toHaveBeenCalled();
    });

    it('should handle operation errors with proper error formatting', async () => {
      const operationError = new Error('Operation failed');
      const operation = jest.fn().mockRejectedValue(operationError);

      const result = await OperationWrapper.execute(operation, 'test operation');

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Database error');
      expect(result.error.message).toContain('test operation');
    });

    it('should handle non-Error exceptions', async () => {
      const operation = jest.fn().mockRejectedValue('string error');

      const result = await OperationWrapper.execute(operation, 'test operation');

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Database error');
    });
  });

  describe('executeSync', () => {
    it('should return success when sync operation completes', () => {
      const operation = jest.fn().mockReturnValue('sync-result');

      const result = OperationWrapper.executeSync(operation, 'sync operation');

      expect(result.success).toBe(true);
      expect(result.data).toBe('sync-result');
      expect(operation).toHaveBeenCalled();
    });

    it('should handle sync operation errors', () => {
      const operation = jest.fn().mockImplementation(() => {
        throw new Error('Sync operation failed');
      });

      const result = OperationWrapper.executeSync(operation, 'sync operation');

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Operation failed');
      expect(result.error.message).toContain('sync operation');
    });

    it('should handle non-Error sync exceptions', () => {
      const operation = jest.fn().mockImplementation(() => {
        throw 'string error';
      });

      const result = OperationWrapper.executeSync(operation, 'sync operation');

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Unknown error');
    });
  });

  describe('executeWithCustomError', () => {
    it('should use custom error handler for failures', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Custom fail'));
      const errorHandler = jest.fn().mockReturnValue(CharacterServiceErrors.invalidCharacterId('123'));

      const result = await OperationWrapper.executeWithCustomError(operation, errorHandler);

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Invalid character ID');
      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should return success without calling error handler', async () => {
      const operation = jest.fn().mockResolvedValue('custom-success');
      const errorHandler = jest.fn();

      const result = await OperationWrapper.executeWithCustomError(operation, errorHandler);

      expect(result.success).toBe(true);
      expect(result.data).toBe('custom-success');
      expect(errorHandler).not.toHaveBeenCalled();
    });
  });

  describe('executeSequence', () => {
    it('should execute all operations in sequence and return final result', async () => {
      const operation1 = jest.fn().mockResolvedValue(createSuccessResult('step1'));
      const operation2 = jest.fn().mockResolvedValue(createSuccessResult('step2'));
      const finalOperation = jest.fn().mockResolvedValue('final-result');

      const result = await OperationWrapper.executeSequence(
        [operation1, operation2],
        finalOperation,
        'sequence operation'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe('final-result');
      expect(operation1).toHaveBeenCalled();
      expect(operation2).toHaveBeenCalled();
      expect(finalOperation).toHaveBeenCalled();
    });

    it('should stop sequence on first operation failure', async () => {
      const operation1 = jest.fn().mockResolvedValue(createSuccessResult('step1'));
      const operation2 = jest.fn().mockResolvedValue(createErrorResult(
        CharacterServiceErrors.invalidCharacterId('fail')
      ));
      const operation3 = jest.fn().mockResolvedValue(createSuccessResult('step3'));
      const finalOperation = jest.fn();

      const result = await OperationWrapper.executeSequence(
        [operation1, operation2, operation3],
        finalOperation,
        'sequence operation'
      );

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Invalid character ID');
      expect(operation1).toHaveBeenCalled();
      expect(operation2).toHaveBeenCalled();
      expect(operation3).not.toHaveBeenCalled();
      expect(finalOperation).not.toHaveBeenCalled();
    });

    it('should handle final operation errors', async () => {
      const operation1 = jest.fn().mockResolvedValue(createSuccessResult('step1'));
      const finalOperation = jest.fn().mockRejectedValue(new Error('Final operation failed'));

      const result = await OperationWrapper.executeSequence(
        [operation1],
        finalOperation,
        'sequence operation'
      );

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Database error');
    });
  });

  describe('executeWithChecks', () => {
    it('should execute operation when all validations pass', async () => {
      const validations = [
        () => createSuccessResult(true),
        () => createSuccessResult(true),
      ];
      const operation = jest.fn().mockResolvedValue('checked-result');

      const result = await OperationWrapper.executeWithChecks(
        validations,
        operation,
        'checked operation'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe('checked-result');
      expect(operation).toHaveBeenCalled();
    });

    it('should return validation error without executing operation', async () => {
      const validations = [
        () => createSuccessResult(true),
        () => createErrorResult(CharacterServiceErrors.invalidCharacterId('validation-fail')),
      ];
      const operation = jest.fn();

      const result = await OperationWrapper.executeWithChecks(
        validations,
        operation,
        'checked operation'
      );

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Invalid character ID');
      expect(operation).not.toHaveBeenCalled();
    });

    it('should handle operation errors after successful validations', async () => {
      const validations = [
        () => createSuccessResult(true),
      ];
      const operation = jest.fn().mockRejectedValue(new Error('Operation error'));

      const result = await OperationWrapper.executeWithChecks(
        validations,
        operation,
        'checked operation'
      );

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Database error');
      expect(operation).toHaveBeenCalled();
    });
  });

  describe('executeBulk', () => {
    it('should process all items and return successful and failed results', async () => {
      const items = ['item1', 'item2', 'item3'];
      const operation = jest.fn()
        .mockResolvedValueOnce(createSuccessResult('result1'))
        .mockResolvedValueOnce(createErrorResult(CharacterServiceErrors.invalidCharacterId('item2')))
        .mockResolvedValueOnce(createSuccessResult('result3'));

      const result = await OperationWrapper.executeBulk(
        items,
        operation,
        'bulk operation'
      );

      expect(result.success).toBe(true);
      expect(result.data.successful).toEqual(['result1', 'result3']);
      expect(result.data.failed).toHaveLength(1);
      expect(result.data.failed[0].item).toBe('item2');
      expect(result.data.failed[0].error).toContain('Invalid character ID');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should handle bulk operation errors', async () => {
      const items = ['item1'];
      const operation = jest.fn().mockRejectedValue(new Error('Bulk operation failed'));

      const result = await OperationWrapper.executeBulk(
        items,
        operation,
        'bulk operation'
      );

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Operation failed');
      expect(result.error.message).toContain('bulk operation');
    });

    it('should handle empty items array', async () => {
      const operation = jest.fn();

      const result = await OperationWrapper.executeBulk(
        [],
        operation,
        'empty bulk operation'
      );

      expect(result.success).toBe(true);
      expect(result.data.successful).toEqual([]);
      expect(result.data.failed).toEqual([]);
      expect(operation).not.toHaveBeenCalled();
    });
  });
});