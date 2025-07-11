/**
 * Validation Wrapper Utility
 *
 * Eliminates duplicate validation patterns across Character service layer.
 * Provides a consistent approach to validation with early returns.
 */

import {
  ServiceResult,
  createSuccessResult,
  createErrorResult,
} from '../CharacterServiceErrors';

export type ValidationFunction = () => ServiceResult<any>;

export class ValidationWrapper {
  /**
   * Execute multiple validations and proceed with operation if all pass
   */
  static async validateAndExecute<T>(
    validations: ValidationFunction[],
    operation: () => Promise<ServiceResult<T>>
  ): Promise<ServiceResult<T>> {
    // Run all validations first
    for (const validation of validations) {
      const result = validation();
      if (!result.success) {
        return createErrorResult(result.error);
      }
    }

    // If all validations pass, execute the operation
    return operation();
  }

  /**
   * Execute synchronous validations and proceed with operation if all pass
   */
  static validateAndExecuteSync<T>(
    validations: ValidationFunction[],
    operation: () => ServiceResult<T>
  ): ServiceResult<T> {
    // Run all validations first
    for (const validation of validations) {
      const result = validation();
      if (!result.success) {
        return createErrorResult(result.error);
      }
    }

    // If all validations pass, execute the operation
    return operation();
  }

  /**
   * Create a validation function for common patterns
   */
  static createValidation<T>(
    validator: () => ServiceResult<T>
  ): ValidationFunction {
    return validator;
  }

  /**
   * Combine multiple validation results
   */
  static combineValidations(
    validations: ValidationFunction[]
  ): ServiceResult<void> {
    for (const validation of validations) {
      const result = validation();
      if (!result.success) {
        return createErrorResult(result.error);
      }
    }
    return createSuccessResult(void 0);
  }
}