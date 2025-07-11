/**
 * OperationWrapper Tests
 *
 * Tests for the OperationWrapper utility to ensure proper error handling
 * consolidation and operation execution patterns.
 */

import { OperationWrapper } from '../../utils/OperationWrapper';
import { createSuccessResult, createErrorResult, CharacterServiceErrors } from '../../CharacterServiceErrors';
import {
  createMockOperation,
  createMockSyncOperation,
  expectOperationSuccess,
  expectOperationError,
  expectValidationError,
  createSequenceOperations,
  expectSequenceSuccess,
  expectSequenceFailure,
  createBulkOperation,
  expectBulkSuccess,
  expectCheckedOperationSuccess,
  expectCheckedOperationError,
  expectCheckedOperationAfterValidation,
  TEST_DATA_FACTORY,
} from './shared-utils-test-helpers';

describe('OperationWrapper', () => {
  describe('execute', () => {
    it('should return success when operation completes successfully', async () => {
      const operation = createMockOperation(TEST_DATA_FACTORY.operations.finalResult);

      const result = await OperationWrapper.execute(operation, 'test operation');

      expectOperationSuccess(result, TEST_DATA_FACTORY.operations.finalResult, operation);
    });

    it('should handle operation errors with proper error formatting', async () => {
      const operation = createMockOperation(TEST_DATA_FACTORY.errors.database, true);

      const result = await OperationWrapper.execute(operation, 'test operation');

      expectOperationError(result, ['Database error', 'test operation'], operation);
    });

    it('should handle non-Error exceptions', async () => {
      const operation = createMockOperation('string error', true);

      const result = await OperationWrapper.execute(operation, 'test operation');

      expectOperationError(result, ['Database error'], operation);
    });
  });

  describe('executeSync', () => {
    it('should return success when sync operation completes', () => {
      const operation = createMockSyncOperation('sync-result');

      const result = OperationWrapper.executeSync(operation, 'sync operation');

      expectOperationSuccess(result, 'sync-result', operation);
    });

    it('should handle sync operation errors', () => {
      const operation = createMockSyncOperation(new Error('Sync operation failed'), true);

      const result = OperationWrapper.executeSync(operation, 'sync operation');

      expectOperationError(result, ['Operation', 'sync operation', 'failed']);
    });

    it('should handle non-Error sync exceptions', () => {
      const operation = createMockSyncOperation('string error', true);

      const result = OperationWrapper.executeSync(operation, 'sync operation');

      expectOperationError(result, ['Unknown error']);
    });
  });

  describe('executeWithCustomError', () => {
    it('should use custom error handler for failures', async () => {
      const operation = createMockOperation(new Error('Custom fail'), true);
      const errorHandler = jest.fn().mockReturnValue(CharacterServiceErrors.invalidCharacterId('123'));

      const result = await OperationWrapper.executeWithCustomError(operation, errorHandler);

      expectValidationError(result, 'Invalid character ID');
      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should return success without calling error handler', async () => {
      const operation = createMockOperation('custom-success');
      const errorHandler = jest.fn();

      const result = await OperationWrapper.executeWithCustomError(operation, errorHandler);

      expectOperationSuccess(result, 'custom-success', operation);
      expect(errorHandler).not.toHaveBeenCalled();
    });
  });

  describe('executeSequence', () => {
    it('should execute all operations in sequence and return final result', async () => {
      const operations = createSequenceOperations();
      const finalOperation = createMockOperation(TEST_DATA_FACTORY.operations.finalResult);

      const result = await OperationWrapper.executeSequence(
        operations,
        finalOperation,
        'sequence operation'
      );

      expectSequenceSuccess(result, finalOperation, operations);
    });

    it('should stop sequence on first operation failure', async () => {
      const operations = createSequenceOperations(1); // Fail at index 1
      const finalOperation = jest.fn();

      const result = await OperationWrapper.executeSequence(
        operations,
        finalOperation,
        'sequence operation'
      );

      expectSequenceFailure(result, finalOperation, operations, 1);
    });

    it('should handle final operation errors', async () => {
      const operations = [createMockOperation(createSuccessResult(TEST_DATA_FACTORY.operations.step1))];
      const finalOperation = createMockOperation(TEST_DATA_FACTORY.errors.database, true);

      const result = await OperationWrapper.executeSequence(
        operations,
        finalOperation,
        'sequence operation'
      );

      expectOperationError(result, ['Database error'], finalOperation);
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

      expectCheckedOperationSuccess(result, 'checked-result', operation);
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

      expectCheckedOperationError(result, 'Invalid character ID', operation);
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

      expectCheckedOperationAfterValidation(result, 'Database error', operation);
    });
  });

  describe('executeBulk', () => {
    it('should process all items and return successful and failed results', async () => {
      const items = ['item1', 'item2', 'item3'];
      const operation = createBulkOperation();

      const result = await OperationWrapper.executeBulk(
        items,
        operation,
        'bulk operation'
      );

      expectBulkSuccess(result, operation, items);
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
      expect(result.error.message).toContain('Operation');
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