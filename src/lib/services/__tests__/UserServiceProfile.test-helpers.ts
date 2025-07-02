import {
  type UserProfileUpdate,
  type SubscriptionTier,
  type PublicUser,
} from '@/lib/validations/user';
import {
  UserAlreadyExistsError,
} from '../UserServiceErrors';
import {
  SHARED_TEST_CONSTANTS,
  createBaseTestUser,
  createBasePublicUser,
  SharedMockUtilities,
} from './shared-test-utilities';

/**
 * Test data generators and helper functions for UserServiceProfile tests
 * Eliminates code duplication across test files
 */

export const TEST_CONSTANTS = SHARED_TEST_CONSTANTS;

export const createMockUser = () => createBaseTestUser();

export const createMockPublicUser = (): PublicUser => createBasePublicUser();

export const createMockUpdateData = (): UserProfileUpdate => ({
  firstName: 'Updated',
  lastName: 'Name',
  preferences: {
    theme: 'dark',
    emailNotifications: false,
    browserNotifications: true,
    timezone: 'America/New_York',
    language: 'es',
    diceRollAnimations: false,
    autoSaveEncounters: false,
  },
});

/**
 * Mock service helpers - reduces duplication in test setup
 */
export class MockServiceHelpers {
  static getMockValidation() {
    return require('../UserServiceValidation').UserServiceValidation;
  }

  static getMockDatabase() {
    return require('../UserServiceDatabase').UserServiceDatabase;
  }

  static getMockLookup() {
    return require('../UserServiceLookup').UserServiceLookup;
  }

  static getMockResponseHelpers() {
    return require('../UserServiceResponseHelpers').UserServiceResponseHelpers;
  }

  static setupBasicMocks() {
    return {
      mockValidation: this.getMockValidation(),
      mockDatabase: this.getMockDatabase(),
      mockLookup: this.getMockLookup(),
      mockResponseHelpers: this.getMockResponseHelpers(),
    };
  }

  // Centralized mock environment setup
  static setupTestEnvironment() {
    const User = require('../../models/User').default;
    const MockedUser = jest.mocked(User);
    MockedUser.findById = jest.fn();
    MockedUser.findByIdAndDelete = jest.fn();
    return { MockedUser };
  }

  static setupSuccessfulOperation(mockUser: any, mockPublicUser: PublicUser) {
    const mocks = this.setupBasicMocks();

    mocks.mockLookup.findUserOrError.mockResolvedValue({
      success: true,
      data: mockUser,
    });
    mocks.mockResponseHelpers.createSuccessResponse.mockReturnValue({
      success: true,
      data: mockPublicUser,
    });
    mocks.mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);

