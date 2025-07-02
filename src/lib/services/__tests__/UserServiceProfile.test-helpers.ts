import { type UserProfileUpdate } from '@/lib/validations/user';
import {
  UNIVERSAL_TEST_DATA,
  UNIVERSAL_MOCK_SETUP,
  UniversalServiceMocks,
  UniversalTestPatterns,
  UniversalAssertions,
  UniversalForEachPatterns,
} from './unified-test-patterns';

/**
 * UserServiceProfile test helpers - now uses unified patterns to eliminate ALL duplication
 * This file is dramatically simplified by leveraging universal test patterns
 */

// Export universal data with profile-specific naming for backwards compatibility
export const TEST_CONSTANTS = UNIVERSAL_TEST_DATA.constants;
export const createMockUser = UNIVERSAL_TEST_DATA.createMockUser;
export const createMockPublicUser = UNIVERSAL_TEST_DATA.createMockPublicUser;

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
 * Simplified mock helpers - delegates to universal patterns
 */
export class MockServiceHelpers {
  static getMockValidation = () => UniversalServiceMocks.getServices().mockValidation;

  static getMockDatabase = () => UniversalServiceMocks.getServices().mockDatabase;

  static getMockLookup = () => UniversalServiceMocks.getServices().mockLookup;

  static getMockResponseHelpers = () => UniversalServiceMocks.getServices().mockResponseHelpers;

  static setupBasicMocks = () => UniversalServiceMocks.getServices();

  static setupTestEnvironment = UNIVERSAL_MOCK_SETUP.getStandardMocks;

  // Delegates to universal patterns
  static setupSuccessfulOperation = UniversalTestPatterns.createSuccessfulOperation;

  static setupSubscriptionUpdate(mockUser: any, mockPublicUser: any) {
    const services = this.setupSuccessfulOperation(mockUser, mockPublicUser);
    services.mockDatabase.updateUserFieldsAndSave.mockResolvedValue(undefined);
    return services;
  }

  static setupDeletionSuccess(mockUser: any) {
    const services = UniversalServiceMocks.getServices();
    services.mockLookup.findUserOrError.mockResolvedValue({ success: true, data: mockUser });
    services.mockResponseHelpers.createSuccessResponse.mockReturnValue({ success: true, data: { deleted: true } });
    return services;
  }

  static setupSimpleDatabaseError = UniversalTestPatterns.createErrorOperation;

  static setupSuccessfulUserLookup(mockUser: any, mockPublicUser: any) {
    const services = this.setupSuccessfulOperation(mockUser, mockPublicUser);
    return { mockLookup: services.mockLookup, mockResponseHelpers: services.mockResponseHelpers };
  }

  static setupFailedUserLookup(errorCode: string, message: string, statusCode: number = 404) {
    const mockLookup = this.getMockLookup();
    const errorResult = { success: false, error: { message, code: errorCode, statusCode } };
    mockLookup.findUserOrError.mockResolvedValue(errorResult);
    return { mockLookup, errorResult };
  }

  static setupValidationError(error: Error) {
    const services = UniversalServiceMocks.getServices();
    services.mockValidation.validateAndParseProfileUpdate.mockImplementation(() => { throw error; });
    services.mockResponseHelpers.handleCustomError.mockReturnValue({
      success: false, error: { message: 'Validation failed', code: 'VALIDATION_ERROR', statusCode: 400 }
    });
    return { mockValidation: services.mockValidation, mockResponseHelpers: services.mockResponseHelpers };
  }

