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
 * Uses shared utilities to eliminate cross-service duplication
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
 * Base mock setup patterns - reduces all setup duplication
 */
export class BaseMockSetup {
  static getMockServices() {
    return {
      mockValidation: require('../UserServiceValidation').UserServiceValidation,
      mockDatabase: require('../UserServiceDatabase').UserServiceDatabase,
      mockLookup: require('../UserServiceLookup').UserServiceLookup,
      mockResponseHelpers: require('../UserServiceResponseHelpers').UserServiceResponseHelpers,
    };
  }

  static setupStandardMockPattern(mockUser: any, mockPublicUser: PublicUser, MockedUser: any) {
    const services = this.getMockServices();
    
    MockedUser.findById.mockResolvedValue(mockUser);
    services.mockLookup.findUserOrError.mockResolvedValue({
      success: true,
      data: mockUser,
    });
    services.mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);
    services.mockResponseHelpers.createSuccessResponse.mockReturnValue({
      success: true,
      data: mockPublicUser,
    });
    
    return services;
  }

  static setupErrorPattern(error: Error, errorMessage: string, errorCode: string) {
    const services = this.getMockServices();
    
    services.mockResponseHelpers.handleCustomError.mockReturnValue({
      success: false,
      error: { message: errorMessage, code: errorCode, statusCode: 500 },
    });
    
    return services;
  }
}

