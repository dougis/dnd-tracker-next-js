/**
 * Test helpers for UserService tests to eliminate code duplication
 * Provides reusable mock data, test utilities, and assertion helpers
 */

import { ServiceResult } from '../UserServiceErrors';
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
import type { QueryFilters, UserStats, PaginatedResult } from '../UserServiceStats';

// ================================
// Mock Data Factories
// ================================

export const createMockPublicUser = (overrides: Partial<PublicUser> = {}): PublicUser => ({
  _id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  username: 'testuser',
  subscriptionTier: 'free',
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockUserRegistration = (overrides: Partial<UserRegistration> = {}): UserRegistration => ({
  email: 'test@example.com',
  username: 'testuser',
  password: 'Password123!',
  confirmPassword: 'Password123!',
  ...overrides,
});

export const createMockUserLogin = (overrides: Partial<UserLogin> = {}): UserLogin => ({
  email: 'test@example.com',
  password: 'Password123!',
  ...overrides,
});

export const createMockUserProfileUpdate = (overrides: Partial<UserProfileUpdate> = {}): UserProfileUpdate => ({
  username: 'newusername',
  firstName: 'John',
  lastName: 'Doe',
  ...overrides,
});

export const createMockChangePassword = (overrides: Partial<ChangePassword> = {}): ChangePassword => ({
  currentPassword: 'OldPassword123!',
  newPassword: 'NewPassword123!',
  confirmPassword: 'NewPassword123!',
  ...overrides,
});

export const createMockPasswordResetRequest = (overrides: Partial<PasswordResetRequest> = {}): PasswordResetRequest => ({
  email: 'test@example.com',
  ...overrides,
});

export const createMockPasswordReset = (overrides: Partial<PasswordReset> = {}): PasswordReset => ({
  token: 'reset-token-123',
  newPassword: 'NewPassword123!',
  confirmPassword: 'NewPassword123!',
  ...overrides,
});

export const createMockEmailVerification = (overrides: Partial<EmailVerification> = {}): EmailVerification => ({
  token: 'verification-token-123',
  ...overrides,
});

export const createMockQueryFilters = (overrides: Partial<QueryFilters> = {}): QueryFilters => ({
  subscriptionTier: 'pro',
  isEmailVerified: true,
  ...overrides,
});

export const createMockUserStats = (overrides: Partial<UserStats> = {}): UserStats => ({
  totalUsers: 100,
  verifiedUsers: 80,
  subscriptionBreakdown: {
    free: 70,
    pro: 20,
    premium: 10,
  },
  newUsersThisMonth: 15,
  activeUsersThisMonth: 60,
  ...overrides,
});

export const createMockPaginatedResult = <T>(
  items: T[],
  overrides: Partial<PaginatedResult<T>> = {}
): PaginatedResult<T> => ({
  users: items,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 20,
    total: items.length,
  },
  ...overrides,
});

// ================================
// ServiceResult Factories
// ================================

export const createSuccessResult = <T>(data: T): ServiceResult<T> => ({
  success: true,
  data,
});

export const createErrorResult = <T>(
  type: string,
  message: string,
  field?: string
): ServiceResult<T> => ({
  success: false,
  error: {
    type,
    message,
    ...(field && { field }),
  },
});

// Common error results
export const createUserNotFoundError = <T>(): ServiceResult<T> =>
  createErrorResult('USER_NOT_FOUND', 'User not found', 'userId');

export const createUserAlreadyExistsError = <T>(field: string = 'email'): ServiceResult<T> =>
  createErrorResult('USER_ALREADY_EXISTS', `User with this ${field} already exists`, field);

export const createInvalidCredentialsError = <T>(): ServiceResult<T> =>
  createErrorResult('INVALID_CREDENTIALS', 'Invalid email or password', 'password');

export const createInvalidTokenError = <T>(): ServiceResult<T> =>
  createErrorResult('INVALID_TOKEN', 'Invalid or expired token', 'token');

export const createDatabaseError = <T>(): ServiceResult<T> =>
  createErrorResult('DATABASE_ERROR', 'Database connection failed');

export const createValidationError = <T>(): ServiceResult<T> =>
  createErrorResult('VALIDATION_ERROR', 'Invalid input');

// ================================
// Test Utilities
// ================================

export const setupMockClearance = () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
};

export const createMockImplementation = <T>(result: T, delay: number = 0) => {
  if (delay > 0) {
    return () => new Promise<T>((resolve) => setTimeout(() => resolve(result), delay));
  }
  return () => Promise.resolve(result);
};

export const createMockRejection = (error: Error) => {
  return () => Promise.reject(error);
};

// ================================
// Assertion Helpers
// ================================

export const expectDelegationCall = (
  mockFn: jest.MockedFunction<any>,
  expectedArgs: any[],
  expectedResult: any,
  actualResult: any
) => {
  expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
  expect(actualResult).toEqual(expectedResult);
};

export const expectSingleCall = (mockFn: jest.MockedFunction<any>, ...expectedArgs: any[]) => {
  expect(mockFn).toHaveBeenCalledTimes(1);
  expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
};

export const expectMultipleCalls = (mockFn: jest.MockedFunction<any>, expectedCallCount: number) => {
  expect(mockFn).toHaveBeenCalledTimes(expectedCallCount);
};

export const expectErrorThrown = async (promise: Promise<any>, expectedError: string) => {
  await expect(promise).rejects.toThrow(expectedError);
};

export const expectSuccessResult = <T>(result: ServiceResult<T>, expectedData: T) => {
  expect(result.success).toBe(true);
  expect(result.data).toEqual(expectedData);
};

export const expectErrorResult = <T>(result: ServiceResult<T>, expectedErrorType: string) => {
  expect(result.success).toBe(false);
  expect(result.error?.type).toBe(expectedErrorType);
};

// ================================
// Common Test Data
// ================================

export const TEST_USER_ID = '507f1f77bcf86cd799439011';
export const TEST_USER_ID_2 = '507f1f77bcf86cd799439012';
export const TEST_EMAIL = 'test@example.com';
export const TEST_USERNAME = 'testuser';
export const TEST_PASSWORD = 'Password123!';

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