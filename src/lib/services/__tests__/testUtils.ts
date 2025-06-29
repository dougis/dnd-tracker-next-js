import type { PublicUser } from '@/lib/validations/user';

/**
 * Shared test utilities to reduce code duplication across UserService tests
 */

// Mock data factories
export const createMockUser = (overrides: Partial<any> = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  subscriptionTier: 'free',
  isEmailVerified: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockUsers = (count: number = 2) =>
  Array.from({ length: count }, (_, i) => createMockUser({
    _id: `user${i + 1}`,
    email: `user${i + 1}@example.com`,
    username: `user${i + 1}`,
  }));

export const createPublicUser = (overrides: Partial<PublicUser> = {}): PublicUser => ({
  id: 'user1',
  email: 'user1@example.com',
  username: 'user1',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  subscriptionTier: 'free',
  isEmailVerified: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  preferences: {
    theme: 'system',
    emailNotifications: true,
    browserNotifications: false,
    timezone: 'UTC',
    language: 'en',
    diceRollAnimations: true,
    autoSaveEncounters: true,
  },
  ...overrides,
});

// Common test scenarios
export const testDatabaseError = async (
  testFunction: () => Promise<any>,
  expectedMessage: string = 'Database connection failed'
) => {
  await expect(testFunction()).rejects.toThrow(expectedMessage);
};

// Common assertion helpers
export const expectSensitiveFieldsRemoved = (user: any) => {
  const sensitiveFields = [
    'passwordHash',
    'emailVerificationToken',
    'passwordResetToken',
    'passwordResetExpires'
  ];

  sensitiveFields.forEach(field => {
    expect(user).not.toHaveProperty(field);
  });
};

export const expectUserIdConversion = (user: any, expectedId: string) => {
  expect(user.id).toBe(expectedId);
  expect(user).not.toHaveProperty('_id');
};

export const expectMockCalls = (
  mockUser: any,
  email?: string,
  username?: string
) => {
  if (email) {
    expect(mockUser.findByEmail).toHaveBeenCalledWith(email);
  }
  if (username) {
    expect(mockUser.findByUsername).toHaveBeenCalledWith(username);
  }
};

export const expectErrorThrown = async (
  testFunction: () => Promise<any>,
  errorClass: any,
  expectedMessage?: string
) => {
  await expect(testFunction()).rejects.toThrow(errorClass);
  if (expectedMessage) {
    await expect(testFunction()).rejects.toThrow(expectedMessage);
  }
};

export const expectQueryChainCalls = (
  mockUser: any,
  mockSort: any,
  mockSkip: any,
  mockLimit: any,
  mockLean: any,
  query: any,
  skip?: number,
  limit?: number
) => {
  expect(mockUser.find).toHaveBeenCalledWith(query);
  expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
  if (skip !== undefined) expect(mockSkip).toHaveBeenCalledWith(skip);
  if (limit !== undefined) expect(mockLimit).toHaveBeenCalledWith(limit);
  expect(mockLean).toHaveBeenCalled();
  expect(mockUser.countDocuments).toHaveBeenCalledWith(query);
};

// Common test scenario functions
export const setupQueryTest = (mockUsers: any[], total: number = mockUsers.length) => ({
  mockUsers,
  total,
  setupMocks: (mockUser: any, mockLean: any) => {
    mockLean.mockResolvedValue(mockUsers);
    mockUser.countDocuments.mockResolvedValue(total);
  }
});

export const expectPaginatedResult = (result: any, expectedUsers: any[], expectedTotal: number) => {
  expect(result).toEqual({
    users: expectedUsers,
    total: expectedTotal,
  });
};

export const expectPaginationValues = (pagination: any, page: number, limit: number, total: number, totalPages: number) => {
  expect(pagination).toEqual({
    page,
    limit,
    total,
    totalPages,
  });
};

// User conflict testing utilities
export const createExistingUserWithEmail = (email: string, userId?: string) =>
  createMockUser({
    _id: userId || 'existing-user-id',
    email
  });

export const createExistingUserWithUsername = (username: string, userId?: string) =>
  createMockUser({
    _id: userId || 'existing-user-id',
    username
  });

export const createUserWithObjectId = (userId: string, overrides: any = {}) =>
  createMockUser({
    _id: { toString: () => userId },
    ...overrides
  });

export const setupConflictTest = (mockUser: any, type: 'email' | 'username', value: string, conflictUserId?: string) => {
  const existingUser = type === 'email'
    ? createUserWithObjectId(conflictUserId || 'different-user-id', { email: value })
    : createUserWithObjectId(conflictUserId || 'different-user-id', { username: value });

  if (type === 'email') {
    mockUser.findByEmail.mockResolvedValue(existingUser);
    mockUser.findByUsername.mockResolvedValue(null);
  } else {
    mockUser.findByEmail.mockResolvedValue(null);
    mockUser.findByUsername.mockResolvedValue(existingUser);
  }

  return existingUser;
};

// Helper functions to eliminate code duplication

/**
 * Test helper for filtering null/undefined values in user arrays
 * @param filterType - 'null' or 'undefined'
 * @param convertFunction - The function to test
 */
export const testFilterInvalidUsers = (
  filterType: 'null' | 'undefined',
  convertFunction: (_users: any[]) => any[]
) => {
  const [user1, user2] = createMockUsers(2);
  const invalidValue = filterType === 'null' ? null : undefined;
  const users = [user1, invalidValue, user2];

  const result = convertFunction(users);

  expect(result).toHaveLength(2);
  expect(result[0].id).toBe('user1');
  expect(result[1].id).toBe('user2');
};

/**
 * Test helper for empty array scenarios in pagination
 * @param formatFunction - The function to test
 * @param mockConverter - Mock function for user conversion
 */
export const testEmptyArrayPagination = (
  formatFunction: (_users: any[], _total: number, _page: number, _limit: number) => any,
  mockConverter?: jest.Mock
) => {
  const users: any[] = [];
  const publicUsers: PublicUser[] = [];
  const total = 0;
  const page = 1;
  const limit = 10;

  if (mockConverter) {
    mockConverter.mockReturnValue(publicUsers);
  }

  const result = formatFunction(users, total, page, limit);

  if (result.data !== undefined) {
    expect(result.data).toEqual([]);
  }
  if (result.pagination) {
    expectPaginationValues(result.pagination, page, limit, total, 0);
  }
  return result;
};

/**
 * Test helper for zero total with non-zero limit scenarios
 * @param formatFunction - The function to test
 * @param mockConverter - Mock function for user conversion
 */
export const testZeroTotalWithLimit = (
  formatFunction: (_users: any[], _total: number, _page: number, _limit: number) => any,
  mockConverter?: jest.Mock
) => {
  const users: any[] = [];
  const publicUsers: PublicUser[] = [];
  const total = 0;
  const page = 1;
  const limit = 10;

  if (mockConverter) {
    mockConverter.mockReturnValue(publicUsers);
  }

  const result = formatFunction(users, total, page, limit);

  if (result.pagination) {
    expectPaginationValues(result.pagination, page, limit, total, 0);
  }
  return result;
};

/**
 * Common test setup for query execution tests
 * @param query - Query object
 * @param skip - Skip value
 * @param limit - Limit value
 * @param mockUsers - Mock users array
 * @param total - Total count
 */
export const setupQueryExecutionTest = (
  query: any,
  skip: number,
  limit: number,
  mockUsers: any[] = createMockUsers(1),
  total: number = mockUsers.length
) => {
  const testSetup = setupQueryTest(mockUsers, total);
  return {
    query,
    skip,
    limit,
    testSetup,
    expectations: {
      expectSuccess: (result: any, mockUser: any, mockSort: any, mockSkip: any, mockLimit: any, mockLean: any) => {
        expectQueryChainCalls(mockUser, mockSort, mockSkip, mockLimit, mockLean, query, skip, limit);
        expectPaginatedResult(result, testSetup.mockUsers, testSetup.total);
      }
    }
  };
};

// Common test data constants
export const TEST_USER_ID = '507f1f77bcf86cd799439011';
export const TEST_EMAIL = 'test@example.com';
export const TEST_USERNAME = 'testuser';
export const TEST_DATE = new Date('2024-01-01');

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

// Response expectation helpers to eliminate duplication
export const expectSuccessResponse = (result: any, expectedData?: any) => {
  if (expectedData !== undefined) {
    expect(result).toEqual({
      success: true,
      data: expectedData,
    });
  } else {
    expect(result).toEqual({
      success: true,
    });
  }
};

export const expectErrorResponse = (result: any, error: any) => {
  expect(result).toEqual({
    success: false,
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    },
  });
};

