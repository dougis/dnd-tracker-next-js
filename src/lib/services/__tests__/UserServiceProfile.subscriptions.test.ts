import '../__test-helpers__/test-setup';
import { UserServiceProfile } from '../UserServiceProfile';
import {
  TEST_CONSTANTS,
  createMockUser,
  createMockPublicUser,
  MockServiceHelpers,
  AssertionHelpers,
  TestScenarios,
  SUBSCRIPTION_TIERS,
} from './UserServiceProfile.test-helpers';

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../UserServiceHelpers');
jest.mock('../UserServiceValidation');
jest.mock('../UserServiceDatabase');
jest.mock('../UserServiceLookup');
jest.mock('../UserServiceResponseHelpers');

/**
 * Tests for UserServiceProfile subscription management functionality
 * Covers updateSubscription method for all subscription tiers
 */
describe('UserServiceProfile - Subscription Management', () => {
  const mockUser = createMockUser();
  const mockPublicUser = createMockPublicUser();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateSubscription', () => {
    SUBSCRIPTION_TIERS.forEach(tier => {
      it(`should successfully update subscription to ${tier}`, async () => {
        const { mockDatabase } = MockServiceHelpers.setupSubscriptionUpdate(mockUser, mockPublicUser);

        const result = await UserServiceProfile.updateSubscription(TEST_CONSTANTS.mockUserId, tier);

        AssertionHelpers.expectSuccessResult(result, mockPublicUser);
        AssertionHelpers.expectSubscriptionUpdate(mockDatabase, tier);
      });
    });

    it('should return error when user is not found for subscription update', async () => {
      await TestScenarios.testFailedRetrieval(
        UserServiceProfile.updateSubscription,
        [TEST_CONSTANTS.mockUserId, 'expert'],
        'USER_NOT_FOUND',
        'User not found'
      );
    });

    it('should handle database errors during subscription update', async () => {
      const databaseError = new Error('Database connection failed');
      const { mockLookup, mockResponseHelpers } = MockServiceHelpers.setupSimpleDatabaseError(
        databaseError,
        'Failed to update subscription',
        'SUBSCRIPTION_UPDATE_FAILED'
      );

      mockLookup.findUserOrError.mockRejectedValue(databaseError);

      const result = await UserServiceProfile.updateSubscription(TEST_CONSTANTS.mockUserId, 'expert');

      AssertionHelpers.expectErrorResult(result, 'SUBSCRIPTION_UPDATE_FAILED');
      expect(mockResponseHelpers.handleCustomError).toHaveBeenCalledWith(
        databaseError,
        'Failed to update subscription',
        'SUBSCRIPTION_UPDATE_FAILED'
      );
    });

    it('should handle invalid subscription tier', async () => {
      const mockLookup = MockServiceHelpers.getMockLookup();
      const invalidTierError = new Error('Invalid subscription tier');
      mockLookup.findUserOrError.mockRejectedValue(invalidTierError);

      const result = await UserServiceProfile.updateSubscription(TEST_CONSTANTS.mockUserId, 'invalid' as any);

      AssertionHelpers.expectErrorResult(result);
    });
  });
});