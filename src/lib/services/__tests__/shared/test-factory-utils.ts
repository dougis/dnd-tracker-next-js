/**
 * Generic utilities for test data factories
 * Eliminates duplication across test helper files
 */

import { ServiceResult } from '../../UserServiceErrors';

/**
 * Generic factory function type
 */
export type Factory<T> = (_overrides?: Partial<T>) => T;

/**
 * Creates a factory function that merges defaults with overrides
 */
export function createFactory<T>(defaults: T): Factory<T> {
  return (_overrides: Partial<T> = {}): T => ({
    ...defaults,
    ..._overrides,
  });
}

/**
 * Generic error result creator
 */
export function createErrorResult<T>(
  code: string,
  message: string,
  statusCode: number = 400
): ServiceResult<T> {
  return {
    success: false,
    error: {
      message,
      code,
      statusCode,
    },
  };
}

/**
 * Generic success result creator
 */
export function createSuccessResult<T>(data: T): ServiceResult<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Common error factory creators
 */
export const errorFactories = {
  userNotFound: <T>() => createErrorResult<T>('USER_NOT_FOUND', 'User not found', 404),
  userAlreadyExists: <T>(field = 'email') =>
    createErrorResult<T>('USER_ALREADY_EXISTS', `User with this ${field} already exists`, 409),
  invalidCredentials: <T>() =>
    createErrorResult<T>('INVALID_CREDENTIALS', 'Invalid email or password', 401),
  invalidToken: <T>() =>
    createErrorResult<T>('INVALID_TOKEN', 'Invalid or expired token', 400),
  databaseError: <T>() =>
    createErrorResult<T>('DATABASE_ERROR', 'Database connection failed', 500),
  validationError: <T>() =>
    createErrorResult<T>('VALIDATION_ERROR', 'Invalid input', 400),
};

/**
 * Common test utilities
 */
export const testUtils = {
  setupMockClearance: () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  },

  createMockImplementation: <T>(result: T, delay = 0) => {
    if (delay > 0) {
      return () => new Promise<T>(resolve => setTimeout(() => resolve(result), delay));
    }
    return () => Promise.resolve(result);
  },

  createMockRejection: (error: Error) => () => Promise.reject(error),
};

/**
 * Common assertion helpers
 */
export const assertionHelpers = {
  expectDelegationCall: (
    mockFn: jest.MockedFunction<any>,
    expectedArgs: any[],
    expectedResult: any,
    actualResult: any
  ) => {
    expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
    expect(actualResult).toEqual(expectedResult);
  },

  expectSingleCall: (
    mockFn: jest.MockedFunction<any>,
    ...expectedArgs: any[]
  ) => {
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
  },

  expectMultipleCalls: (
    mockFn: jest.MockedFunction<any>,
    expectedCallCount: number
  ) => {
    expect(mockFn).toHaveBeenCalledTimes(expectedCallCount);
  },

  expectErrorThrown: async (promise: Promise<any>, expectedError: string) => {
    await expect(promise).rejects.toThrow(expectedError);
  },

  expectSuccessResult: <T>(result: ServiceResult<T>, expectedData: T) => {
    expect(result.success).toBe(true);
    expect(result.data).toEqual(expectedData);
  },

  expectErrorResult: <T>(result: ServiceResult<T>, expectedErrorType: string) => {
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(expectedErrorType);
  },
};

/**
 * Common test constants
 */
export const testConstants = {
  TEST_USER_ID: '507f1f77bcf86cd799439011',
  TEST_USER_ID_2: '507f1f77bcf86cd799439012',
  TEST_EMAIL: 'test@example.com',
  TEST_USERNAME: 'testuser',
  TEST_PASSWORD: 'Password123!',
};

/**
 * Common mock data patterns
 */
export const mockDataTemplates = {
  userBase: {
    firstName: 'Test',
    lastName: 'User',
    email: testConstants.TEST_EMAIL,
    username: testConstants.TEST_USERNAME,
  },

  userPreferences: {
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    emailNotifications: true,
    pushNotifications: true,
    autoSaveEncounters: true,
  },

  passwordFields: {
    password: testConstants.TEST_PASSWORD,
    confirmPassword: testConstants.TEST_PASSWORD,
  },

  timestamps: {
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};