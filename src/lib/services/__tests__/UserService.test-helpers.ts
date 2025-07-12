/**
 * Test helpers for UserService tests to eliminate code duplication
 * Provides reusable mock data, test utilities, and assertion helpers
 */

// ServiceResult is used in re-exported functions from shared utilities
import type {
  UserRegistration,
  UserLogin,
  UserProfileUpdate,
  ChangePassword,
  PasswordResetRequest,
  PasswordReset,
  EmailVerification,
  PublicUser,
} from '../../validations/user';
import type {
  QueryFilters,
  UserStats,
  PaginatedResult,
} from '../UserServiceStats';
import {
  createFactory,
  errorFactories,
  testUtils,
  assertionHelpers,
  testConstants,
  mockDataTemplates,
} from './shared/test-factory-utils';
import { TestPasswordConstants } from '../../test-utils/password-constants';

// ================================
// Mock Data Factories
// ================================

// Using the shared factory utility to eliminate duplication
export const createMockPublicUser = createFactory<PublicUser>({
  id: testConstants.TEST_USER_ID,
  ...mockDataTemplates.userBase,
  role: 'user',
  subscriptionTier: 'free',
  preferences: mockDataTemplates.userPreferences,
  isEmailVerified: true,
  ...mockDataTemplates.timestamps,
});

export const createMockUserRegistration = createFactory<UserRegistration>({
  ...mockDataTemplates.userBase,
  ...mockDataTemplates.passwordFields,
  agreeToTerms: true,
  subscribeToNewsletter: false,
});

export const createMockUserLogin = createFactory<UserLogin>({
  email: mockDataTemplates.userBase.email,
  password: mockDataTemplates.passwordFields.password,
  rememberMe: false,
});

export const createMockUserProfileUpdate = createFactory<UserProfileUpdate>({
  username: 'newusername',
  firstName: 'John',
  lastName: 'Doe',
});

export const createMockChangePassword = createFactory<ChangePassword>({
  currentPassword: TestPasswordConstants.OLD_PASSWORD,
  newPassword: TestPasswordConstants.NEW_PASSWORD,
  confirmNewPassword: TestPasswordConstants.NEW_PASSWORD,
});

export const createMockPasswordResetRequest = createFactory<PasswordResetRequest>({
  email: testConstants.TEST_EMAIL,
});

export const createMockPasswordReset = createFactory<PasswordReset>({
  token: 'reset-token-123',
  password: TestPasswordConstants.NEW_PASSWORD,
  confirmPassword: TestPasswordConstants.NEW_PASSWORD,
});

export const createMockEmailVerification = createFactory<EmailVerification>({
  token: 'verification-token-123',
});

export const createMockQueryFilters = createFactory<QueryFilters>({
  subscriptionTier: 'expert',
  isEmailVerified: true,
});

export const createMockUserStats = createFactory<UserStats>({
  totalUsers: 100,
  verifiedUsers: 80,
  activeUsers: 60,
  subscriptionBreakdown: {
    free: 70,
    seasoned: 15,
    expert: 10,
    master: 4,
    guild: 1,
  },
});

export const createMockPaginatedResult = <T>(
  items: T[],
  overrides: Partial<PaginatedResult<T>> = {}
): PaginatedResult<T> => ({
  data: items,
  pagination: {
    page: 1,
    limit: 20,
    total: items.length,
    totalPages: 1,
  },
  ...overrides,
});

// ================================
// ServiceResult Factories (using shared utilities)
// ================================

// Re-export from shared utilities to maintain backward compatibility
export {
  createSuccessResult,
  createErrorResult
} from './shared/test-factory-utils';

// Use shared error factories
export const createUserNotFoundError = errorFactories.userNotFound;
export const createUserAlreadyExistsError = errorFactories.userAlreadyExists;
export const createInvalidCredentialsError = errorFactories.invalidCredentials;
export const createInvalidTokenError = errorFactories.invalidToken;
export const createDatabaseError = errorFactories.databaseError;
export const createValidationError = errorFactories.validationError;

// ================================
// Test Utilities (using shared utilities)
// ================================

// Re-export from shared utilities to maintain backward compatibility
export const setupMockClearance = testUtils.setupMockClearance;
export const createMockImplementation = testUtils.createMockImplementation;
export const createMockRejection = testUtils.createMockRejection;

// ================================
// Assertion Helpers (using shared utilities)
// ================================

// Re-export from shared utilities to maintain backward compatibility
export const expectDelegationCall = assertionHelpers.expectDelegationCall;
export const expectSingleCall = assertionHelpers.expectSingleCall;
export const expectMultipleCalls = assertionHelpers.expectMultipleCalls;
export const expectErrorThrown = assertionHelpers.expectErrorThrown;
export const expectSuccessResult = assertionHelpers.expectSuccessResult;
export const expectErrorResult = assertionHelpers.expectErrorResult;

// ================================
// Common Test Data (using shared constants)
// ================================

// Re-export from shared constants to maintain backward compatibility
export const TEST_USER_ID = testConstants.TEST_USER_ID;
export const TEST_USER_ID_2 = testConstants.TEST_USER_ID_2;
export const TEST_EMAIL = testConstants.TEST_EMAIL;
export const TEST_USERNAME = testConstants.TEST_USERNAME;
export const TEST_PASSWORD = testConstants.TEST_PASSWORD;

// ================================
// Integration Test Helpers
// ================================

export const createConcurrentTest = async <T>(
  operations: Array<() => Promise<T>>,
  expectedResults: T[]
) => {
  const results = await Promise.all(operations.map(op => op()));
  results.forEach((result, index) => {
    expect(result).toEqual(expectedResults[index]);
  });
  return results;
};

export const createTimingTest = async <T>(
  operation: () => Promise<T>,
  expectedMinDuration: number,
  expectedResult: T
) => {
  const start = Date.now();
  const result = await operation();
  const duration = Date.now() - start;

  expect(duration).toBeGreaterThanOrEqual(expectedMinDuration);
  expect(result).toEqual(expectedResult);
  return { result, duration };
};
