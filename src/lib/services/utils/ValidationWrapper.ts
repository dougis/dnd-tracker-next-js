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
   * Common validation processor - eliminates duplication
   */
  private static processValidations(validations: ValidationFunction[]): ServiceResult<void> {
    for (const validation of validations) {
      const result = validation();
      if (!result.success) {
        return createErrorResult(result.error);
      }
    }
    return createSuccessResult(void 0);
  }

  /**
   * Process validations for combineValidations - returns boolean for compatibility
   */
  private static processValidationsForCombine(validations: ValidationFunction[]): ServiceResult<boolean> {
    for (const validation of validations) {
      const result = validation();
      if (!result.success) {
        return createErrorResult(result.error);
      }
    }
    return createSuccessResult(true);
  }

  /**
   * Execute multiple validations and proceed with operation if all pass
   */
  static async validateAndExecute<T>(
    validations: ValidationFunction[],
    operation: () => Promise<ServiceResult<T>>
  ): Promise<ServiceResult<T>> {
    const validationResult = this.processValidations(validations);
    if (!validationResult.success) {
      return createErrorResult(validationResult.error);
    }

    return operation();
  }

  /**
   * Execute synchronous validations and proceed with operation if all pass
   */
  static validateAndExecuteSync<T>(
    validations: ValidationFunction[],
    operation: () => ServiceResult<T>
  ): ServiceResult<T> {
    const validationResult = this.processValidations(validations);
    if (!validationResult.success) {
      return createErrorResult(validationResult.error);
    }

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
  ): ServiceResult<boolean> {
    return this.processValidationsForCombine(validations);
  }
}