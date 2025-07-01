import { UserServiceResponseHelpers } from '../UserServiceResponseHelpers';
import { UserServiceError } from '../UserServiceErrors';
import {
  createMockUserServiceError,
  expectSuccessResponse,
  expectErrorResponse,
  expectErrorResponseFields,
  createTestData,
  createTestToken,
} from './testUtils';

describe('UserServiceResponseHelpers - Core Tests', () => {
  describe('createSuccessResponse', () => {
    it('should create success response with data', () => {
      const testData = createTestData('simple');
      const result = UserServiceResponseHelpers.createSuccessResponse(testData);
      expectSuccessResponse(result, testData);
    });

    it('should create success response without data', () => {
      const result = UserServiceResponseHelpers.createSuccessResponse();
      expectSuccessResponse(result);
    });

    it('should handle undefined data explicitly', () => {
      const result =
        UserServiceResponseHelpers.createSuccessResponse(undefined);
      expectSuccessResponse(result);
    });

    it('should handle null data', () => {
      const result = UserServiceResponseHelpers.createSuccessResponse(null);
      expectSuccessResponse(result, null);
    });

    it('should handle empty object data', () => {
      const result = UserServiceResponseHelpers.createSuccessResponse({});
      expectSuccessResponse(result, {});
    });

    it('should handle array data', () => {
      const testArray = createTestData('array');
      const result =
        UserServiceResponseHelpers.createSuccessResponse(testArray);
      expectSuccessResponse(result, testArray);
    });

    it('should handle string data', () => {
      const result =
        UserServiceResponseHelpers.createSuccessResponse('test string');
      expectSuccessResponse(result, 'test string');
    });

    it('should handle number data', () => {
      const result = UserServiceResponseHelpers.createSuccessResponse(42);
      expectSuccessResponse(result, 42);
    });

    it('should handle boolean data', () => {
      const result = UserServiceResponseHelpers.createSuccessResponse(false);
      expectSuccessResponse(result, false);
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response from UserServiceError', () => {
      const error = createMockUserServiceError(
        'USER_ALREADY_EXISTS'
      ) as UserServiceError;
      const result = UserServiceResponseHelpers.createErrorResponse(error);
      expectErrorResponse(result, error);
    });

    it('should handle UserNotFoundError', () => {
      const error = createMockUserServiceError(
        'USER_NOT_FOUND'
      ) as UserServiceError;
      const result = UserServiceResponseHelpers.createErrorResponse(error);
      expectErrorResponseFields(result, 'USER_NOT_FOUND', 404);
    });

    it('should handle InvalidCredentialsError', () => {
      const error = createMockUserServiceError(
        'INVALID_CREDENTIALS'
      ) as UserServiceError;
      const result = UserServiceResponseHelpers.createErrorResponse(error);
      expectErrorResponseFields(result, 'INVALID_CREDENTIALS', 401);
    });

    it('should preserve all error properties', () => {
      const customError = createMockUserServiceError(
        'CUSTOM'
      ) as UserServiceError;
      const result =
        UserServiceResponseHelpers.createErrorResponse(customError);
      expectErrorResponse(result, customError);
    });
  });

  describe('createSecurityResponse', () => {
    it('should create security response with token', () => {
      const token = createTestToken('normal');
      const result = UserServiceResponseHelpers.createSecurityResponse(token);
      expectSuccessResponse(result, { token });
    });

    it('should handle empty token', () => {
      const token = createTestToken('empty');
      const result = UserServiceResponseHelpers.createSecurityResponse(token);
      expectSuccessResponse(result, { token });
    });

    it('should handle very long token', () => {
      const token = createTestToken('long');
      const result = UserServiceResponseHelpers.createSecurityResponse(token);
      expectSuccessResponse(result, { token });
    });
  });
});
