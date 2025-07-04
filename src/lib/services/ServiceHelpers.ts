import { ServiceResult } from './CharacterServiceErrors';

/**
 * Shared utility functions for service classes
 */
export class ServiceHelpers {

  /**
   * Build validation error message from Zod error array
   */
  static buildValidationErrorMessage(errors: any[]): string {
    return errors
      .map(err => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
  }

  /**
   * Create standardized error result
   */
  static createErrorResult(code: string, message: string, error?: any): ServiceResult<any> {
    return {
      success: false,
      error: {
        code,
        message,
        details: { message: error instanceof Error ? error.message : 'Unknown error' },
      },
    };
  }

  /**
   * Create standardized validation error result
   */
  static createValidationErrorResult(errors: any[]): ServiceResult<any> {
    const errorMessage = this.buildValidationErrorMessage(errors);
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: errorMessage,
      },
    };
  }
}