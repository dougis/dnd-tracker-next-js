import { UserServiceResponseHelpers } from '../UserServiceResponseHelpers';
import {
  UserServiceError,
  handleServiceError,
} from '../UserServiceErrors';

// Mock dependencies
jest.mock('../UserServiceErrors');

const mockHandleServiceError = jest.mocked(handleServiceError);

describe('UserServiceResponseHelpers - Error Handling Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  describe('Integration and type safety', () => {
    it('should maintain type safety in responses', () => {
      const typedData = { count: 42, items: ['a', 'b', 'c'] };
      const result = UserServiceResponseHelpers.createSuccessResponse(typedData);

      expect(result.success).toBe(true);
      expect(result.data?.count).toBe(42);
      expect(result.data?.items).toEqual(['a', 'b', 'c']);
    });
  });
});
