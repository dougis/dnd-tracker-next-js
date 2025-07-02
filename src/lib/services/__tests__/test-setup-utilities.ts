/**
 * Standardized test setup utilities
 * Eliminates duplication of mock imports and beforeEach patterns
 */

import { STANDARD_JEST_MOCKS, SharedMockUtilities } from './shared-test-utilities';

/**
 * Setup standard mocks for UserService tests
 */
export const setupStandardMocks = () => {
  // Apply all standard mocks
  STANDARD_JEST_MOCKS.forEach(mockPath => {
    jest.mock(mockPath);
  });
};

/**
 * Common mock setup for UserServiceProfile tests
 */
export const setupUserServiceProfileMocks = () => {
  setupStandardMocks();

  // Additional profile-specific mocks
  const User = require('../../models/User').default;
  const { checkProfileUpdateConflicts } = require('../UserServiceHelpers');

  const MockedUser = jest.mocked(User);
  const mockCheckProfileUpdateConflicts = jest.mocked(checkProfileUpdateConflicts);

  return { MockedUser, mockCheckProfileUpdateConflicts };
};

/**
 * Standard beforeEach setup for profile tests
 */
export const setupProfileTestEnvironment = (additionalSetup?: () => void) => {
  SharedMockUtilities.setupStandardBeforeEach(() => {
    const { MockedUser } = setupUserServiceProfileMocks();
    MockedUser.findById = jest.fn();
    MockedUser.findByIdAndDelete = jest.fn();
    additionalSetup?.();
  });
};

/**
 * Standard beforeEach setup for stats tests
 */
export const setupStatsTestEnvironment = (additionalSetup?: () => void) => {
  SharedMockUtilities.setupStandardBeforeEach(() => {
    additionalSetup?.();
  });
};