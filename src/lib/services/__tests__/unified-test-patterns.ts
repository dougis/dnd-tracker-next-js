/**
 * Unified test patterns - eliminates ALL remaining duplication
 * Single source of truth for all test setup patterns across UserService modules
 */

import { type PublicUser, type SubscriptionTier } from '@/lib/validations/user';
import { UserAlreadyExistsError } from '../UserServiceErrors';
import {
  SHARED_TEST_CONSTANTS,
  createBaseTestUser,
  createBasePublicUser,
  SharedMockUtilities
} from './shared-test-utilities';

/**
 * Universal test data and constants - single source across all test files
 */
export const UNIVERSAL_TEST_DATA = {
  constants: SHARED_TEST_CONSTANTS,
  createMockUser: () => createBaseTestUser(),
  createMockPublicUser: (): PublicUser => createBasePublicUser(),
};

/**
 * Universal mock imports and setup - eliminates import duplication
 */
export const UNIVERSAL_MOCK_SETUP = {
  mockPaths: [
    '../../models/User',
    '../UserServiceHelpers',
    '../UserServiceValidation',
    '../UserServiceDatabase',
    '../UserServiceLookup',
    '../UserServiceResponseHelpers',
  ],

  setupAllMocks() {
    this.mockPaths.forEach(path => jest.mock(path));
  },

  getStandardMocks() {
    const User = require('../../models/User').default;
    const MockedUser = jest.mocked(User);
    const { checkProfileUpdateConflicts } = require('../UserServiceHelpers');
    const mockCheckProfileUpdateConflicts = jest.mocked(checkProfileUpdateConflicts);

    return { MockedUser, mockCheckProfileUpdateConflicts };
  }
};

/**
 * Universal service initialization - single pattern for all service mocks
 */
export class UniversalServiceMocks {
  private static services: any = null;

  static getServices() {
    if (!this.services) {
      this.services = {
        mockValidation: require('../UserServiceValidation').UserServiceValidation,
        mockDatabase: require('../UserServiceDatabase').UserServiceDatabase,
        mockLookup: require('../UserServiceLookup').UserServiceLookup,
        mockResponseHelpers: require('../UserServiceResponseHelpers').UserServiceResponseHelpers,
      };
    }
    return this.services;
  }

  static resetServices() {
    this.services = null;
  }
}

/**
 * Universal test patterns - single implementation for all common test scenarios
 */
export class UniversalTestPatterns {

  static setupStandardBeforeEach(additionalSetup?: () => void) {
    beforeEach(() => {
      jest.clearAllMocks();
      UniversalServiceMocks.resetServices();
      const { MockedUser } = UNIVERSAL_MOCK_SETUP.getStandardMocks();
      MockedUser.findById = jest.fn();
      MockedUser.findByIdAndDelete = jest.fn();
      additionalSetup?.();
    });
  }

