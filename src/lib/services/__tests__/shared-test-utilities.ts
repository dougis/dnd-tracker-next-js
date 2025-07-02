import { type SubscriptionTier, type PublicUser } from '@/lib/validations/user';

/**
 * Shared test utilities across UserService modules
 * Eliminates duplication between UserServiceProfile and UserServiceStats test helpers
 */

export const SHARED_TEST_CONSTANTS = {
  mockUserId: '507f1f77bcf86cd799439011',
  mockEmail: 'test@example.com',
  mockUsername: 'testuser',
} as const;

/**
 * Base mock user creation - shared across all UserService tests
 */
export const createBaseTestUser = (id: number = 1, overrides: any = {}) => ({
  _id: `${SHARED_TEST_CONSTANTS.mockUserId.slice(0, -2)}${id.toString().padStart(2, '0')}`,
  email: `test${id}@example.com`,
  username: `testuser${id}`,
  firstName: 'Test',
  lastName: `User${id}`,
  role: 'user' as const,
  subscriptionTier: 'free' as SubscriptionTier,
  isEmailVerified: false,
  preferences: {
    theme: 'system' as const,
    emailNotifications: true,
    browserNotifications: false,
    timezone: 'UTC',
    language: 'en',
    diceRollAnimations: true,
    autoSaveEncounters: true,
  },
  lastLoginAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  save: jest.fn(),
  toPublicJSON: jest.fn(),
  ...overrides,
});

/**
 * Base public user creation - shared across all UserService tests
 */
export const createBasePublicUser = (id: number = 1, overrides: any = {}): PublicUser => ({
  id: `${SHARED_TEST_CONSTANTS.mockUserId.slice(0, -2)}${id.toString().padStart(2, '0')}`,
  email: `test${id}@example.com`,
  username: `testuser${id}`,
  firstName: 'Test',
  lastName: `User${id}`,
  role: 'user',
  subscriptionTier: 'free',
  isEmailVerified: false,
  preferences: {
    theme: 'system',
    emailNotifications: true,
    browserNotifications: false,
    timezone: 'UTC',
    language: 'en',
    diceRollAnimations: true,
    autoSaveEncounters: true,
  },
  lastLoginAt: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

/**
 * Shared mock setup utilities
 */
export class SharedMockUtilities {
  static setupStandardBeforeEach(additionalSetup?: () => void) {
    beforeEach(() => {
      jest.clearAllMocks();
      additionalSetup?.();
    });
  }

  static createMockQueryChain<T>(mockData: T[], totalCount?: number) {
    const chainMethods = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockData),
      countDocuments: jest.fn().mockResolvedValue(totalCount ?? mockData.length),
    };

    return chainMethods;
  }

  static expectStandardSuccessResult(result: any, expectedData?: any) {
    expect(result.success).toBe(true);
    if (expectedData !== undefined) {
      expect(result.data).toEqual(expectedData);
    }
  }

  static expectStandardErrorResult(result: any, expectedCode?: string, expectedMessage?: string) {
    expect(result.success).toBe(false);
    if (expectedCode) {
      expect(result.error?.code).toBe(expectedCode);
    }
    if (expectedMessage) {
      expect(result.error?.message).toBe(expectedMessage);
    }
  }
}

/**
 * Common test imports - reduces import duplication
 */
export const COMMON_TEST_IMPORTS = {
  testSetup: '../__test-helpers__/test-setup',
  userValidations: '@/lib/validations/user',
  userServiceErrors: '../UserServiceErrors',
};

/**
 * Standard jest mock patterns
 */
export const STANDARD_JEST_MOCKS = [
  '../../models/User',
  '../UserServiceHelpers',
  '../UserServiceValidation',
  '../UserServiceDatabase',
  '../UserServiceLookup',
  '../UserServiceResponseHelpers',
];

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = ['free', 'seasoned', 'expert', 'master', 'guild'];