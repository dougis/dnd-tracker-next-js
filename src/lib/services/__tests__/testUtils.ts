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