  static createSuccessfulOperation(mockUser: any, mockPublicUser: PublicUser) {
    const services = UniversalServiceMocks.getServices();

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

  static createErrorOperation(error: Error, errorMessage: string, errorCode: string) {
    const services = UniversalServiceMocks.getServices();

    services.mockResponseHelpers.handleCustomError.mockReturnValue({
      success: false,
      error: { message: errorMessage, code: errorCode, statusCode: 500 },
    });

    return services;
  }

  static createProfileUpdateBase(mockUser: any, updateData: any, MockedUser: any) {
    const services = UniversalServiceMocks.getServices();

    MockedUser.findById.mockResolvedValue(mockUser);
    services.mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
    services.mockValidation.prepareConflictCheckParams.mockReturnValue({
      emailToCheck: undefined,
      usernameToCheck: undefined,
    });

    return services;
  }

  static createConflictScenario(conflictType: 'email' | 'username', value: string) {
    const conflictError = new UserAlreadyExistsError(conflictType, value);

    return {
      conflictError,
      setup: (mockUser: any, MockedUser: any) => {
        const services = UniversalServiceMocks.getServices();

        MockedUser.findById.mockResolvedValue(mockUser);
        services.mockValidation.validateAndParseProfileUpdate.mockImplementation(() => {
          throw conflictError;
        });
        services.mockResponseHelpers.createErrorResponse.mockReturnValue({
          success: false,
          error: { message: `${conflictError.field} already exists`, code: 'USER_ALREADY_EXISTS', statusCode: 409 },
        });

        return services;
      }
    };
  }

  static createDatabaseErrorScenario(errorMessage: string) {
    const error = new Error(errorMessage);

    return {
      error,
      setup: (mockUser: any, updateData: any, MockedUser: any) => {
        const services = UniversalTestPatterns.createProfileUpdateBase(mockUser, updateData, MockedUser);

        services.mockDatabase.updateUserFieldsAndSave.mockRejectedValue(error);
        services.mockResponseHelpers.handleCustomError.mockReturnValue({
          success: false,
          error: { message: 'Failed to update user profile', code: 'PROFILE_UPDATE_FAILED', statusCode: 500 },
        });

        return services;
      }
    };
  }

  static async testStandardRetrieval(
    serviceMethod: Function,
    methodArgs: any[],
    expectSuccess: boolean = true,
    expectedData?: any,
    errorCode?: string,
    errorMessage?: string
  ) {
    const mockUser = UNIVERSAL_TEST_DATA.createMockUser();
    const mockPublicUser = UNIVERSAL_TEST_DATA.createMockPublicUser();

    if (expectSuccess) {
      this.createSuccessfulOperation(mockUser, mockPublicUser);
      const result = await serviceMethod(...methodArgs);
      SharedMockUtilities.expectStandardSuccessResult(result, expectedData || mockPublicUser);
      return result;
    } else {
      const services = UniversalServiceMocks.getServices();
      const errorResult = {
        success: false,
        error: { message: errorMessage || 'Error', code: errorCode || 'ERROR', statusCode: 404 },
      };
      services.mockLookup.findUserOrError.mockResolvedValue(errorResult);

      const result = await serviceMethod(...methodArgs);
      expect(result).toEqual(errorResult);
      return result;
    }
  }
}

/**
 * Universal assertions - single implementation for all assertion patterns
 */
export class UniversalAssertions {
  static expectStandardSuccess(result: any, expectedData?: any) {
    SharedMockUtilities.expectStandardSuccessResult(result, expectedData);
  }

  static expectStandardError(result: any, expectedCode?: string, expectedMessage?: string) {
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
 * Universal forEach test patterns - eliminates repetitive test structures
 */
export class UniversalForEachPatterns {
  static testAllSubscriptionTiers(
    testMethod: (_tier: SubscriptionTier) => Promise<void>,
    subscriptionTiers: SubscriptionTier[]
  ) {
    subscriptionTiers.forEach(tier => {
      it(`should handle ${tier} subscription tier`, async () => {
        await testMethod(tier);
      });
    });
  }

  static testAllConflictTypes(
    testMethod: (_conflictType: 'email' | 'username', _value: string) => Promise<void>
  ) {
    const conflictScenarios = [
      { type: 'email', value: 'existing@example.com' },
      { type: 'username', value: 'existinguser' }
    ] as const;

    conflictScenarios.forEach(({ type, value }) => {
      it(`should handle ${type} conflicts`, async () => {
        await testMethod(type, value);
      });
    });
  }

  static testAllErrorScenarios(
    testMethod: (_errorType: string, _errorMessage: string) => Promise<void>
  ) {
    const errorScenarios = [
      { type: 'Database', message: 'Database connection failed' },
      { type: 'Validation', message: 'Invalid data provided' },
      { type: 'Network', message: 'Network timeout' }
    ];

    errorScenarios.forEach(({ type, message }) => {
      it(`should handle ${type.toLowerCase()} errors`, async () => {
        await testMethod(type, message);
      });
    });
  }
}