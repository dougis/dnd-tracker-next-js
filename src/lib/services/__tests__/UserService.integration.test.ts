/**
 * UserService Integration Tests
 * 
 * Comprehensive integration tests that execute actual UserService methods
 * to achieve 90%+ code coverage. These tests focus on business logic,
 * error handling, and edge cases.
 */

// Import existing test setup
import '../__test-helpers__/test-setup';
import { UserService, type PaginatedResult, type UserStats } from '../UserService';
import {
  UserServiceError,
  UserNotFoundError,
  UserAlreadyExistsError,
  InvalidCredentialsError,
  TokenInvalidError,
} from '../UserServiceErrors';

// Get the mocked dependencies
const User = require('../../models/User').default;
const bcryptjs = require('bcryptjs');

// Mock helper modules that aren't already mocked
jest.mock('../UserServiceHelpers', () => ({
  checkUserExists: jest.fn(),
  checkProfileUpdateConflicts: jest.fn(),
}));

jest.mock('../UserServiceQueryHelpers', () => ({
  buildQuery: jest.fn().mockReturnValue({}),
  executeUserQuery: jest.fn(),
  formatPaginatedResult: jest.fn(),
}));

const { checkUserExists, checkProfileUpdateConflicts } = require('../UserServiceHelpers');
const { buildQuery, executeUserQuery, formatPaginatedResult } = require('../UserServiceQueryHelpers');