  // Profile update methods - simplified through delegation
  static setupSuccessfulProfileUpdate(mockUser: any, updateData: any, mockPublicUser: any, MockedUser: any) {
    const services = UniversalTestPatterns.createProfileUpdateBase(mockUser, updateData, MockedUser);
    services.mockDatabase.updateUserFieldsAndSave.mockResolvedValue(undefined);
    services.mockResponseHelpers.createSuccessResponse.mockReturnValue({ success: true, data: mockPublicUser });
    services.mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);
    return services;
  }

  static setupUserNotFoundForUpdate(MockedUser: any, updateData: any) {
    const mockValidation = this.getMockValidation();
    mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
    MockedUser.findById.mockResolvedValue(null);
    return { mockValidation };
  }

  static setupConflictDuringValidation(mockUser: any, conflictError: any, MockedUser: any) {
    const { setup } = UniversalTestPatterns.createConflictScenario(conflictError.field, conflictError.value);
    return setup(mockUser, MockedUser);
  }

  static setupDatabaseError(mockUser: any, updateData: any, error: Error, MockedUser: any) {
    const { setup } = UniversalTestPatterns.createDatabaseErrorScenario(error.message);
    return setup(mockUser, updateData, MockedUser);
  }

  static setupUserAlreadyExistsErrorDuringUpdate(mockUser: any, updateData: any, conflictError: any, MockedUser: any) {
    const services = UniversalTestPatterns.createProfileUpdateBase(mockUser, updateData, MockedUser);
    services.mockDatabase.updateUserFieldsAndSave.mockRejectedValue(conflictError);
    services.mockResponseHelpers.createErrorResponse.mockReturnValue({
      success: false, error: { message: `${conflictError.field} already exists`, code: 'USER_ALREADY_EXISTS', statusCode: 409 }
    });
    return services;
  }

  // Error setup patterns - all delegate to universal patterns
  static setupValidationErrorInRetrieval(error: Error) {
    const services = UniversalServiceMocks.getServices();
    services.mockLookup.findUserOrError.mockRejectedValue(error);
    services.mockResponseHelpers.handleValidationError.mockReturnValue({
      success: false, error: { message: 'Validation error', code: 'VALIDATION_ERROR', statusCode: 400 }
    });
    return { mockLookup: services.mockLookup, mockResponseHelpers: services.mockResponseHelpers };
  }

  static setupCustomErrorInRetrieval(error: Error) {
    const services = UniversalServiceMocks.getServices();
    services.mockLookup.findUserOrError.mockRejectedValue(error);
    services.mockResponseHelpers.handleValidationError.mockImplementation(() => { throw new Error('Not a validation error'); });
    services.mockResponseHelpers.handleCustomError.mockReturnValue({
      success: false, error: { message: 'User not found', code: 'USER_NOT_FOUND', statusCode: 404 }
    });
    return { mockLookup: services.mockLookup, mockResponseHelpers: services.mockResponseHelpers };
  }

  static setupEmailRetrievalError(error: Error) {
    const services = UniversalServiceMocks.getServices();
    services.mockLookup.findUserByEmailOrThrow.mockRejectedValue(error);
    services.mockResponseHelpers.handleCustomError.mockReturnValue({
      success: false, error: { message: 'Failed to retrieve user', code: 'USER_RETRIEVAL_FAILED', statusCode: 500 }
    });
    return { mockLookup: services.mockLookup, mockResponseHelpers: services.mockResponseHelpers };
  }
}

/**
 * Simplified assertion helpers - delegates to universal patterns
 */
export class AssertionHelpers {
  static expectSuccessResult = UniversalAssertions.expectStandardSuccess;

  static expectErrorResult = UniversalAssertions.expectStandardError;

  static expectDatabaseUpdate = UniversalAssertions.expectDatabaseUpdate;

  static expectSubscriptionUpdate = UniversalAssertions.expectSubscriptionUpdate;
}

/**
 * Simplified test scenarios - delegates to universal patterns
 */
export class TestScenarios {
  static async testSuccessfulRetrieval(serviceMethod: Function, methodArgs: any[], mockUser: any, mockPublicUser: any) {
    return await UniversalTestPatterns.testStandardRetrieval(serviceMethod, methodArgs, true, mockPublicUser);
  }

  static async testFailedRetrieval(serviceMethod: Function, methodArgs: any[], errorCode: string, message: string) {
    return await UniversalTestPatterns.testStandardRetrieval(serviceMethod, methodArgs, false, undefined, errorCode, message);
  }

  static createConflictTestScenario = UniversalTestPatterns.createConflictScenario;

  static createDatabaseErrorScenario = UniversalTestPatterns.createDatabaseErrorScenario;
}

// Export universal patterns for test structure consistency
export const TestPatterns = UniversalForEachPatterns;
export { SUBSCRIPTION_TIERS } from './shared-test-utilities';