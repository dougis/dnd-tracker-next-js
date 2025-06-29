import { UserServiceResponseHelpers } from '../UserServiceResponseHelpers';
import {
  UserServiceError,
  handleServiceError,
} from '../UserServiceErrors';

// Mock dependencies
jest.mock('../UserServiceErrors');

const mockHandleServiceError = jest.mocked(handleServiceError);

describe('UserServiceResponseHelpers - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSuccessResponse', () => {
    it('should create success response with data', () => {
      const testData = { id: '123', name: 'Test' };
      const result = UserServiceResponseHelpers.createSuccessResponse(testData);

      expect(result).toEqual({
        success: true,
        data: testData,
      });
    });

    it('should create success response without data', () => {
      const result = UserServiceResponseHelpers.createSuccessResponse();

      expect(result).toEqual({
        success: true,
      });
    });

    it('should handle undefined data explicitly', () => {
      const result = UserServiceResponseHelpers.createSuccessResponse(undefined);

      expect(result).toEqual({
        success: true,
      });
    });

    it('should handle null data', () => {
      const result = UserServiceResponseHelpers.createSuccessResponse(null);

      expect(result).toEqual({
        success: true,
        data: null,
      });
    });

    it('should handle empty object data', () => {
      const result = UserServiceResponseHelpers.createSuccessResponse({});

      expect(result).toEqual({
        success: true,
        data: {},
      });
    });

    it('should handle array data', () => {
      const testArray = [1, 2, 3];
      const result = UserServiceResponseHelpers.createSuccessResponse(testArray);

      expect(result).toEqual({
        success: true,
        data: testArray,
      });
    });

    it('should handle string data', () => {
      const result = UserServiceResponseHelpers.createSuccessResponse('test string');

      expect(result).toEqual({
        success: true,
        data: 'test string',
      });
    });

    it('should handle number data', () => {
      const result = UserServiceResponseHelpers.createSuccessResponse(42);

      expect(result).toEqual({
        success: true,
        data: 42,
      });
    });

    it('should handle boolean data', () => {
      const result = UserServiceResponseHelpers.createSuccessResponse(false);

      expect(result).toEqual({
        success: true,
        data: false,
      });
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response from UserServiceError', () => {
      const error = {
        message: 'User already exists with email: test@example.com',
        code: 'USER_ALREADY_EXISTS',
        statusCode: 409,
      } as UserServiceError;
      const result = UserServiceResponseHelpers.createErrorResponse(error);

      expect(result).toEqual({
        success: false,
        error: {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
        },
      });
    });

    it('should handle UserNotFoundError', () => {
      const error = {
        message: 'User not found: 123',
        code: 'USER_NOT_FOUND',
        statusCode: 404,
      } as UserServiceError;
      const result = UserServiceResponseHelpers.createErrorResponse(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
      expect(result.error?.statusCode).toBe(404);
    });

    it('should handle InvalidCredentialsError', () => {
      const error = {
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
        statusCode: 401,
      } as UserServiceError;
      const result = UserServiceResponseHelpers.createErrorResponse(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
      expect(result.error?.statusCode).toBe(401);
    });

    it('should preserve all error properties', () => {
      const customError = {
        message: 'Custom error message',
        code: 'CUSTOM_ERROR',
        statusCode: 422,
      } as UserServiceError;
      const result = UserServiceResponseHelpers.createErrorResponse(customError);

      expect(result).toEqual({
        success: false,
        error: {
          message: 'Custom error message',
          code: 'CUSTOM_ERROR',
          statusCode: 422,
        },
      });
    });
  });

  describe('createSecurityResponse', () => {
    it('should create security response with token', () => {
      const token = 'secure-token-123';
      const result = UserServiceResponseHelpers.createSecurityResponse(token);

      expect(result).toEqual({
        success: true,
        data: { token },
      });
    });

    it('should handle empty token', () => {
      const result = UserServiceResponseHelpers.createSecurityResponse('');

      expect(result).toEqual({
        success: true,
        data: { token: '' },
      });
    });

    it('should handle very long token', () => {
      const longToken = 'a'.repeat(1000);
      const result = UserServiceResponseHelpers.createSecurityResponse(longToken);

      expect(result).toEqual({
        success: true,
        data: { token: longToken },
      });
    });
  });

  describe('safeToPublicJSON', () => {
    const mockUserId = '507f1f77bcf86cd799439011';
    const mockDate = new Date('2024-01-01T00:00:00.000Z');

    it('should use toPublicJSON method when available', () => {
      const mockPublicData = {
        _id: mockUserId,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        subscriptionTier: 'free',
        preferences: {
          theme: 'dark',
          language: 'en',
          timezone: 'UTC',
          emailNotifications: true,
          pushNotifications: false,
          autoSaveEncounters: true,
        },
        isEmailVerified: true,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const userWithMethod = {
        toPublicJSON: jest.fn().mockReturnValue(mockPublicData),
      };

      const result = UserServiceResponseHelpers.safeToPublicJSON(userWithMethod);

      expect(userWithMethod.toPublicJSON).toHaveBeenCalled();
      expect(result).toEqual(mockPublicData);
    });

    it('should use fallback for user without toPublicJSON method', () => {
      const userWithoutMethod = {
        _id: { toString: () => mockUserId },
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        subscriptionTier: 'expert',
        preferences: {
          theme: 'light',
          language: 'es',
          timezone: 'PST',
          emailNotifications: false,
          pushNotifications: true,
          autoSaveEncounters: false,
        },
        isEmailVerified: false,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const result = UserServiceResponseHelpers.safeToPublicJSON(userWithoutMethod);

      expect(result).toEqual({
        _id: mockUserId,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        subscriptionTier: 'expert',
        preferences: {
          theme: 'light',
          language: 'es',
          timezone: 'PST',
          emailNotifications: false,
          pushNotifications: true,
          autoSaveEncounters: false,
        },
        isEmailVerified: false,
        createdAt: mockDate,
        updatedAt: mockDate,
      });
    });

    it('should handle user with string id instead of _id', () => {
      const userWithStringId = {
        id: 'string-id-123',
        email: 'test@example.com',
      };

      const result = UserServiceResponseHelpers.safeToPublicJSON(userWithStringId);

      expect(result._id).toBe('string-id-123');
    });

    it('should provide default values for missing properties', () => {
      const minimalUser = {};

      const result = UserServiceResponseHelpers.safeToPublicJSON(minimalUser);

      expect(result).toEqual({
        _id: undefined,
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        role: 'user',
        subscriptionTier: 'free',
        preferences: {
          theme: 'system',
          language: 'en',
          timezone: 'UTC',
          emailNotifications: true,
          pushNotifications: true,
          autoSaveEncounters: true,
        },
        isEmailVerified: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should handle user with null values', () => {
      const userWithNulls = {
        _id: null,
        email: null,
        username: null,
        firstName: null,
        lastName: null,
        role: null,
        subscriptionTier: null,
        preferences: null,
        isEmailVerified: null,
        createdAt: null,
        updatedAt: null,
      };

      const result = UserServiceResponseHelpers.safeToPublicJSON(userWithNulls);

      expect(result).toEqual({
        _id: undefined,
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        role: 'user',
        subscriptionTier: 'free',
        preferences: {
          theme: 'system',
          language: 'en',
          timezone: 'UTC',
          emailNotifications: true,
          pushNotifications: true,
          autoSaveEncounters: true,
        },
        isEmailVerified: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should handle ObjectId with toString method', () => {
      const userWithObjectId = {
        _id: {
          toString: jest.fn().mockReturnValue(mockUserId),
        },
        email: 'test@example.com',
      };

      const result = UserServiceResponseHelpers.safeToPublicJSON(userWithObjectId);

      expect(userWithObjectId._id.toString).toHaveBeenCalled();
      expect(result._id).toBe(mockUserId);
    });

    it('should handle partial preferences object', () => {
      const userWithPartialPrefs = {
        preferences: {
          theme: 'dark',
          language: 'fr',
        },
      };

      const result = UserServiceResponseHelpers.safeToPublicJSON(userWithPartialPrefs);

      expect(result.preferences).toEqual({
        theme: 'dark',
        language: 'fr',
      });
    });
  });

  describe('handleValidationError', () => {
    it('should handle validation errors', () => {
      const validationError = new Error('validation failed: invalid email');
      const mockResponse = {
        success: false,
        error: { message: 'Invalid data provided', code: 'VALIDATION_ERROR', statusCode: 400 }
      };
      mockHandleServiceError.mockReturnValue(mockResponse);

      const result = UserServiceResponseHelpers.handleValidationError(validationError);

      expect(mockHandleServiceError).toHaveBeenCalledWith(
        validationError,
        'Invalid data provided',
        'VALIDATION_ERROR',
        400
      );
      expect(result).toEqual(mockResponse);
    });

    it('should re-throw non-validation errors', () => {
      const nonValidationError = new Error('database connection failed');

      expect(() => {
        UserServiceResponseHelpers.handleValidationError(nonValidationError);
      }).toThrow('database connection failed');
    });

    it('should handle errors with validation substring', () => {
      const validationError = new Error('data validation error occurred');
      const mockResponse = {
        success: false,
        error: { message: 'Invalid data provided', code: 'VALIDATION_ERROR', statusCode: 400 }
      };
      mockHandleServiceError.mockReturnValue(mockResponse);

      const result = UserServiceResponseHelpers.handleValidationError(validationError);

      expect(result).toEqual(mockResponse);
    });

    it('should handle non-Error objects', () => {
      const stringError = 'not an error object';

      expect(() => {
        UserServiceResponseHelpers.handleValidationError(stringError);
      }).toThrow('not an error object');
    });

    it('should handle undefined error', () => {
      expect(() => {
        UserServiceResponseHelpers.handleValidationError(undefined);
      }).toThrow();
    });

    it('should handle null error', () => {
      expect(() => {
        UserServiceResponseHelpers.handleValidationError(null);
      }).toThrow();
    });
  });

  describe('handleCustomError', () => {
    it('should use createErrorResponse for UserServiceError instances', () => {
      // Create a real UserServiceError instance by creating an object that will be treated as one
      const userServiceError = Object.create(UserServiceError.prototype);
      userServiceError.message = 'User already exists with email: test@example.com';
      userServiceError.code = 'USER_ALREADY_EXISTS';
      userServiceError.statusCode = 409;

      const result = UserServiceResponseHelpers.handleCustomError(
        userServiceError,
        'Default message',
        'DEFAULT_CODE'
      );

      expect(result).toEqual({
        success: false,
        error: {
          message: userServiceError.message,
          code: userServiceError.code,
          statusCode: userServiceError.statusCode,
        },
      });
    });

    it('should use handleServiceError for non-UserServiceError instances', () => {
      const genericError = new Error('Generic error');
      const mockResponse = {
        success: false,
        error: { message: 'Custom message', code: 'CUSTOM_CODE', statusCode: 500 }
      };
      mockHandleServiceError.mockReturnValue(mockResponse);

      const result = UserServiceResponseHelpers.handleCustomError(
        genericError,
        'Custom message',
        'CUSTOM_CODE'
      );

      expect(mockHandleServiceError).toHaveBeenCalledWith(
        genericError,
        'Custom message',
        'CUSTOM_CODE',
        500
      );
      expect(result).toEqual(mockResponse);
    });

    it('should use custom status code', () => {
      const genericError = new Error('Not found');
      const mockResponse = {
        success: false,
        error: { message: 'Resource not found', code: 'NOT_FOUND', statusCode: 404 }
      };
      mockHandleServiceError.mockReturnValue(mockResponse);

      const result = UserServiceResponseHelpers.handleCustomError(
        genericError,
        'Resource not found',
        'NOT_FOUND',
        404
      );

      expect(mockHandleServiceError).toHaveBeenCalledWith(
        genericError,
        'Resource not found',
        'NOT_FOUND',
        404
      );
      expect(result).toEqual(mockResponse);
    });

    it('should default to 500 status code when not provided', () => {
      const genericError = new Error('Server error');
      const mockResponse = {
        success: false,
        error: { message: 'Server error', code: 'SERVER_ERROR', statusCode: 500 }
      };
      mockHandleServiceError.mockReturnValue(mockResponse);

      UserServiceResponseHelpers.handleCustomError(
        genericError,
        'Server error',
        'SERVER_ERROR'
      );

      expect(mockHandleServiceError).toHaveBeenCalledWith(
        genericError,
        'Server error',
        'SERVER_ERROR',
        500
      );
    });

    it('should handle string errors', () => {
      const stringError = 'String error message';
      const mockResponse = {
        success: false,
        error: { message: 'Unknown error', code: 'UNKNOWN_ERROR', statusCode: 500 }
      };
      mockHandleServiceError.mockReturnValue(mockResponse);

      const result = UserServiceResponseHelpers.handleCustomError(
        stringError,
        'Unknown error',
        'UNKNOWN_ERROR'
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle null errors', () => {
      const mockResponse = {
        success: false,
        error: { message: 'Null error', code: 'NULL_ERROR', statusCode: 500 }
      };
      mockHandleServiceError.mockReturnValue(mockResponse);

      const result = UserServiceResponseHelpers.handleCustomError(
        null,
        'Null error',
        'NULL_ERROR'
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle undefined errors', () => {
      const mockResponse = {
        success: false,
        error: { message: 'Undefined error', code: 'UNDEFINED_ERROR', statusCode: 500 }
      };
      mockHandleServiceError.mockReturnValue(mockResponse);

      const result = UserServiceResponseHelpers.handleCustomError(
        undefined,
        'Undefined error',
        'UNDEFINED_ERROR'
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Edge cases and integration', () => {
    it('should handle circular references in user objects', () => {
      const circularUser: any = {
        _id: 'circular-id',
        email: 'circular@example.com',
      };
      circularUser.self = circularUser;

      // Should not throw despite circular reference
      const result = UserServiceResponseHelpers.safeToPublicJSON(circularUser);
      expect(result._id).toBe('circular-id');
      expect(result.email).toBe('circular@example.com');
    });

    it('should handle very large user objects', () => {
      const largeUser = {
        _id: 'large-id',
        email: 'large@example.com',
        largeField: 'x'.repeat(10000),
      };

      const result = UserServiceResponseHelpers.safeToPublicJSON(largeUser);
      expect(result._id).toBe('large-id');
      expect(result.email).toBe('large@example.com');
    });

    it('should maintain type safety in responses', () => {
      const typedData = { count: 42, items: ['a', 'b', 'c'] };
      const result = UserServiceResponseHelpers.createSuccessResponse(typedData);

      expect(result.success).toBe(true);
      expect(result.data?.count).toBe(42);
      expect(result.data?.items).toEqual(['a', 'b', 'c']);
    });
  });
});
