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

// Common test data constants
export const TEST_USER_ID = '507f1f77bcf86cd799439011';
export const TEST_EMAIL = 'test@example.com';
export const TEST_USERNAME = 'testuser';
export const TEST_DATE = new Date('2024-01-01');