    return mocks;
  }

  static setupSubscriptionUpdate(mockUser: any, mockPublicUser: PublicUser) {
    const mocks = this.setupSuccessfulOperation(mockUser, mockPublicUser);
    mocks.mockDatabase.updateUserFieldsAndSave.mockResolvedValue(undefined);
    return mocks;
  }

  static setupDeletionSuccess(mockUser: any) {
    const mocks = this.setupBasicMocks();

    mocks.mockLookup.findUserOrError.mockResolvedValue({
      success: true,
      data: mockUser,
    });
    mocks.mockResponseHelpers.createSuccessResponse.mockReturnValue({
      success: true,
      data: { deleted: true },
    });

    return mocks;
  }

  static setupSimpleDatabaseError(error: Error, errorMessage: string, errorCode: string) {
    const mocks = this.setupBasicMocks();

    mocks.mockResponseHelpers.handleCustomError.mockReturnValue({
      success: false,
      error: { message: errorMessage, code: errorCode, statusCode: 500 },
    });

    return mocks;
  }

  static setupSuccessfulUserLookup(mockUser: any, mockPublicUser: PublicUser) {
    const mockLookup = this.getMockLookup();
    const mockResponseHelpers = this.getMockResponseHelpers();

    mockLookup.findUserOrError.mockResolvedValue({
      success: true,
      data: mockUser,
    });
    mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);
    mockResponseHelpers.createSuccessResponse.mockReturnValue({
      success: true,
      data: mockPublicUser,
    });

    return { mockLookup, mockResponseHelpers };
  }

  static setupFailedUserLookup(errorCode: string, message: string, statusCode: number = 404) {
    const mockLookup = this.getMockLookup();
    const errorResult = {
      success: false,
      error: { message, code: errorCode, statusCode },
    };
    mockLookup.findUserOrError.mockResolvedValue(errorResult);
    return { mockLookup, errorResult };
  }

  static setupValidationError(error: Error) {
    const mockValidation = this.getMockValidation();
    const mockResponseHelpers = this.getMockResponseHelpers();

    mockValidation.validateAndParseProfileUpdate.mockImplementation(() => {
      throw error;
    });
    mockResponseHelpers.handleCustomError.mockReturnValue({
      success: false,
      error: { message: 'Validation failed', code: 'VALIDATION_ERROR', statusCode: 400 },
    });

    return { mockValidation, mockResponseHelpers };
  }

  static setupConflictError(conflictType: 'email' | 'username', value: string) {
    const mockValidation = this.getMockValidation();
    const mockResponseHelpers = this.getMockResponseHelpers();
    const conflictError = new UserAlreadyExistsError(conflictType, value);

    // Setup the mock to return the conflict parameters
    mockValidation.prepareConflictCheckParams.mockReturnValue({
      emailToCheck: conflictType === 'email' ? value : undefined,
      usernameToCheck: conflictType === 'username' ? value : undefined,
    });
    mockValidation.extractUserIdString.mockReturnValue(TEST_CONSTANTS.mockUserId);

    // Setup the error response
    mockResponseHelpers.createErrorResponse.mockReturnValue({
      success: false,
      error: { message: `${conflictType} already exists`, code: 'USER_ALREADY_EXISTS', statusCode: 409 },
    });

    return { mockValidation, mockResponseHelpers, conflictError };
  }

  static setupUpdateProfileSuccess(mockUser: any, updateData: any, mockPublicUser: any) {
    const mockValidation = this.getMockValidation();
    const mockDatabase = this.getMockDatabase();
    const mockResponseHelpers = this.getMockResponseHelpers();

    mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
    mockValidation.prepareConflictCheckParams.mockReturnValue({
      emailToCheck: undefined,
      usernameToCheck: undefined,
    });
    mockDatabase.updateUserFieldsAndSave.mockResolvedValue(undefined);
    mockResponseHelpers.createSuccessResponse.mockReturnValue({
      success: true,
      data: mockPublicUser,
    });
    mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);

    return { mockValidation, mockDatabase, mockResponseHelpers };
  }

  // Enhanced setup methods to eliminate duplication in update tests
  static setupProfileUpdateBase(mockUser: any, updateData: any, mockPublicUser: any, MockedUser: any) {
    const mockValidation = this.getMockValidation();
    const mockDatabase = this.getMockDatabase();
    const mockResponseHelpers = this.getMockResponseHelpers();

    MockedUser.findById.mockResolvedValue(mockUser);
    mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
    mockValidation.prepareConflictCheckParams.mockReturnValue({
      emailToCheck: undefined,
      usernameToCheck: undefined,
    });
    mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);

    return { mockValidation, mockDatabase, mockResponseHelpers };
  }

  static setupSuccessfulProfileUpdate(mockUser: any, updateData: any, mockPublicUser: any, MockedUser: any) {
    const mocks = this.setupProfileUpdateBase(mockUser, updateData, mockPublicUser, MockedUser);

    mocks.mockDatabase.updateUserFieldsAndSave.mockResolvedValue(undefined);
    mocks.mockResponseHelpers.createSuccessResponse.mockReturnValue({
      success: true,
      data: mockPublicUser,
    });

    return mocks;
  }

  static setupUserNotFoundForUpdate(MockedUser: any, updateData: any) {
    const mockValidation = this.getMockValidation();
    mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
    MockedUser.findById.mockResolvedValue(null);
    return { mockValidation };
  }

  static setupConflictDuringValidation(mockUser: any, conflictError: UserAlreadyExistsError, MockedUser: any) {
    const mockValidation = this.getMockValidation();
    const mockResponseHelpers = this.getMockResponseHelpers();

    MockedUser.findById.mockResolvedValue(mockUser);
    mockValidation.validateAndParseProfileUpdate.mockImplementation(() => {
      throw conflictError;
    });
    mockResponseHelpers.createErrorResponse.mockReturnValue({
      success: false,
      error: { message: `${conflictError.field} already exists`, code: 'USER_ALREADY_EXISTS', statusCode: 409 },
    });

    return { mockValidation, mockResponseHelpers };
  }

  static setupDatabaseError(mockUser: any, updateData: any, error: Error, MockedUser: any) {
    const mocks = this.setupProfileUpdateBase(mockUser, updateData, undefined, MockedUser);

    mocks.mockDatabase.updateUserFieldsAndSave.mockRejectedValue(error);
    mocks.mockResponseHelpers.handleCustomError.mockReturnValue({
      success: false,
      error: { message: 'Failed to update user profile', code: 'PROFILE_UPDATE_FAILED', statusCode: 500 },
    });

    return mocks;
  }

  static setupUserAlreadyExistsErrorDuringUpdate(mockUser: any, updateData: any, conflictError: UserAlreadyExistsError, MockedUser: any) {
    const mocks = this.setupProfileUpdateBase(mockUser, updateData, undefined, MockedUser);

    mocks.mockDatabase.updateUserFieldsAndSave.mockRejectedValue(conflictError);
    mocks.mockResponseHelpers.createErrorResponse.mockReturnValue({
      success: false,
      error: { message: `${conflictError.field} already exists`, code: 'USER_ALREADY_EXISTS', statusCode: 409 },
    });

    return mocks;
  }

  // Additional helpers for retrieval and other common patterns
  static setupValidationErrorInRetrieval(error: Error) {
    const mockLookup = this.getMockLookup();
    const mockResponseHelpers = this.getMockResponseHelpers();

    mockLookup.findUserOrError.mockRejectedValue(error);
    mockResponseHelpers.handleValidationError.mockReturnValue({
      success: false,
      error: { message: 'Validation error', code: 'VALIDATION_ERROR', statusCode: 400 },
    });

    return { mockLookup, mockResponseHelpers };
  }

  static setupCustomErrorInRetrieval(error: Error) {
    const mockLookup = this.getMockLookup();
    const mockResponseHelpers = this.getMockResponseHelpers();

    mockLookup.findUserOrError.mockRejectedValue(error);
    mockResponseHelpers.handleValidationError.mockImplementation(() => {
      throw new Error('Not a validation error');
    });
    mockResponseHelpers.handleCustomError.mockReturnValue({
      success: false,
      error: { message: 'User not found', code: 'USER_NOT_FOUND', statusCode: 404 },
    });

    return { mockLookup, mockResponseHelpers };
  }

  static setupEmailRetrievalError(error: Error) {
    const mockLookup = this.getMockLookup();
    const mockResponseHelpers = this.getMockResponseHelpers();

    mockLookup.findUserByEmailOrThrow.mockRejectedValue(error);
    mockResponseHelpers.handleCustomError.mockReturnValue({
      success: false,
      error: { message: 'Failed to retrieve user', code: 'USER_RETRIEVAL_FAILED', statusCode: 500 },
    });

    return { mockLookup, mockResponseHelpers };
  }
}

