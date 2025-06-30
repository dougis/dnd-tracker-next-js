import {
  ServiceResult,
  UserServiceError,
  handleServiceError,
} from './UserServiceErrors';
import { type PublicUser } from '../validations/user';

/**
 * Response formatting utilities for UserService
 * Consolidates common response patterns and reduces code duplication
 */
export class UserServiceResponseHelpers {

  /**
   * Create a standardized success response
   */
  static createSuccessResponse<T>(data?: T): ServiceResult<T> {
    if (data === undefined) {
      return { success: true } as ServiceResult<T>;
    }
    return {
      success: true,
      data,
    };
  }

  /**
   * Create a standardized error response from a UserServiceError
   */
  static createErrorResponse(error: UserServiceError): ServiceResult<never> {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      },
    };
  }

  /**
   * Create a security-safe response (used for password reset requests)
   */
  static createSecurityResponse(token: string): ServiceResult<{ token: string }> {
    return {
      success: true,
      data: { token },
    };
  }

  /**
   * Safely convert user to public JSON with fallback for test compatibility
   */
  static safeToPublicJSON(user: any): PublicUser {
    if (typeof user.toPublicJSON === 'function') {
      return user.toPublicJSON();
    }

    // Fallback for test compatibility
    return {
      id: user._id?.toString() || user.id,
      email: user.email || '',
      username: user.username || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role || 'user',
      subscriptionTier: user.subscriptionTier || 'free',
      preferences: user.preferences || {
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        emailNotifications: true,
        pushNotifications: true,
        autoSaveEncounters: true,
      },
      isEmailVerified: user.isEmailVerified || false,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    } as PublicUser;
  }

  /**
   * Handle validation errors with consistent formatting
   */
  static handleValidationError(error: unknown): ServiceResult<never> {
    if (error instanceof Error && error.message.includes('validation')) {
      return handleServiceError(
        error,
        'Invalid data provided',
        'VALIDATION_ERROR',
        400
      );
    }

    // Re-throw if not a validation error
    throw error;
  }

  /**
   * Handle custom errors with standardized response format
   */
  static handleCustomError(
    error: any,
    defaultMessage: string,
    defaultCode: string,
    statusCode: number = 500
  ): ServiceResult<never> {
    if (error instanceof UserServiceError) {
      return this.createErrorResponse(error);
    }

    return handleServiceError(error, defaultMessage, defaultCode, statusCode);
  }
}
