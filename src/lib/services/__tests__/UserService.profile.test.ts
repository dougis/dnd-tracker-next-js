/**
 * UserService Profile Management Operations Tests
 * Tests delegation to UserServiceProfile module
 */

import { UserService } from '../UserService';
import { UserServiceProfile } from '../UserServiceProfile';
import type { PublicUser, SubscriptionTier } from '../../validations/user';
import {
  createMockPublicUser,
  createMockUserProfileUpdate,
  createSuccessResult,
  createUserNotFoundError,
  createUserAlreadyExistsError,
  setupMockClearance,
  expectDelegationCall,
  TEST_USER_ID,
  TEST_EMAIL,
} from './UserService.test-helpers';

// Mock UserServiceProfile
jest.mock('../UserServiceProfile');

const mockUserServiceProfile = UserServiceProfile as jest.Mocked<
  typeof UserServiceProfile
>;

describe('UserService Profile Management Operations', () => {
  setupMockClearance();

  describe('getUserById', () => {
    it('should delegate to UserServiceProfile.getUserById', async () => {
      const userId = TEST_USER_ID;
      const mockUser = createMockPublicUser({ _id: userId });
      const expectedResult = createSuccessResult(mockUser);

      mockUserServiceProfile.getUserById.mockResolvedValue(expectedResult);

      const result = await UserService.getUserById(userId);

      expectDelegationCall(
        mockUserServiceProfile.getUserById,
        [userId],
        expectedResult,
        result
      );
    });

    it('should handle user not found', async () => {
      const userId = TEST_USER_ID;
      const expectedError = createUserNotFoundError<PublicUser>();

      mockUserServiceProfile.getUserById.mockResolvedValue(expectedError);

      const result = await UserService.getUserById(userId);

      expectDelegationCall(
        mockUserServiceProfile.getUserById,
        [userId],
        expectedError,
        result
      );
    });
  });

  describe('getUserByEmail', () => {
    it('should delegate to UserServiceProfile.getUserByEmail', async () => {
      const email = TEST_EMAIL;
      const mockUser = createMockPublicUser({ email });
      const expectedResult = createSuccessResult(mockUser);

      mockUserServiceProfile.getUserByEmail.mockResolvedValue(expectedResult);

      const result = await UserService.getUserByEmail(email);

      expectDelegationCall(
        mockUserServiceProfile.getUserByEmail,
        [email],
        expectedResult,
        result
      );
    });

    it('should handle user not found by email', async () => {
      const email = 'nonexistent@example.com';
      const expectedError = createUserNotFoundError<PublicUser>();
      expectedError.error!.field = 'email';

      mockUserServiceProfile.getUserByEmail.mockResolvedValue(expectedError);

      const result = await UserService.getUserByEmail(email);

      expectDelegationCall(
        mockUserServiceProfile.getUserByEmail,
        [email],
        expectedError,
        result
      );
    });
  });

  describe('updateUserProfile', () => {
    it('should delegate to UserServiceProfile.updateUserProfile', async () => {
      const userId = TEST_USER_ID;
      const updateData = createMockUserProfileUpdate();
      const mockUser = createMockPublicUser({
        _id: userId,
        username: updateData.username,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
      });
      const expectedResult = createSuccessResult(mockUser);

      mockUserServiceProfile.updateUserProfile.mockResolvedValue(
        expectedResult
      );

      const result = await UserService.updateUserProfile(userId, updateData);

      expectDelegationCall(
        mockUserServiceProfile.updateUserProfile,
        [userId, updateData],
        expectedResult,
        result
      );
    });

    it('should handle update conflicts', async () => {
      const userId = TEST_USER_ID;
      const updateData = createMockUserProfileUpdate({
        email: 'existing@example.com',
      });
      const expectedError = createUserAlreadyExistsError<PublicUser>();

      mockUserServiceProfile.updateUserProfile.mockResolvedValue(expectedError);

      const result = await UserService.updateUserProfile(userId, updateData);

      expectDelegationCall(
        mockUserServiceProfile.updateUserProfile,
        [userId, updateData],
        expectedError,
        result
      );
    });
  });

  describe('updateSubscription', () => {
    it('should delegate to UserServiceProfile.updateSubscription', async () => {
      const userId = TEST_USER_ID;
      const newTier: SubscriptionTier = 'pro';
      const mockUser = createMockPublicUser({
        _id: userId,
        subscriptionTier: newTier,
      });
      const expectedResult = createSuccessResult(mockUser);

      mockUserServiceProfile.updateSubscription.mockResolvedValue(
        expectedResult
      );

      const result = await UserService.updateSubscription(userId, newTier);

      expectDelegationCall(
        mockUserServiceProfile.updateSubscription,
        [userId, newTier],
        expectedResult,
        result
      );
    });

    it('should handle subscription update for non-existent user', async () => {
      const userId = TEST_USER_ID;
      const newTier: SubscriptionTier = 'pro';
      const expectedError = createUserNotFoundError<PublicUser>();

      mockUserServiceProfile.updateSubscription.mockResolvedValue(
        expectedError
      );

      const result = await UserService.updateSubscription(userId, newTier);

      expectDelegationCall(
        mockUserServiceProfile.updateSubscription,
        [userId, newTier],
        expectedError,
        result
      );
    });
  });

  describe('deleteUser', () => {
    it('should delegate to UserServiceProfile.deleteUser', async () => {
      const userId = TEST_USER_ID;
      const expectedResult = createSuccessResult<void>(undefined);

      mockUserServiceProfile.deleteUser.mockResolvedValue(expectedResult);

      const result = await UserService.deleteUser(userId);

      expectDelegationCall(
        mockUserServiceProfile.deleteUser,
        [userId],
        expectedResult,
        result
      );
    });

    it('should handle delete user not found', async () => {
      const userId = TEST_USER_ID;
      const expectedError = createUserNotFoundError<void>();

      mockUserServiceProfile.deleteUser.mockResolvedValue(expectedError);

      const result = await UserService.deleteUser(userId);

      expectDelegationCall(
        mockUserServiceProfile.deleteUser,
        [userId],
        expectedError,
        result
      );
    });
  });
});