/**
 * Mock service helpers - consolidates all mock setup patterns
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
    return BaseMockSetup.getMockServices();
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
    const services = BaseMockSetup.getMockServices();

    services.mockLookup.findUserOrError.mockResolvedValue({
      success: true,
      data: mockUser,
    });
    services.mockResponseHelpers.createSuccessResponse.mockReturnValue({
      success: true,
      data: mockPublicUser,
    });
    services.mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);

    return services;
  }

  static setupSubscriptionUpdate(mockUser: any, mockPublicUser: PublicUser) {
    const services = this.setupSuccessfulOperation(mockUser, mockPublicUser);
    services.mockDatabase.updateUserFieldsAndSave.mockResolvedValue(undefined);
    return services;
  }

  static setupDeletionSuccess(mockUser: any) {
    const services = BaseMockSetup.getMockServices();

    services.mockLookup.findUserOrError.mockResolvedValue({
      success: true,
      data: mockUser,
    });
    services.mockResponseHelpers.createSuccessResponse.mockReturnValue({
      success: true,
      data: { deleted: true },
    });

    return services;
  }

  static setupSimpleDatabaseError(error: Error, errorMessage: string, errorCode: string) {
    return BaseMockSetup.setupErrorPattern(error, errorMessage, errorCode);
  }

  static setupSuccessfulUserLookup(mockUser: any, mockPublicUser: PublicUser) {
    const services = BaseMockSetup.getMockServices();

    services.mockLookup.findUserOrError.mockResolvedValue({
      success: true,
      data: mockUser,
    });
    services.mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);
    services.mockResponseHelpers.createSuccessResponse.mockReturnValue({
      success: true,
      data: mockPublicUser,
    });

    return { mockLookup: services.mockLookup, mockResponseHelpers: services.mockResponseHelpers };
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
    const services = BaseMockSetup.getMockServices();

    services.mockValidation.validateAndParseProfileUpdate.mockImplementation(() => {
      throw error;
    });
    services.mockResponseHelpers.handleCustomError.mockReturnValue({
      success: false,
      error: { message: 'Validation failed', code: 'VALIDATION_ERROR', statusCode: 400 },
    });

    return { mockValidation: services.mockValidation, mockResponseHelpers: services.mockResponseHelpers };
  }

  // Consolidated profile update methods
  static setupProfileUpdateBase(mockUser: any, updateData: any, MockedUser: any) {
    const services = BaseMockSetup.getMockServices();

    MockedUser.findById.mockResolvedValue(mockUser);
    services.mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
    services.mockValidation.prepareConflictCheckParams.mockReturnValue({
      emailToCheck: undefined,
      usernameToCheck: undefined,
    });

    return services;
  }

  static setupSuccessfulProfileUpdate(mockUser: any, updateData: any, mockPublicUser: any, MockedUser: any) {
    const services = this.setupProfileUpdateBase(mockUser, updateData, MockedUser);
    
    services.mockDatabase.updateUserFieldsAndSave.mockResolvedValue(undefined);
    services.mockResponseHelpers.createSuccessResponse.mockReturnValue({
      success: true,
      data: mockPublicUser,
    });
    services.mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);

    return services;
  }

  static setupUserNotFoundForUpdate(MockedUser: any, updateData: any) {
    const mockValidation = this.getMockValidation();
    mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
    MockedUser.findById.mockResolvedValue(null);
    return { mockValidation };
  }

  static setupConflictDuringValidation(mockUser: any, conflictError: UserAlreadyExistsError, MockedUser: any) {
    const services = BaseMockSetup.getMockServices();
    
    MockedUser.findById.mockResolvedValue(mockUser);
    services.mockValidation.validateAndParseProfileUpdate.mockImplementation(() => {
      throw conflictError;
    });
    services.mockResponseHelpers.createErrorResponse.mockReturnValue({
      success: false,
      error: { message: `${conflictError.field} already exists`, code: 'USER_ALREADY_EXISTS', statusCode: 409 },
    });

    return { mockValidation: services.mockValidation, mockResponseHelpers: services.mockResponseHelpers };
  }

  static setupDatabaseError(mockUser: any, updateData: any, error: Error, MockedUser: any) {
    const services = this.setupProfileUpdateBase(mockUser, updateData, MockedUser);
    
    services.mockDatabase.updateUserFieldsAndSave.mockRejectedValue(error);
    services.mockResponseHelpers.handleCustomError.mockReturnValue({
      success: false,
      error: { message: 'Failed to update user profile', code: 'PROFILE_UPDATE_FAILED', statusCode: 500 },
    });

    return services;
  }

  static setupUserAlreadyExistsErrorDuringUpdate(mockUser: any, updateData: any, conflictError: UserAlreadyExistsError, MockedUser: any) {
    const services = this.setupProfileUpdateBase(mockUser, updateData, MockedUser);
    
    services.mockDatabase.updateUserFieldsAndSave.mockRejectedValue(conflictError);
    services.mockResponseHelpers.createErrorResponse.mockReturnValue({
      success: false,
      error: { message: `${conflictError.field} already exists`, code: 'USER_ALREADY_EXISTS', statusCode: 409 },
    });

    return services;
  }

  // Generic error setup patterns
  static setupValidationErrorInRetrieval(error: Error) {
    const services = BaseMockSetup.getMockServices();
    
    services.mockLookup.findUserOrError.mockRejectedValue(error);
    services.mockResponseHelpers.handleValidationError.mockReturnValue({
      success: false,
      error: { message: 'Validation error', code: 'VALIDATION_ERROR', statusCode: 400 },
    });

    return { mockLookup: services.mockLookup, mockResponseHelpers: services.mockResponseHelpers };
  }

  static setupCustomErrorInRetrieval(error: Error) {
    const services = BaseMockSetup.getMockServices();
    
    services.mockLookup.findUserOrError.mockRejectedValue(error);
    services.mockResponseHelpers.handleValidationError.mockImplementation(() => {
      throw new Error('Not a validation error');
    });
    services.mockResponseHelpers.handleCustomError.mockReturnValue({
      success: false,
      error: { message: 'User not found', code: 'USER_NOT_FOUND', statusCode: 404 },
    });

    return { mockLookup: services.mockLookup, mockResponseHelpers: services.mockResponseHelpers };
  }

  static setupEmailRetrievalError(error: Error) {
    const services = BaseMockSetup.getMockServices();
    
    services.mockLookup.findUserByEmailOrThrow.mockRejectedValue(error);
    services.mockResponseHelpers.handleCustomError.mockReturnValue({
      success: false,
      error: { message: 'Failed to retrieve user', code: 'USER_RETRIEVAL_FAILED', statusCode: 500 },
    });

    return { mockLookup: services.mockLookup, mockResponseHelpers: services.mockResponseHelpers };
  }
}

/**
 * Common assertion helpers - uses shared utilities
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
 * Test scenario generators - creates complete reusable test scenarios
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