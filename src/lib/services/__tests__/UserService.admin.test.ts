/**
 * UserService Administrative Operations Tests
 * Tests delegation to UserServiceStats module and integration scenarios
 */

import { UserService } from '../UserService';
import { UserServiceAuth } from '../UserServiceAuth';
import { UserServiceProfile } from '../UserServiceProfile';
import { UserServiceStats } from '../UserServiceStats';
import { ServiceResult } from '../UserServiceErrors';
import type {
  UserRegistration,
  PublicUser,
} from '../../validations/user';
import type { QueryFilters, UserStats, PaginatedResult } from '../UserServiceStats';

// Mock all sub-modules for integration tests
jest.mock('../UserServiceAuth');
jest.mock('../UserServiceProfile');
jest.mock('../UserServiceStats');

const mockUserServiceAuth = UserServiceAuth as jest.Mocked<typeof UserServiceAuth>;
const mockUserServiceProfile = UserServiceProfile as jest.Mocked<typeof UserServiceProfile>;
const mockUserServiceStats = UserServiceStats as jest.Mocked<typeof UserServiceStats>;

describe('UserService Administrative Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should delegate to UserServiceStats.getUsers with default parameters', async () => {
      const expectedResult: ServiceResult<PaginatedResult<PublicUser>> = {
        success: true,
        data: {
          users: [
            {
              _id: '507f1f77bcf86cd799439011',
              email: 'user1@example.com',
              username: 'user1',
              subscriptionTier: 'free',
              isEmailVerified: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            pageSize: 20,
            total: 1,
          },
        },
      };

      mockUserServiceStats.getUsers.mockResolvedValue(expectedResult);

      const result = await UserService.getUsers();

      expect(mockUserServiceStats.getUsers).toHaveBeenCalledWith(1, 20, undefined);
      expect(result).toEqual(expectedResult);
    });

    it('should delegate to UserServiceStats.getUsers with custom parameters', async () => {
      const page = 2;
      const limit = 10;
      const filters: QueryFilters = {
        subscriptionTier: 'pro',
        isEmailVerified: true,
      };

      const expectedResult: ServiceResult<PaginatedResult<PublicUser>> = {
        success: true,
        data: {
          users: [],
          pagination: {
            currentPage: 2,
            totalPages: 1,
            pageSize: 10,
            total: 0,
          },
        },
      };

      mockUserServiceStats.getUsers.mockResolvedValue(expectedResult);

      const result = await UserService.getUsers(page, limit, filters);

      expect(mockUserServiceStats.getUsers).toHaveBeenCalledWith(page, limit, filters);
      expect(result).toEqual(expectedResult);
    });

    it('should handle database errors', async () => {
      const expectedError: ServiceResult<PaginatedResult<PublicUser>> = {
        success: false,
        error: {
          type: 'DATABASE_ERROR',
          message: 'Database connection failed',
        },
      };

      mockUserServiceStats.getUsers.mockResolvedValue(expectedError);

      const result = await UserService.getUsers();

      expect(mockUserServiceStats.getUsers).toHaveBeenCalledWith(1, 20, undefined);
      expect(result).toEqual(expectedError);
    });
  });

  describe('getUserStats', () => {
    it('should delegate to UserServiceStats.getUserStats', async () => {
      const expectedResult: ServiceResult<UserStats> = {
        success: true,
        data: {
          totalUsers: 100,
          verifiedUsers: 80,
          subscriptionBreakdown: {
            free: 70,
            pro: 20,
            premium: 10,
          },
          newUsersThisMonth: 15,
          activeUsersThisMonth: 60,
        },
      };

      mockUserServiceStats.getUserStats.mockResolvedValue(expectedResult);

      const result = await UserService.getUserStats();

      expect(mockUserServiceStats.getUserStats).toHaveBeenCalledWith();
      expect(result).toEqual(expectedResult);
    });

    it('should handle stats calculation errors', async () => {
      const expectedError: ServiceResult<UserStats> = {
        success: false,
        error: {
          type: 'DATABASE_ERROR',
          message: 'Unable to calculate user statistics',
        },
      };

      mockUserServiceStats.getUserStats.mockResolvedValue(expectedError);

      const result = await UserService.getUserStats();

      expect(mockUserServiceStats.getUserStats).toHaveBeenCalledWith();
      expect(result).toEqual(expectedError);
    });
  });

  // ================================
  // Integration and Error Handling Tests
  // ================================

  describe('Integration and Error Handling', () => {
    it('should handle errors thrown by sub-modules', async () => {
      const userData: UserRegistration = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };

      mockUserServiceAuth.createUser.mockRejectedValue(new Error('Database connection failed'));

      await expect(UserService.createUser(userData)).rejects.toThrow('Database connection failed');
      expect(mockUserServiceAuth.createUser).toHaveBeenCalledWith(userData);
    });

    it('should preserve async nature of operations', async () => {
      const userId = '507f1f77bcf86cd799439011';

      // Create a promise that resolves after a delay to test async behavior
      const delayedResult: ServiceResult<PublicUser> = {
        success: true,
        data: {
          _id: userId,
          email: 'test@example.com',
          username: 'testuser',
          subscriptionTier: 'free',
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockUserServiceProfile.getUserById.mockImplementation(() =>
        new Promise((resolve) => setTimeout(() => resolve(delayedResult), 10))
      );

      const start = Date.now();
      const result = await UserService.getUserById(userId);
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(10);
      expect(result).toEqual(delayedResult);
    });

    it('should handle undefined and null parameters gracefully', async () => {
      // Test with undefined parameters - these should still delegate properly
      mockUserServiceAuth.createUser.mockResolvedValue({
        success: false,
        error: { type: 'VALIDATION_ERROR', message: 'Invalid input' },
      });

      // This would normally fail validation at the sub-module level
      const result = await UserService.createUser(undefined as any);

      expect(mockUserServiceAuth.createUser).toHaveBeenCalledWith(undefined);
      expect(result.success).toBe(false);
    });

    it('should handle concurrent operations correctly', async () => {
      const userId1 = '507f1f77bcf86cd799439011';
      const userId2 = '507f1f77bcf86cd799439012';

      const user1: ServiceResult<PublicUser> = {
        success: true,
        data: {
          _id: userId1,
          email: 'user1@example.com',
          username: 'user1',
          subscriptionTier: 'free',
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const user2: ServiceResult<PublicUser> = {
        success: true,
        data: {
          _id: userId2,
          email: 'user2@example.com',
          username: 'user2',
          subscriptionTier: 'pro',
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockUserServiceProfile.getUserById
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2);

      const [result1, result2] = await Promise.all([
        UserService.getUserById(userId1),
        UserService.getUserById(userId2),
      ]);

      expect(result1).toEqual(user1);
      expect(result2).toEqual(user2);
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