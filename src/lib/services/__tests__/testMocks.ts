import { createMockUsers, createPublicUser } from './testDataFactories';
import { expectPaginationValues } from './testAssertions';

/**
 * Mock utilities and specialized test helpers
 */

// UserServiceError factory functions to eliminate duplication
export const createMockUserServiceError = (type: 'USER_ALREADY_EXISTS' | 'USER_NOT_FOUND' | 'INVALID_CREDENTIALS' | 'CUSTOM', customData?: { message?: string; code?: string; statusCode?: number }) => {
  const errorMap = {
    USER_ALREADY_EXISTS: {
      message: 'User already exists with email: test@example.com',
      code: 'USER_ALREADY_EXISTS',
      statusCode: 409,
    },
    USER_NOT_FOUND: {
      message: 'User not found: 123',
      code: 'USER_NOT_FOUND',
      statusCode: 404,
    },
    INVALID_CREDENTIALS: {
      message: 'Invalid email or password',
      code: 'INVALID_CREDENTIALS',
      statusCode: 401,
    },
    CUSTOM: {
      message: 'Custom error message',
      code: 'CUSTOM_ERROR',
      statusCode: 422,
    },
  };

  return { ...errorMap[type], ...customData };
};

// Mock response factory
export const createMockErrorResponse = (message: string, code: string, statusCode: number) => ({
  success: false,
  error: { message, code, statusCode }
});

// Mock setup helpers for UserServiceError testing
export const createUserServiceErrorInstance = (type: 'USER_ALREADY_EXISTS' | 'USER_NOT_FOUND' | 'INVALID_CREDENTIALS' | 'CUSTOM') => {
  const errorData = createMockUserServiceError(type);
  // Import UserServiceError at runtime to avoid circular deps
  const { UserServiceError } = require('../UserServiceErrors');
  // Create a real UserServiceError instance by creating an object that will be treated as one
  const userServiceError = Object.create(UserServiceError.prototype);
  userServiceError.message = errorData.message;
  userServiceError.code = errorData.code;
  userServiceError.statusCode = errorData.statusCode;
  return userServiceError;
};

export const setupMockHandleServiceError = (mockFn: jest.Mock, response: any) => {
  mockFn.mockReturnValue(response);
  return response;
};

// User serialization test utilities
export const createMockUserForSerialization = (type: 'withMethod' | 'withoutMethod' | 'withStringId' | 'minimal' | 'withNulls' | 'withObjectId' | 'withPartialPrefs' | 'circular' | 'large', overrides: any = {}) => {
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockDate = new Date('2024-01-01T00:00:00.000Z');

  const baseUserData = {
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
    ...overrides,
  };

  switch (type) {
    case 'withMethod':
      return {
        toPublicJSON: jest.fn().mockReturnValue(baseUserData),
      };

    case 'withoutMethod':
      return {
        ...baseUserData,
        _id: { toString: () => mockUserId },
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
      };

    case 'withStringId':
      return {
        id: 'string-id-123',
        email: 'test@example.com',
      };

    case 'minimal':
      return {};

    case 'withNulls':
      return {
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

    case 'withObjectId':
      return {
        _id: {
          toString: jest.fn().mockReturnValue(mockUserId),
        },
        email: 'test@example.com',
      };

    case 'withPartialPrefs':
      return {
        preferences: {
          theme: 'dark',
          language: 'fr',
        },
      };

    case 'circular':
      const circularUser: any = {
        _id: 'circular-id',
        email: 'circular@example.com',
      };
      circularUser.self = circularUser;
      return circularUser;

    case 'large':
      return {
        _id: 'large-id',
        email: 'large@example.com',
        largeField: 'x'.repeat(10000),
      };

    default:
      return baseUserData;
  }
};

// UserServiceQueryHelpers utility functions to eliminate duplication
export const setupFormatPaginatedResultTest = (
  total: number,
  page: number,
  limit: number,
  expectedTotalPages: number,
  mockConverter: jest.Mock,
  userCount: number = 1
) => {
  const users = createMockUsers(userCount);
  const publicUsers = users.map((_, i) => createPublicUser({ _id: `user${i + 1}` }));

  mockConverter.mockReturnValue(publicUsers);

  return {
    users,
    publicUsers,
    total,
    page,
    limit,
    expectedTotalPages,
    executeTest: (formatFunction: any) => {
      const result = formatFunction(users, total, page, limit);
      expectPaginationValues(result.pagination, page, limit, total, expectedTotalPages);
      return result;
    }
  };
};
