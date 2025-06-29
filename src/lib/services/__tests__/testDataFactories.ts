import type { PublicUser } from '@/lib/validations/user';

/**
 * Mock data factory functions for creating test data
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

// Common test data constants
export const TEST_USER_ID = '507f1f77bcf86cd799439011';
export const TEST_EMAIL = 'test@example.com';
export const TEST_USERNAME = 'testuser';
export const TEST_DATE = new Date('2024-01-01');
