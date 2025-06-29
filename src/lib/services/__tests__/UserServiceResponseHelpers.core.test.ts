import { UserServiceResponseHelpers } from '../UserServiceResponseHelpers';
import { UserServiceError } from '../UserServiceErrors';

describe('UserServiceResponseHelpers - Core Tests', () => {
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
});
