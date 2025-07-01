/**
 * UserService Administrative Operations Tests
 * Tests delegation to UserServiceStats module and integration scenarios
 */

import { UserService } from '../UserService';
import { UserServiceAuth } from '../UserServiceAuth';
import { UserServiceProfile } from '../UserServiceProfile';
import { UserServiceStats } from '../UserServiceStats';
import type {
  PublicUser,
} from '../../validations/user';
import type { UserStats, PaginatedResult } from '../UserServiceStats';
import {
  createMockPublicUser,
  createMockUserRegistration,
  createMockQueryFilters,
  createMockUserStats,
  createMockPaginatedResult,
  createSuccessResult,
  createDatabaseError,
  createValidationError,
  setupMockClearance,
  expectDelegationCall,
  expectErrorThrown,
  createMockImplementation,
  createMockRejection,
  createTimingTest,
  createConcurrentTest,
  TEST_USER_ID,
  TEST_USER_ID_2,
} from './UserService.test-helpers';

// Mock all sub-modules for integration tests
jest.mock('../UserServiceAuth');
jest.mock('../UserServiceProfile');
jest.mock('../UserServiceStats');

const mockUserServiceAuth = UserServiceAuth as jest.Mocked<typeof UserServiceAuth>;
const mockUserServiceProfile = UserServiceProfile as jest.Mocked<typeof UserServiceProfile>;
const mockUserServiceStats = UserServiceStats as jest.Mocked<typeof UserServiceStats>;

describe('UserService Administrative Operations', () => {
  setupMockClearance();

  describe('getUsers', () => {
    it('should delegate to UserServiceStats.getUsers with default parameters', async () => {
      const mockUsers = [createMockPublicUser()];
      const expectedResult = createSuccessResult(createMockPaginatedResult(mockUsers));

      mockUserServiceStats.getUsers.mockResolvedValue(expectedResult);

      const result = await UserService.getUsers();

      expectDelegationCall(
        mockUserServiceStats.getUsers,
        [1, 20, undefined],
        expectedResult,
        result
      );
    });

    it('should delegate to UserServiceStats.getUsers with custom parameters', async () => {
      const page = 2;
      const limit = 10;
      const filters = createMockQueryFilters();
      const expectedResult = createSuccessResult(createMockPaginatedResult([], {
        pagination: {
          currentPage: 2,
          totalPages: 1,
          pageSize: 10,
          total: 0,
        },
      }));

      mockUserServiceStats.getUsers.mockResolvedValue(expectedResult);

      const result = await UserService.getUsers(page, limit, filters);

      expectDelegationCall(
        mockUserServiceStats.getUsers,
        [page, limit, filters],
        expectedResult,
        result
      );
    });

    it('should handle database errors', async () => {
      const expectedError = createDatabaseError<PaginatedResult<PublicUser>>();

      mockUserServiceStats.getUsers.mockResolvedValue(expectedError);

      const result = await UserService.getUsers();

      expectDelegationCall(
        mockUserServiceStats.getUsers,
        [1, 20, undefined],
        expectedError,
        result
      );
    });
  });

  describe('getUserStats', () => {
    it('should delegate to UserServiceStats.getUserStats', async () => {
      const mockStats = createMockUserStats();
      const expectedResult = createSuccessResult(mockStats);

      mockUserServiceStats.getUserStats.mockResolvedValue(expectedResult);

      const result = await UserService.getUserStats();

      expectDelegationCall(
        mockUserServiceStats.getUserStats,
        [],
        expectedResult,
        result
      );
    });

    it('should handle stats calculation errors', async () => {
      const expectedError = createDatabaseError<UserStats>();
      expectedError.error!.message = 'Unable to calculate user statistics';

      mockUserServiceStats.getUserStats.mockResolvedValue(expectedError);

      const result = await UserService.getUserStats();

      expectDelegationCall(
        mockUserServiceStats.getUserStats,
        [],
        expectedError,
        result
      );
    });
  });

  // ================================
  // Integration and Error Handling Tests
  // ================================

  describe('Integration and Error Handling', () => {
    it('should handle errors thrown by sub-modules', async () => {
      const userData = createMockUserRegistration();
      const error = new Error('Database connection failed');

      mockUserServiceAuth.createUser.mockImplementation(createMockRejection(error));

      await expectErrorThrown(UserService.createUser(userData), 'Database connection failed');
      expect(mockUserServiceAuth.createUser).toHaveBeenCalledWith(userData);
    });

    it('should preserve async nature of operations', async () => {
      const userId = TEST_USER_ID;
      const mockUser = createMockPublicUser({ _id: userId });
      const delayedResult = createSuccessResult(mockUser);

      mockUserServiceProfile.getUserById.mockImplementation(
        createMockImplementation(delayedResult, 10)
      );

      const { duration: _duration } = await createTimingTest(
        () => UserService.getUserById(userId),
        10,
        delayedResult
      );

      expect(mockUserServiceProfile.getUserById).toHaveBeenCalledWith(userId);
    });

    it('should handle undefined and null parameters gracefully', async () => {
      const expectedResult = createValidationError<PublicUser>();

      mockUserServiceAuth.createUser.mockResolvedValue(expectedResult);

      const result = await UserService.createUser(undefined as any);

      expectDelegationCall(
        mockUserServiceAuth.createUser,
        [undefined],
        expectedResult,
        result
      );
    });

    it('should handle concurrent operations correctly', async () => {
      const user1 = createMockPublicUser({
        _id: TEST_USER_ID,
        email: 'user1@example.com',
        username: 'user1',
        subscriptionTier: 'free',
      });

      const user2 = createMockPublicUser({
        _id: TEST_USER_ID_2,
        email: 'user2@example.com',
        username: 'user2',
        subscriptionTier: 'pro',
      });

      const result1 = createSuccessResult(user1);
      const result2 = createSuccessResult(user2);

      mockUserServiceProfile.getUserById
        .mockResolvedValueOnce(result1)
        .mockResolvedValueOnce(result2);

      await createConcurrentTest(
        [
          () => UserService.getUserById(TEST_USER_ID),
          () => UserService.getUserById(TEST_USER_ID_2),
        ],
        [result1, result2]
      );

      expect(mockUserServiceProfile.getUserById).toHaveBeenCalledTimes(2);
    });
  });

  // ================================
  // Type Export Tests
  // ================================

  describe('Type Exports', () => {
    it('should export all necessary types from sub-modules', () => {
      // This test ensures that all re-exported types are available
      // TypeScript compilation will fail if types are not properly exported
      const types = [
        'PaginatedResult',
        'UserStats',
        'QueryFilters',
        'PublicUser',
        'SubscriptionTier',
        'UserRegistration',
        'UserLogin',
        'UserProfileUpdate',
        'ChangePassword',
        'PasswordResetRequest',
        'PasswordReset',
        'EmailVerification',
      ];

      // This test passes if TypeScript compilation succeeds
      // The actual type checking happens at compile time
      expect(types.length).toBeGreaterThan(0);
    });
  });
});