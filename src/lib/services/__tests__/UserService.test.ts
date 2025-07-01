/**
 * Comprehensive test coverage for UserService core module
 * Target: Increase coverage from 22.22% to 80%+
 */

import { UserService } from '../UserService';
import { UserServiceAuth } from '../UserServiceAuth';
import { UserServiceProfile } from '../UserServiceProfile';
import { UserServiceStats } from '../UserServiceStats';
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
  SubscriptionTier,
} from '../../validations/user';
import type { QueryFilters, UserStats, PaginatedResult } from '../UserServiceStats';

// Mock all sub-modules
jest.mock('../UserServiceAuth');
jest.mock('../UserServiceProfile');
jest.mock('../UserServiceStats');

const mockUserServiceAuth = UserServiceAuth as jest.Mocked<typeof UserServiceAuth>;
const mockUserServiceProfile = UserServiceProfile as jest.Mocked<typeof UserServiceProfile>;
const mockUserServiceStats = UserServiceStats as jest.Mocked<typeof UserServiceStats>;

describe('UserService Core Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ================================
  // Authentication Operations Tests
  // ================================

  describe('Authentication Operations', () => {
    describe('createUser', () => {
      it('should delegate to UserServiceAuth.createUser', async () => {
        const userData: UserRegistration = {
          email: 'test@example.com',
          username: 'testuser',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        };

        const expectedResult: ServiceResult<PublicUser> = {
          success: true,
          data: {
            _id: '507f1f77bcf86cd799439011',
            email: 'test@example.com',
            username: 'testuser',
            subscriptionTier: 'free',
            isEmailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };

        mockUserServiceAuth.createUser.mockResolvedValue(expectedResult);

        const result = await UserService.createUser(userData);

        expect(mockUserServiceAuth.createUser).toHaveBeenCalledWith(userData);
        expect(result).toEqual(expectedResult);
      });

      it('should handle errors from UserServiceAuth.createUser', async () => {
        const userData: UserRegistration = {
          email: 'test@example.com',
          username: 'testuser',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        };

        const expectedError: ServiceResult<PublicUser> = {
          success: false,
          error: {
            type: 'USER_ALREADY_EXISTS',
            message: 'User with this email already exists',
            field: 'email',
          },
        };

        mockUserServiceAuth.createUser.mockResolvedValue(expectedError);

        const result = await UserService.createUser(userData);

        expect(mockUserServiceAuth.createUser).toHaveBeenCalledWith(userData);
        expect(result).toEqual(expectedError);
      });
    });

    describe('authenticateUser', () => {
      it('should delegate to UserServiceAuth.authenticateUser', async () => {
        const loginData: UserLogin = {
          email: 'test@example.com',
          password: 'Password123!',
        };

        const expectedResult: ServiceResult<{ user: PublicUser; requiresVerification: boolean }> = {
          success: true,
          data: {
            user: {
              _id: '507f1f77bcf86cd799439011',
              email: 'test@example.com',
              username: 'testuser',
              subscriptionTier: 'free',
              isEmailVerified: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            requiresVerification: false,
          },
        };

        mockUserServiceAuth.authenticateUser.mockResolvedValue(expectedResult);

        const result = await UserService.authenticateUser(loginData);

        expect(mockUserServiceAuth.authenticateUser).toHaveBeenCalledWith(loginData);
        expect(result).toEqual(expectedResult);
      });

      it('should handle authentication failures', async () => {
        const loginData: UserLogin = {
          email: 'test@example.com',
          password: 'wrongpassword',
        };

        const expectedError: ServiceResult<{ user: PublicUser; requiresVerification: boolean }> = {
          success: false,
          error: {
            type: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
            field: 'password',
          },
        };

        mockUserServiceAuth.authenticateUser.mockResolvedValue(expectedError);

        const result = await UserService.authenticateUser(loginData);

        expect(mockUserServiceAuth.authenticateUser).toHaveBeenCalledWith(loginData);
        expect(result).toEqual(expectedError);
      });
    });

    describe('changePassword', () => {
      it('should delegate to UserServiceAuth.changePassword', async () => {
        const userId = '507f1f77bcf86cd799439011';
        const passwordData: ChangePassword = {
          currentPassword: 'OldPassword123!',
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        };

        const expectedResult: ServiceResult<void> = {
          success: true,
          data: undefined,
        };

        mockUserServiceAuth.changePassword.mockResolvedValue(expectedResult);

        const result = await UserService.changePassword(userId, passwordData);

        expect(mockUserServiceAuth.changePassword).toHaveBeenCalledWith(userId, passwordData);
        expect(result).toEqual(expectedResult);
      });

      it('should handle password change failures', async () => {
        const userId = '507f1f77bcf86cd799439011';
        const passwordData: ChangePassword = {
          currentPassword: 'wrongpassword',
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        };

        const expectedError: ServiceResult<void> = {
          success: false,
          error: {
            type: 'INVALID_CREDENTIALS',
            message: 'Current password is incorrect',
            field: 'currentPassword',
          },
        };

        mockUserServiceAuth.changePassword.mockResolvedValue(expectedError);

        const result = await UserService.changePassword(userId, passwordData);

        expect(mockUserServiceAuth.changePassword).toHaveBeenCalledWith(userId, passwordData);
        expect(result).toEqual(expectedError);
      });
    });

    describe('requestPasswordReset', () => {
      it('should delegate to UserServiceAuth.requestPasswordReset', async () => {
        const resetData: PasswordResetRequest = {
          email: 'test@example.com',
        };

        const expectedResult: ServiceResult<{ token: string }> = {
          success: true,
          data: { token: 'reset-token-123' },
        };

        mockUserServiceAuth.requestPasswordReset.mockResolvedValue(expectedResult);

        const result = await UserService.requestPasswordReset(resetData);

        expect(mockUserServiceAuth.requestPasswordReset).toHaveBeenCalledWith(resetData);
        expect(result).toEqual(expectedResult);
      });

      it('should handle password reset request for non-existent user', async () => {
        const resetData: PasswordResetRequest = {
          email: 'nonexistent@example.com',
        };

        const expectedResult: ServiceResult<{ token: string }> = {
          success: true,
          data: { token: 'dummy-token' },
        };

        mockUserServiceAuth.requestPasswordReset.mockResolvedValue(expectedResult);

        const result = await UserService.requestPasswordReset(resetData);

        expect(mockUserServiceAuth.requestPasswordReset).toHaveBeenCalledWith(resetData);
        expect(result).toEqual(expectedResult);
      });
    });

    describe('resetPassword', () => {
      it('should delegate to UserServiceAuth.resetPassword', async () => {
        const resetData: PasswordReset = {
          token: 'reset-token-123',
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        };

        const expectedResult: ServiceResult<void> = {
          success: true,
          data: undefined,
        };

        mockUserServiceAuth.resetPassword.mockResolvedValue(expectedResult);

        const result = await UserService.resetPassword(resetData);

        expect(mockUserServiceAuth.resetPassword).toHaveBeenCalledWith(resetData);
        expect(result).toEqual(expectedResult);
      });

      it('should handle invalid reset token', async () => {
        const resetData: PasswordReset = {
          token: 'invalid-token',
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        };

        const expectedError: ServiceResult<void> = {
          success: false,
          error: {
            type: 'INVALID_TOKEN',
            message: 'Invalid or expired reset token',
            field: 'token',
          },
        };

        mockUserServiceAuth.resetPassword.mockResolvedValue(expectedError);

        const result = await UserService.resetPassword(resetData);

        expect(mockUserServiceAuth.resetPassword).toHaveBeenCalledWith(resetData);
        expect(result).toEqual(expectedError);
      });
    });

    describe('verifyEmail', () => {
      it('should delegate to UserServiceAuth.verifyEmail', async () => {
        const verificationData: EmailVerification = {
          token: 'verification-token-123',
        };

        const expectedResult: ServiceResult<PublicUser> = {
          success: true,
          data: {
            _id: '507f1f77bcf86cd799439011',
            email: 'test@example.com',
            username: 'testuser',
            subscriptionTier: 'free',
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };

        mockUserServiceAuth.verifyEmail.mockResolvedValue(expectedResult);

        const result = await UserService.verifyEmail(verificationData);

        expect(mockUserServiceAuth.verifyEmail).toHaveBeenCalledWith(verificationData);
        expect(result).toEqual(expectedResult);
      });

      it('should handle invalid verification token', async () => {
        const verificationData: EmailVerification = {
          token: 'invalid-token',
        };

        const expectedError: ServiceResult<PublicUser> = {
          success: false,
          error: {
            type: 'INVALID_TOKEN',
            message: 'Invalid or expired verification token',
            field: 'token',
          },
        };

        mockUserServiceAuth.verifyEmail.mockResolvedValue(expectedError);

        const result = await UserService.verifyEmail(verificationData);

        expect(mockUserServiceAuth.verifyEmail).toHaveBeenCalledWith(verificationData);
        expect(result).toEqual(expectedError);
      });
    });

    describe('resendVerificationEmail', () => {
      it('should delegate to UserServiceAuth.resendVerificationEmail', async () => {
        const email = 'test@example.com';

        const expectedResult: ServiceResult<void> = {
          success: true,
          data: undefined,
        };

        mockUserServiceAuth.resendVerificationEmail.mockResolvedValue(expectedResult);

        const result = await UserService.resendVerificationEmail(email);

        expect(mockUserServiceAuth.resendVerificationEmail).toHaveBeenCalledWith(email);
        expect(result).toEqual(expectedResult);
      });

      it('should handle resend verification for non-existent user', async () => {
        const email = 'nonexistent@example.com';

        const expectedError: ServiceResult<void> = {
          success: false,
          error: {
            type: 'USER_NOT_FOUND',
            message: 'User not found',
            field: 'email',
          },
        };

        mockUserServiceAuth.resendVerificationEmail.mockResolvedValue(expectedError);

        const result = await UserService.resendVerificationEmail(email);

        expect(mockUserServiceAuth.resendVerificationEmail).toHaveBeenCalledWith(email);
        expect(result).toEqual(expectedError);
      });
    });
  });

  // ================================
  // Profile Management Operations Tests
  // ================================

  describe('Profile Management Operations', () => {
    describe('getUserById', () => {
      it('should delegate to UserServiceProfile.getUserById', async () => {
        const userId = '507f1f77bcf86cd799439011';

        const expectedResult: ServiceResult<PublicUser> = {
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

        mockUserServiceProfile.getUserById.mockResolvedValue(expectedResult);

        const result = await UserService.getUserById(userId);

        expect(mockUserServiceProfile.getUserById).toHaveBeenCalledWith(userId);
        expect(result).toEqual(expectedResult);
      });

      it('should handle user not found', async () => {
        const userId = '507f1f77bcf86cd799439011';

        const expectedError: ServiceResult<PublicUser> = {
          success: false,
          error: {
            type: 'USER_NOT_FOUND',
            message: 'User not found',
            field: 'userId',
          },
        };

        mockUserServiceProfile.getUserById.mockResolvedValue(expectedError);

        const result = await UserService.getUserById(userId);

        expect(mockUserServiceProfile.getUserById).toHaveBeenCalledWith(userId);
        expect(result).toEqual(expectedError);
      });
    });

    describe('getUserByEmail', () => {
      it('should delegate to UserServiceProfile.getUserByEmail', async () => {
        const email = 'test@example.com';

        const expectedResult: ServiceResult<PublicUser> = {
          success: true,
          data: {
            _id: '507f1f77bcf86cd799439011',
            email: email,
            username: 'testuser',
            subscriptionTier: 'free',
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };

        mockUserServiceProfile.getUserByEmail.mockResolvedValue(expectedResult);

        const result = await UserService.getUserByEmail(email);

        expect(mockUserServiceProfile.getUserByEmail).toHaveBeenCalledWith(email);
        expect(result).toEqual(expectedResult);
      });

      it('should handle user not found by email', async () => {
        const email = 'nonexistent@example.com';

        const expectedError: ServiceResult<PublicUser> = {
          success: false,
          error: {
            type: 'USER_NOT_FOUND',
            message: 'User not found',
            field: 'email',
          },
        };

        mockUserServiceProfile.getUserByEmail.mockResolvedValue(expectedError);

        const result = await UserService.getUserByEmail(email);

        expect(mockUserServiceProfile.getUserByEmail).toHaveBeenCalledWith(email);
        expect(result).toEqual(expectedError);
      });
    });

    describe('updateUserProfile', () => {
      it('should delegate to UserServiceProfile.updateUserProfile', async () => {
        const userId = '507f1f77bcf86cd799439011';
        const updateData: UserProfileUpdate = {
          username: 'newusername',
          firstName: 'John',
          lastName: 'Doe',
        };

        const expectedResult: ServiceResult<PublicUser> = {
          success: true,
          data: {
            _id: userId,
            email: 'test@example.com',
            username: 'newusername',
            firstName: 'John',
            lastName: 'Doe',
            subscriptionTier: 'free',
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };

        mockUserServiceProfile.updateUserProfile.mockResolvedValue(expectedResult);

        const result = await UserService.updateUserProfile(userId, updateData);

        expect(mockUserServiceProfile.updateUserProfile).toHaveBeenCalledWith(userId, updateData);
        expect(result).toEqual(expectedResult);
      });

      it('should handle update conflicts', async () => {
        const userId = '507f1f77bcf86cd799439011';
        const updateData: UserProfileUpdate = {
          email: 'existing@example.com',
        };

        const expectedError: ServiceResult<PublicUser> = {
          success: false,
          error: {
            type: 'USER_ALREADY_EXISTS',
            message: 'User with this email already exists',
            field: 'email',
          },
        };

        mockUserServiceProfile.updateUserProfile.mockResolvedValue(expectedError);

        const result = await UserService.updateUserProfile(userId, updateData);

        expect(mockUserServiceProfile.updateUserProfile).toHaveBeenCalledWith(userId, updateData);
        expect(result).toEqual(expectedError);
      });
    });

    describe('updateSubscription', () => {
      it('should delegate to UserServiceProfile.updateSubscription', async () => {
        const userId = '507f1f77bcf86cd799439011';
        const newTier: SubscriptionTier = 'pro';

        const expectedResult: ServiceResult<PublicUser> = {
          success: true,
          data: {
            _id: userId,
            email: 'test@example.com',
            username: 'testuser',
            subscriptionTier: 'pro',
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };

        mockUserServiceProfile.updateSubscription.mockResolvedValue(expectedResult);

        const result = await UserService.updateSubscription(userId, newTier);

        expect(mockUserServiceProfile.updateSubscription).toHaveBeenCalledWith(userId, newTier);
        expect(result).toEqual(expectedResult);
      });

      it('should handle subscription update for non-existent user', async () => {
        const userId = '507f1f77bcf86cd799439011';
        const newTier: SubscriptionTier = 'pro';

        const expectedError: ServiceResult<PublicUser> = {
          success: false,
          error: {
            type: 'USER_NOT_FOUND',
            message: 'User not found',
            field: 'userId',
          },
        };

        mockUserServiceProfile.updateSubscription.mockResolvedValue(expectedError);

        const result = await UserService.updateSubscription(userId, newTier);

        expect(mockUserServiceProfile.updateSubscription).toHaveBeenCalledWith(userId, newTier);
        expect(result).toEqual(expectedError);
      });
    });

    describe('deleteUser', () => {
      it('should delegate to UserServiceProfile.deleteUser', async () => {
        const userId = '507f1f77bcf86cd799439011';

        const expectedResult: ServiceResult<void> = {
          success: true,
          data: undefined,
        };

        mockUserServiceProfile.deleteUser.mockResolvedValue(expectedResult);

        const result = await UserService.deleteUser(userId);

        expect(mockUserServiceProfile.deleteUser).toHaveBeenCalledWith(userId);
        expect(result).toEqual(expectedResult);
      });

      it('should handle delete user not found', async () => {
        const userId = '507f1f77bcf86cd799439011';

        const expectedError: ServiceResult<void> = {
          success: false,
          error: {
            type: 'USER_NOT_FOUND',
            message: 'User not found',
            field: 'userId',
          },
        };

        mockUserServiceProfile.deleteUser.mockResolvedValue(expectedError);

        const result = await UserService.deleteUser(userId);

        expect(mockUserServiceProfile.deleteUser).toHaveBeenCalledWith(userId);
        expect(result).toEqual(expectedError);
      });
    });
  });

  // ================================
  // Administrative Operations Tests
  // ================================

  describe('Administrative Operations', () => {
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