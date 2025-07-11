/**
 * Operation Wrapper Utility
 *
 * Consolidates error handling patterns across Character service layer.
 * Provides standardized try-catch wrapper for operations with consistent error formatting.
 */

import {
  ServiceResult,
  createSuccessResult,
  createErrorResult,
  CharacterServiceErrors,
} from '../CharacterServiceErrors';

export class OperationWrapper {

  /**
   * Helper to create standard database error - eliminates error creation duplication
   */
  private static createDatabaseError(operationName: string, error: any) {
    return CharacterServiceErrors.databaseError(operationName, error);
  }

  /**
   * Helper to execute operation with try-catch and standard error handling - eliminates pattern duplication
   */
  private static async executeWithStandardErrorHandling<T>(
    operation: () => Promise<T>,
    errorHandler: (_error: any) => any
  ): Promise<ServiceResult<T>> {
    try {
      const result = await operation();
      return createSuccessResult(result);
    } catch (error) {
      return createErrorResult(errorHandler(error));
    }
  }

  /**
   * Execute async operation with standardized error handling
   */
  static async execute<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<ServiceResult<T>> {
    return this.executeWithStandardErrorHandling(
      operation,
      (error) => this.createDatabaseError(operationName, error)
    );
  }

  /**
   * Execute sync operation with standardized error handling
   */
  static executeSync<T>(
    operation: () => T,
    operationName: string
  ): ServiceResult<T> {
    try {
      const result = operation();
      return createSuccessResult(result);
    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.operationFailed(operationName,
          error instanceof Error ? error.message : 'Unknown error'
        )
      );
    }
  }

  /**
   * Execute operation with custom error handler
   */
  static async executeWithCustomError<T>(
    operation: () => Promise<T>,
    errorHandler: (_error: any) => any
  ): Promise<ServiceResult<T>> {
    return this.executeWithStandardErrorHandling(operation, errorHandler);
  }

  /**
   * Execute multiple operations in sequence and return first failure or final success
   */
  static async executeSequence<T>(
    operations: Array<() => Promise<ServiceResult<any>>>,
    finalOperation: () => Promise<T>,
    operationName: string
  ): Promise<ServiceResult<T>> {
    try {
      // Execute all operations in sequence
      for (const operation of operations) {
        const result = await operation();
        if (!result.success) {
          return createErrorResult(result.error);
        }
      }

      // If all operations succeed, execute final operation
      const finalResult = await finalOperation();
      return createSuccessResult(finalResult);
    } catch (error) {
      return createErrorResult(this.createDatabaseError(operationName, error));
    }
  }

  /**
   * Execute operation with validation and access control checks
   */
  static async executeWithChecks<T>(
    validations: Array<() => ServiceResult<any>>,
    operation: () => Promise<T>,
    operationName: string
  ): Promise<ServiceResult<T>> {
    try {
      // Run all validations first
      for (const validation of validations) {
        const result = validation();
        if (!result.success) {
          return createErrorResult(result.error);
        }
      }

      // Execute the main operation
      const result = await operation();
      return createSuccessResult(result);
    } catch (error) {
      return createErrorResult(this.createDatabaseError(operationName, error));
    }
  }

  /**
   * Execute bulk operations with partial failure handling
   */
  static async executeBulk<TInput, TOutput>(
    items: TInput[],
    operation: (_item: TInput) => Promise<ServiceResult<TOutput>>,
    operationName: string
  ): Promise<ServiceResult<{
    successful: TOutput[];
    failed: Array<{ item: TInput; error: string }>;
  }>> {
    try {
      const successful: TOutput[] = [];
      const failed: Array<{ item: TInput; error: string }> = [];

      for (const item of items) {
        const result = await operation(item);
        if (result.success) {
          successful.push(result.data);
        } else {
          failed.push({
            item,
            error: result.error.message,
          });
        }
      }

      return createSuccessResult({ successful, failed });
    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.operationFailed(
          operationName,
          error instanceof Error ? error.message : 'Unknown error'
        )
      );
    }
  }
}