describe('UserService Integration Tests', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    subscriptionTier: 'free',
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      emailNotifications: true,
      pushNotifications: true,
      autoSaveEncounters: true,
    },
    isEmailVerified: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    password: '$2b$12$hashedpassword',
    emailVerificationToken: 'verification-token',
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    passwordResetToken: 'reset-token',
    passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
    toPublicJSON: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      subscriptionTier: 'free',
      preferences: {
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        emailNotifications: true,
        pushNotifications: true,
        autoSaveEncounters: true,
      },
      isEmailVerified: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }),
    save: jest.fn().mockResolvedValue(true),
    comparePassword: jest.fn(),
    generateEmailVerificationToken: jest.fn().mockReturnValue('new-verification-token'),
    generatePasswordResetToken: jest.fn().mockReturnValue('new-reset-token'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset bcryptjs mocks
    bcryptjs.hash.mockResolvedValue('$2b$12$hashedpassword');
    bcryptjs.compare.mockResolvedValue(true);
  });

  describe('createUser', () => {
    const registrationData = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
    };

    it('should successfully create a new user', async () => {
      checkUserExists.mockResolvedValue({ success: true, exists: false });
      User.create.mockResolvedValue(mockUser);

      const result = await UserService.createUser(registrationData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(checkUserExists).toHaveBeenCalledWith(registrationData.email, registrationData.username);
      expect(User.create).toHaveBeenCalled();
    });

    it('should handle user already exists error', async () => {
      checkUserExists.mockResolvedValue({ 
        success: false, 
        error: new UserAlreadyExistsError('User already exists') 
      });

      const result = await UserService.createUser(registrationData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_ALREADY_EXISTS');
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should handle database errors during user creation', async () => {
      checkUserExists.mockResolvedValue({ success: true, exists: false });
      User.create.mockRejectedValue(new Error('Database error'));

      const result = await UserService.createUser(registrationData);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Database error');
    });
  });

  describe('authenticateUser', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully authenticate user with valid credentials', async () => {
      User.findOne.mockResolvedValue(mockUser);
      bcryptjs.compare.mockResolvedValue(true);

      const result = await UserService.authenticateUser(loginData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(bcryptjs.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
    });

    it('should reject authentication with invalid email', async () => {
      User.findOne.mockResolvedValue(null);

      const result = await UserService.authenticateUser(loginData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject authentication with invalid password', async () => {
      User.findOne.mockResolvedValue(mockUser);
      bcryptjs.compare.mockResolvedValue(false);

      const result = await UserService.authenticateUser(loginData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
    });

    it('should handle database errors during authentication', async () => {
      User.findOne.mockRejectedValue(new Error('Database connection failed'));

      const result = await UserService.authenticateUser(loginData);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Database connection failed');
    });
  });

  describe('getUserById', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('should successfully retrieve user by ID', async () => {
      User.findById.mockResolvedValue(mockUser);

      const result = await UserService.getUserById(userId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(User.findById).toHaveBeenCalledWith(userId);
    });

    it('should handle user not found', async () => {
      User.findById.mockResolvedValue(null);

      const result = await UserService.getUserById(userId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
      expect(result.error?.statusCode).toBe(404);
    });

    it('should handle database errors', async () => {
      User.findById.mockRejectedValue(new Error('Database error'));

      const result = await UserService.getUserById(userId);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Database error');
    });

    it('should handle users without toPublicJSON method', async () => {
      const userWithoutMethod = { ...mockUser };
      delete userWithoutMethod.toPublicJSON;
      User.findById.mockResolvedValue(userWithoutMethod);

      const result = await UserService.getUserById(userId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.email).toBe('test@example.com');
    });
  });

  describe('getUserByEmail', () => {
    const email = 'test@example.com';

    it('should successfully retrieve user by email', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await UserService.getUserByEmail(email);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
    });

    it('should handle user not found by email', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await UserService.getUserByEmail(email);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('updateUserProfile', () => {
    const userId = '507f1f77bcf86cd799439011';
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        emailNotifications: false,
        pushNotifications: true,
        autoSaveEncounters: false,
      },
    };

    it('should successfully update user profile', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      checkProfileUpdateConflicts.mockResolvedValue({ success: true });
      const updatedUser = { ...mockUser, ...updateData };
      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await UserService.updateUserProfile(userId, updateData);

      expect(result.success).toBe(true);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        updateData,
        { new: true, runValidators: true }
      );
    });

    it('should handle user not found during update', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const result = await UserService.updateUserProfile(userId, updateData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });

    it('should handle profile update conflicts', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      checkProfileUpdateConflicts.mockResolvedValue({
        success: false,
        error: new UserAlreadyExistsError('Email already in use'),
      });

      const result = await UserService.updateUserProfile(userId, { email: 'taken@example.com' });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_ALREADY_EXISTS');
    });
  });

  describe('changePassword', () => {
    const userId = '507f1f77bcf86cd799439011';
    const changePasswordData = {
      currentPassword: 'oldpassword',
      newPassword: 'newpassword123',
    };

    it('should successfully change password', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockUser.save.mockResolvedValue(mockUser);

      const result = await UserService.changePassword(userId, changePasswordData);

      expect(result.success).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordData.currentPassword,
        mockUser.password
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(changePasswordData.newPassword, 12);
    });

    it('should reject password change with invalid current password', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const result = await UserService.changePassword(userId, changePasswordData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
    });

    it('should handle user not found during password change', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const result = await UserService.changePassword(userId, changePasswordData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('requestPasswordReset', () => {
    const email = 'test@example.com';

    it('should successfully generate password reset token', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockUser.generatePasswordResetToken.mockReturnValue('reset-token-123');
      mockUser.save.mockResolvedValue(mockUser);

      const result = await UserService.requestPasswordReset({ email });

      expect(result.success).toBe(true);
      expect(result.data?.resetToken).toBe('reset-token-123');
      expect(mockUser.generatePasswordResetToken).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should handle user not found for password reset', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await UserService.requestPasswordReset({ email });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('resetPassword', () => {
    const resetData = {
      token: 'valid-reset-token',
      newPassword: 'newpassword123',
    };

    it('should successfully reset password with valid token', async () => {
      const userWithValidToken = {
        ...mockUser,
        passwordResetToken: 'valid-reset-token',
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      };
      mockUserModel.findOne.mockResolvedValue(userWithValidToken);
      userWithValidToken.save = jest.fn().mockResolvedValue(userWithValidToken);

      const result = await UserService.resetPassword(resetData);

      expect(result.success).toBe(true);
      expect(bcrypt.hash).toHaveBeenCalledWith(resetData.newPassword, 12);
      expect(userWithValidToken.save).toHaveBeenCalled();
    });

    it('should reject reset with invalid token', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await UserService.resetPassword(resetData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('TOKEN_INVALID');
    });

    it('should reject reset with expired token', async () => {
      const userWithExpiredToken = {
        ...mockUser,
        passwordResetToken: 'valid-reset-token',
        passwordResetExpires: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      };
      mockUserModel.findOne.mockResolvedValue(userWithExpiredToken);

      const result = await UserService.resetPassword(resetData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('TOKEN_INVALID');
    });
  });

  describe('verifyEmail', () => {
    const verificationData = {
      token: 'valid-verification-token',
    };

    it('should successfully verify email with valid token', async () => {
      const userWithValidToken = {
        ...mockUser,
        emailVerificationToken: 'valid-verification-token',
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isEmailVerified: false,
      };
      mockUserModel.findOne.mockResolvedValue(userWithValidToken);
      userWithValidToken.save = jest.fn().mockResolvedValue(userWithValidToken);

      const result = await UserService.verifyEmail(verificationData);

      expect(result.success).toBe(true);
      expect(userWithValidToken.isEmailVerified).toBe(true);
      expect(userWithValidToken.emailVerificationToken).toBeNull();
    });

    it('should reject verification with invalid token', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await UserService.verifyEmail(verificationData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('TOKEN_INVALID');
    });
  });

  describe('getUsers', () => {
    const filters = { role: 'user' };
    const page = 1;
    const limit = 10;

    it('should successfully retrieve paginated users', async () => {
      buildQuery.mockReturnValue({ role: 'user' });
      executeUserQuery.mockResolvedValue([mockUser]);
      formatPaginatedResult.mockReturnValue({
        data: [mockUser.toPublicJSON()],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const result = await UserService.getUsers(filters, page, limit);

      expect(result.success).toBe(true);
      expect(result.data?.data).toHaveLength(1);
      expect(buildQuery).toHaveBeenCalledWith(filters);
      expect(executeUserQuery).toHaveBeenCalled();
    });

    it('should handle errors in user query execution', async () => {
      buildQuery.mockReturnValue({});
      executeUserQuery.mockRejectedValue(new Error('Query failed'));

      const result = await UserService.getUsers(filters, page, limit);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Query failed');
    });
  });

  describe('updateSubscription', () => {
    const userId = '507f1f77bcf86cd799439011';
    const newTier = 'premium';

    it('should successfully update user subscription', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      const updatedUser = { ...mockUser, subscriptionTier: newTier };
      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await UserService.updateSubscription(userId, newTier);

      expect(result.success).toBe(true);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { subscriptionTier: newTier },
        { new: true, runValidators: true }
      );
    });

    it('should handle user not found during subscription update', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const result = await UserService.updateSubscription(userId, newTier);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('deleteUser', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('should successfully delete user', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUser);

      const result = await UserService.deleteUser(userId);

      expect(result.success).toBe(true);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });

    it('should handle user not found during deletion', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const result = await UserService.deleteUser(userId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('resendVerificationEmail', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('should successfully resend verification email', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUser.generateEmailVerificationToken.mockReturnValue('new-verification-token');
      mockUser.save.mockResolvedValue(mockUser);

      const result = await UserService.resendVerificationEmail(userId);

      expect(result.success).toBe(true);
      expect(result.data?.verificationToken).toBe('new-verification-token');
      expect(mockUser.generateEmailVerificationToken).toHaveBeenCalled();
    });

    it('should handle already verified user', async () => {
      const verifiedUser = { ...mockUser, isEmailVerified: true };
      mockUserModel.findById.mockResolvedValue(verifiedUser);

      const result = await UserService.resendVerificationEmail(userId);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('already verified');
    });
  });

  describe('getUserStats', () => {
    it('should successfully retrieve user statistics', async () => {
      const mockStats = [
        {
          _id: null,
          totalUsers: 100,
          verifiedUsers: 80,
          activeUsers: 60,
          subscriptionBreakdown: [
            { _id: 'free', count: 70 },
            { _id: 'premium', count: 20 },
            { _id: 'pro', count: 10 },
          ],
        },
      ];
      mockUserModel.aggregate.mockResolvedValue(mockStats);

      const result = await UserService.getUserStats();

      expect(result.success).toBe(true);
      expect(result.data?.totalUsers).toBe(100);
      expect(result.data?.subscriptionBreakdown).toBeDefined();
    });

    it('should handle empty stats result', async () => {
      mockUserModel.aggregate.mockResolvedValue([]);

      const result = await UserService.getUserStats();

      expect(result.success).toBe(true);
      expect(result.data?.totalUsers).toBe(0);
    });

    it('should handle database errors in stats aggregation', async () => {
      mockUserModel.aggregate.mockRejectedValue(new Error('Aggregation failed'));

      const result = await UserService.getUserStats();

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Aggregation failed');
    });
  });

  describe('Helper Methods', () => {
    describe('findUserOrError (private method testing via public methods)', () => {
      it('should handle null user correctly in getUserById', async () => {
        mockUserModel.findById.mockResolvedValue(null);

        const result = await UserService.getUserById('507f1f77bcf86cd799439011');

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('USER_NOT_FOUND');
        expect(result.error?.statusCode).toBe(404);
      });
    });

    describe('safeToPublicJSON (private method testing via public methods)', () => {
      it('should handle user objects without toPublicJSON method', async () => {
        const userWithoutMethod = {
          _id: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          role: 'user',
          subscriptionTier: 'free',
          isEmailVerified: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        };
        mockUserModel.findById.mockResolvedValue(userWithoutMethod);

        const result = await UserService.getUserById('507f1f77bcf86cd799439011');

        expect(result.success).toBe(true);
        expect(result.data?.email).toBe('test@example.com');
        expect(result.data?.preferences).toBeDefined();
      });
    });

    describe('handleCustomError (private method testing via error scenarios)', () => {
      it('should handle UserNotFoundError correctly', async () => {
        mockUserModel.findOne.mockRejectedValue(new UserNotFoundError('User not found'));

        const result = await UserService.authenticateUser({
          email: 'test@example.com',
          password: 'password',
        });

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('USER_NOT_FOUND');
      });

      it('should handle UserServiceError correctly', async () => {
        mockUserModel.findOne.mockRejectedValue(
          new UserServiceError('Custom service error', 'CUSTOM_ERROR', 400)
        );

        const result = await UserService.authenticateUser({
          email: 'test@example.com',
          password: 'password',
        });

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('CUSTOM_ERROR');
        expect(result.error?.statusCode).toBe(400);
      });

      it('should handle generic errors', async () => {
        mockUserModel.findOne.mockRejectedValue(new Error('Generic error'));

        const result = await UserService.authenticateUser({
          email: 'test@example.com',
          password: 'password',
        });

        expect(result.success).toBe(false);
        expect(result.error?.message).toContain('Generic error');
      });
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle malformed user ID in getUserById', async () => {
      mockUserModel.findById.mockRejectedValue(new Error('Invalid ObjectId'));

      const result = await UserService.getUserById('invalid-id');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Invalid ObjectId');
    });

    it('should handle database disconnection gracefully', async () => {
      mockUserModel.findById.mockRejectedValue(new Error('MongoNetworkError'));

      const result = await UserService.getUserById('507f1f77bcf86cd799439011');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('MongoNetworkError');
    });

    it('should handle missing required fields in user creation', async () => {
      const { userRegistrationSchema } = require('../../validations/user');
      userRegistrationSchema.parse.mockImplementation(() => {
        throw new Error('Missing required field: email');
      });

      const result = await UserService.createUser({} as any);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Missing required field');
    });

    it('should handle concurrent modification errors', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUser.save.mockRejectedValue(new Error('VersionError: Document was modified'));

      const result = await UserService.changePassword('507f1f77bcf86cd799439011', {
        currentPassword: 'oldpass',
        newPassword: 'newpass',
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('VersionError');
    });
  });
});