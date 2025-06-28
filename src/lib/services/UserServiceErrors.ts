/**
 * Custom error classes and error handling utilities for UserService
 */

// Service response types
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    statusCode: number;
    details?: Array<{ field: string; message: string }>;
  };
}

// Custom error classes for better error handling
export class UserServiceError extends Error {
  public code: string;

  public statusCode: number;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.name = 'UserServiceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class UserNotFoundError extends UserServiceError {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`, 'USER_NOT_FOUND', 404);
  }
}

export class UserAlreadyExistsError extends UserServiceError {
  constructor(field: string, value: string) {
    super(
      `User already exists with ${field}: ${value}`,
      'USER_ALREADY_EXISTS',
      409
    );
  }
}

export class InvalidCredentialsError extends UserServiceError {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }
}

export class TokenExpiredError extends UserServiceError {
  constructor(tokenType: string) {
    super(`${tokenType} token has expired`, 'TOKEN_EXPIRED', 410);
  }
}

export class TokenInvalidError extends UserServiceError {
  constructor(tokenType: string) {
    super(`Invalid ${tokenType} token`, 'TOKEN_INVALID', 400);
  }
}

/**
 * Handle errors and convert them to ServiceResult error format
 */
export function handleServiceError(
  error: unknown,
  defaultMessage: string,
  defaultCode: string,
  defaultStatusCode: number = 500
): ServiceResult<never> {
  if (error instanceof UserServiceError) {
    // Directly return the error from the custom error class
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      },
    };
  }

  // Handle validation errors
  if (error instanceof Error && error.message.includes('validation')) {
    return {
      success: false,
      error: {
        message: 'Invalid user data provided',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      },
    };
  }

  // Handle duplicate key errors from MongoDB
  if (
    error instanceof Error &&
    'code' in error &&
    (error as any).code === 11000
  ) {
    const field = error.message.includes('email') ? 'email' : 'username';
    return {
      success: false,
      error: {
        message: `User already exists with this ${field}`,
        code: 'USER_ALREADY_EXISTS',
        statusCode: 409,
      },
    };
  }

  return {
    success: false,
    error: {
      message: defaultMessage,
      code: defaultCode,
      statusCode: defaultStatusCode,
    },
  };
}
