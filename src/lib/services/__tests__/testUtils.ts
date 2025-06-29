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

// Common test data constants
export const TEST_USER_ID = '507f1f77bcf86cd799439011';
export const TEST_EMAIL = 'test@example.com';
export const TEST_USERNAME = 'testuser';
export const TEST_DATE = new Date('2024-01-01');