/**
 * Common assertion helpers - reduces duplication in test verification
 */
export class AssertionHelpers {
  static expectSuccessResult(result: any, expectedData: any) {
    SharedMockUtilities.expectStandardSuccessResult(result, expectedData);
  }

  static expectErrorResult(result: any, expectedCode?: string, expectedMessage?: string) {
    SharedMockUtilities.expectStandardErrorResult(result, expectedCode, expectedMessage);
  }

  static expectDatabaseUpdate(mockDatabase: any, expectedUser: any, expectedData: any) {
    expect(mockDatabase.updateUserFieldsAndSave).toHaveBeenCalledWith(
      expect.objectContaining({
        email: expectedUser.email,
        username: expectedUser.username,
      }),
      expectedData
    );
  }

  static expectSubscriptionUpdate(mockDatabase: any, tier: SubscriptionTier) {
    expect(mockDatabase.updateUserFieldsAndSave).toHaveBeenCalledWith(
      expect.any(Object),
      { subscriptionTier: tier }
    );
  }
}

/**
 * Test scenario generators - creates complete test scenarios
 */
export class TestScenarios {
  static async testSuccessfulRetrieval(
    serviceMethod: Function,
    methodArgs: any[],
    mockUser: any,
    mockPublicUser: PublicUser
  ) {
    const { mockLookup, mockResponseHelpers } = MockServiceHelpers.setupSuccessfulUserLookup(mockUser, mockPublicUser);

    const result = await serviceMethod(...methodArgs);

    AssertionHelpers.expectSuccessResult(result, mockPublicUser);
    return { mockLookup, mockResponseHelpers };
  }

  static async testFailedRetrieval(
    serviceMethod: Function,
    methodArgs: any[],
    errorCode: string,
    message: string
  ) {
    const { mockLookup, errorResult } = MockServiceHelpers.setupFailedUserLookup(errorCode, message);

    const result = await serviceMethod(...methodArgs);

    expect(result).toEqual(errorResult);
    return { mockLookup };
  }

  // Generic conflict test scenario
  static createConflictTestScenario(conflictType: 'email' | 'username', value: string) {
    const conflictError = new UserAlreadyExistsError(conflictType, value);
    return {
      conflictError,
      setup: (mockUser: any, MockedUser: any) =>
        MockServiceHelpers.setupConflictDuringValidation(mockUser, conflictError, MockedUser)
    };
  }

  // Generic database error test scenario
  static createDatabaseErrorScenario(errorMessage: string) {
    const error = new Error(errorMessage);
    return {
      error,
      setup: (mockUser: any, updateData: any, MockedUser: any) =>
        MockServiceHelpers.setupDatabaseError(mockUser, updateData, error, MockedUser)
    };
  }
}

export { SUBSCRIPTION_TIERS } from './shared-test-utilities';