export const expectErrorResponseFields = (result: any, expectedCode: string, expectedStatus: number) => {
  expect(result.success).toBe(false);
  expect(result.error?.code).toBe(expectedCode);
  expect(result.error?.statusCode).toBe(expectedStatus);
};

// Mock response factory
export const createMockErrorResponse = (message: string, code: string, statusCode: number) => ({
  success: false,
  error: { message, code, statusCode }
});

// Test data for UserServiceResponseHelpers
export const createTestToken = (type: 'normal' | 'empty' | 'long' = 'normal') => {
  const tokenMap = {
    normal: 'secure-token-123',
    empty: '',
    long: 'a'.repeat(1000),
  };
  return tokenMap[type];
};

export const createTestData = (type: 'simple' | 'array' | 'typed' = 'simple') => {
  const dataMap = {
    simple: { id: '123', name: 'Test' },
    array: [1, 2, 3],
    typed: { count: 42, items: ['a', 'b', 'c'] },
  };
  return dataMap[type];
};

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

export const expectMockHandleServiceErrorCall = (mockFn: jest.Mock, error: any, message: string, code: string, statusCode: number = 500) => {
  expect(mockFn).toHaveBeenCalledWith(error, message, code, statusCode);
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

export const expectDefaultUserValues = (result: any) => {
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
  const publicUsers = users.map((_, i) => createPublicUser({ id: `user${i + 1}` }));

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

export const setupDatabaseErrorTest = (
  mockObject: any,
  mockMethod: string,
  errorMessage: string = 'Database connection failed'
) => {
  mockObject[mockMethod].mockRejectedValue(new Error(errorMessage));

  return {
    testError: async (testFunction: () => Promise<any>) => {
      await testDatabaseError(testFunction, errorMessage);
    }
  };
};

export const executeQueryExecutionTest = async (
  _query: any,
  _skip: number,
  _limit: number,
  queryFunction: (_query: any, _skip: number, _limit: number) => Promise<any>,
  mockUser: any,
  mockSort: any,
  mockSkip: any,
  mockLimit: any,
  mockLean: any,
  mockUsers: any[] = createMockUsers(1),
  total: number = mockUsers.length
) => {
  const testData = setupQueryExecutionTest(_query, _skip, _limit, mockUsers, total);
  testData.testSetup.setupMocks(mockUser, mockLean);

  const result = await queryFunction(_query, _skip, _limit);

  testData.expectations.expectSuccess(result, mockUser, mockSort, mockSkip, mockLimit, mockLean);
  return result;
};

export const setupExecuteUserQueryTest = (
  environment: 'test' | 'production',
  query: any,
  skip: number,
  limit: number,
  mockUsers: any[],
  total: number,
  mockUser: any,
  mockSort?: any,
  mockSkip?: any,
  mockLimit?: any,
  mockLean?: any
) => {
  if (environment === 'test') {
    // Mock test environment - find returns function but no sort method
    mockUser.find.mockReturnValue((() => {}) as any);
    mockUser.find.mockResolvedValue(mockUsers as any);
    mockUser.countDocuments.mockResolvedValue(total);
  } else {
    // Mock production environment - find returns object with sort method
    mockUser.find.mockReturnValue({
      sort: mockSort,
    } as any);

    const testSetup = setupQueryTest(mockUsers, total);
    testSetup.setupMocks(mockUser, mockLean);
  }

  return {
    executeTest: async (executeFunction: any) => {
      const result = await executeFunction(query, skip, limit);

      if (environment === 'test') {
        expect(result).toEqual({
          users: mockUsers,
          total,
        });
      } else {
        expectQueryChainCalls(mockUser, mockSort, mockSkip, mockLimit, mockLean, query, skip, limit);
        expectPaginatedResult(result, mockUsers, total);
      }

      return result;
    }
  };
};
