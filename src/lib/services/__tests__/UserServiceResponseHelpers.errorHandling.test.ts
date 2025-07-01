import { UserServiceResponseHelpers } from '../UserServiceResponseHelpers';
import { handleServiceError } from '../UserServiceErrors';
import {
  createMockErrorResponse,
  createUserServiceErrorInstance,
  setupMockHandleServiceError,
  expectMockHandleServiceErrorCall,
  expectErrorResponse,
  createTestData,
} from './testUtils';

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
      const mockResponse = createMockErrorResponse(
        'Invalid data provided',
        'VALIDATION_ERROR',
        400
      );
      setupMockHandleServiceError(mockHandleServiceError, mockResponse);

      const result =
        UserServiceResponseHelpers.handleValidationError(validationError);

      expectMockHandleServiceErrorCall(
        mockHandleServiceError,
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
      const mockResponse = createMockErrorResponse(
        'Invalid data provided',
        'VALIDATION_ERROR',
        400
      );
      setupMockHandleServiceError(mockHandleServiceError, mockResponse);

      const result =
        UserServiceResponseHelpers.handleValidationError(validationError);

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
      const userServiceError = createUserServiceErrorInstance(
        'USER_ALREADY_EXISTS'
      );

      const result = UserServiceResponseHelpers.handleCustomError(
        userServiceError,
        'Default message',
        'DEFAULT_CODE'
      );

      expectErrorResponse(result, userServiceError);
    });

    it('should use handleServiceError for non-UserServiceError instances', () => {
      const genericError = new Error('Generic error');
      const mockResponse = createMockErrorResponse(
        'Custom message',
        'CUSTOM_CODE',
        500
      );
      setupMockHandleServiceError(mockHandleServiceError, mockResponse);

      const result = UserServiceResponseHelpers.handleCustomError(
        genericError,
        'Custom message',
        'CUSTOM_CODE'
      );

      expectMockHandleServiceErrorCall(
        mockHandleServiceError,
        genericError,
        'Custom message',
        'CUSTOM_CODE',
        500
      );
      expect(result).toEqual(mockResponse);
    });

    it('should use custom status code', () => {
      const genericError = new Error('Not found');
      const mockResponse = createMockErrorResponse(
        'Resource not found',
        'NOT_FOUND',
        404
      );
      setupMockHandleServiceError(mockHandleServiceError, mockResponse);

      const result = UserServiceResponseHelpers.handleCustomError(
        genericError,
        'Resource not found',
        'NOT_FOUND',
        404
      );

      expectMockHandleServiceErrorCall(
        mockHandleServiceError,
        genericError,
        'Resource not found',
        'NOT_FOUND',
        404
      );
      expect(result).toEqual(mockResponse);
    });

    it('should default to 500 status code when not provided', () => {
      const genericError = new Error('Server error');
      const mockResponse = createMockErrorResponse(
        'Server error',
        'SERVER_ERROR',
        500
      );
      setupMockHandleServiceError(mockHandleServiceError, mockResponse);

      UserServiceResponseHelpers.handleCustomError(
        genericError,
        'Server error',
        'SERVER_ERROR'
      );

      expectMockHandleServiceErrorCall(
        mockHandleServiceError,
        genericError,
        'Server error',
        'SERVER_ERROR',
        500
      );
    });

    it('should handle string errors', () => {
      const stringError = 'String error message';
      const mockResponse = createMockErrorResponse(
        'Unknown error',
        'UNKNOWN_ERROR',
        500
      );
      setupMockHandleServiceError(mockHandleServiceError, mockResponse);

      const result = UserServiceResponseHelpers.handleCustomError(
        stringError,
        'Unknown error',
        'UNKNOWN_ERROR'
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle null errors', () => {
      const mockResponse = createMockErrorResponse(
        'Null error',
        'NULL_ERROR',
        500
      );
      setupMockHandleServiceError(mockHandleServiceError, mockResponse);

      const result = UserServiceResponseHelpers.handleCustomError(
        null,
        'Null error',
        'NULL_ERROR'
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle undefined errors', () => {
      const mockResponse = createMockErrorResponse(
        'Undefined error',
        'UNDEFINED_ERROR',
        500
      );
      setupMockHandleServiceError(mockHandleServiceError, mockResponse);

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
      const typedData = createTestData('typed') as {
        count: number;
        items: string[];
      };
      const result =
        UserServiceResponseHelpers.createSuccessResponse(typedData);

      expect(result.success).toBe(true);
      expect(result.data?.count).toBe(42);
      expect(result.data?.items).toEqual(['a', 'b', 'c']);
    });
  });
});
