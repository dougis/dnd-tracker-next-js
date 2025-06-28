/**
 *UserService Comprehensive Tests
 *
 *Focused tests to improve UserService coverage from 3.95% to 90%+
 *These tests execute actual UserService methods with proper mocks.
 */

// Import existing test setup
import '../__test-helpers__/test-setup';
import { UserService } from '../UserService';
import {
  UserNotFoundError,
  UserAlreadyExistsError,
  InvalidCredentialsError,
  TokenInvalidError,
} from '../UserServiceErrors';

// Get mocked dependencies
const User = require('../../models/User').default;
const bcryptjs = require('bcryptjs');

// Mock helper modules
jest.mock('../UserServiceHelpers', () => ({
  checkUserExists: jest.fn(),
  checkProfileUpdateConflicts: jest.fn(),
}));

jest.mock('../UserServiceQueryHelpers', () => ({
  buildQuery: jest.fn(),
  executeUserQuery: jest.fn(),
  formatPaginatedResult: jest.fn(),
}));

const { checkUserExists, checkProfileUpdateConflicts } = require('../UserServiceHelpers');
const { buildQuery, executeUserQuery, formatPaginatedResult } = require('../UserServiceQueryHelpers');

describe('UserService Comprehensive Tests', () => {
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
    emailVerificationExpires: new Date(Date.now() + 24 *60 *60 *1000),
    passwordResetToken: 'reset-token',
    passwordResetExpires: new Date(Date.now() + 60 *60 *1000),
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
    
    // Reset user mock functions
    mockUser.toPublicJSON.mockReturnValue({
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
    });
    mockUser.save.mockResolvedValue(true);
    mockUser.comparePassword.mockResolvedValue(true);
    mockUser.generateEmailVerificationToken.mockReturnValue('new-verification-token');
    mockUser.generatePasswordResetToken.mockReturnValue('new-reset-token');
  });

  describe('User Creation', () => {
    const registrationData = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
    };

    it('should create user successfully', async () => {
      checkUserExists.mockResolvedValue({ success: true, exists: false });
      User.create.mockResolvedValue(mockUser);

      const result = await UserService.createUser(registrationData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(User.create).toHaveBeenCalled();
    });

    it('should handle existing user error', async () => {
      checkUserExists.mockRejectedValue(new UserAlreadyExistsError('User exists'));

      const result = await UserService.createUser(registrationData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_ALREADY_EXISTS');
    });

    it('should handle creation database errors', async () => {
      checkUserExists.mockResolvedValue({ success: true, exists: false });
      User.create.mockRejectedValue(new Error('DB Error'));

      const result = await UserService.createUser(registrationData);

      expect(result.success).toBe(false);
    });
  });

  describe('User Authentication', () => {
    const loginData = { email: 'test@example.com', password: 'password123' };

    it('should authenticate valid credentials', async () => {
      User.findOne.mockResolvedValue(mockUser);
      bcryptjs.compare.mockResolvedValue(true);

      const result = await UserService.authenticateUser(loginData);

      expect(result.success).toBe(true);
      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
    });

    it('should reject invalid email', async () => {
      User.findOne.mockResolvedValue(null);

      const result = await UserService.authenticateUser(loginData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject invalid password', async () => {
      User.findOne.mockResolvedValue(mockUser);
      bcryptjs.compare.mockResolvedValue(false);

      const result = await UserService.authenticateUser(loginData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('User Retrieval', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('should get user by ID', async () => {
      User.findById.mockResolvedValue(mockUser);

      const result = await UserService.getUserById(userId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle user not found by ID', async () => {
      User.findById.mockResolvedValue(null);

      const result = await UserService.getUserById(userId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });

    it('should get user by email', async () => {
      User.findOne.mockResolvedValue(mockUser);

      const result = await UserService.getUserByEmail('test@example.com');

      expect(result.success).toBe(true);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should handle user not found by email', async () => {
      User.findOne.mockResolvedValue(null);

      const result = await UserService.getUserByEmail('notfound@example.com');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });

    it('should handle user without toPublicJSON method', async () => {
      const userWithoutMethod = { ...mockUser };
      delete userWithoutMethod.toPublicJSON;
      User.findById.mockResolvedValue(userWithoutMethod);

      const result = await UserService.getUserById(userId);

      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('test@example.com');
    });
  });

  describe('User Profile Updates', () => {
    const userId = '507f1f77bcf86cd799439011';
    const updateData = { firstName: 'Updated', lastName: 'Name' };

    it('should update user profile', async () => {
      User.findById.mockResolvedValue(mockUser);
      checkProfileUpdateConflicts.mockResolvedValue({ success: true });
      User.findByIdAndUpdate.mockResolvedValue({ ...mockUser, ...updateData });

      const result = await UserService.updateUserProfile(userId, updateData);

      expect(result.success).toBe(true);
      expect(User.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should handle profile update conflicts', async () => {
      User.findById.mockResolvedValue(mockUser);
      checkProfileUpdateConflicts.mockResolvedValue({
        success: false,
        error: new UserAlreadyExistsError('Email taken'),
      });

      const result = await UserService.updateUserProfile(userId, { email: 'taken@example.com' });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_ALREADY_EXISTS');
    });

    it('should handle user not found in update', async () => {
      User.findById.mockResolvedValue(null);

      const result = await UserService.updateUserProfile(userId, updateData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('Password Management', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('should change password successfully', async () => {
      User.findById.mockResolvedValue(mockUser);
      bcryptjs.compare.mockResolvedValue(true);

      const result = await UserService.changePassword(userId, {
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
      });

      expect(result.success).toBe(true);
      expect(bcryptjs.hash).toHaveBeenCalledWith('newpass123', 12);
    });

    it('should reject invalid current password', async () => {
      User.findById.mockResolvedValue(mockUser);
      bcryptjs.compare.mockResolvedValue(false);

      const result = await UserService.changePassword(userId, {
        currentPassword: 'wrongpass',
        newPassword: 'newpass123'
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
    });

    it('should request password reset', async () => {
      User.findOne.mockResolvedValue(mockUser);

      const result = await UserService.requestPasswordReset({ email: 'test@example.com' });

      expect(result.success).toBe(true);
      expect(result.data?.resetToken).toBe('new-reset-token');
      expect(mockUser.generatePasswordResetToken).toHaveBeenCalled();
    });

    it('should handle user not found for password reset', async () => {
      User.findOne.mockResolvedValue(null);

      const result = await UserService.requestPasswordReset({ email: 'notfound@example.com' });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });

    it('should reset password with valid token', async () => {
      const userWithValidToken = {
        ...mockUser,
        passwordResetToken: 'valid-token',
        passwordResetExpires: new Date(Date.now() + 60 *60 *1000),
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(userWithValidToken);

      const result = await UserService.resetPassword({
        token: 'valid-token',
        newPassword: 'newpass123'
      });

      expect(result.success).toBe(true);
      expect(userWithValidToken.save).toHaveBeenCalled();
    });

    it('should reject invalid reset token', async () => {
      User.findOne.mockResolvedValue(null);

      const result = await UserService.resetPassword({
        token: 'invalid-token',
        newPassword: 'newpass123'
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('TOKEN_INVALID');
    });

    it('should reject expired reset token', async () => {
      const userWithExpiredToken = {
        ...mockUser,
        passwordResetToken: 'expired-token',
        passwordResetExpires: new Date(Date.now() - 60 *60 *1000), // 1 hour ago
      };
      User.findOne.mockResolvedValue(userWithExpiredToken);

      const result = await UserService.resetPassword({
        token: 'expired-token',
        newPassword: 'newpass123'
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('TOKEN_INVALID');
    });
  });

  describe('Email Verification', () => {
    it('should verify email with valid token', async () => {
      const userWithValidToken = {
        ...mockUser,
        emailVerificationToken: 'valid-token',
        emailVerificationExpires: new Date(Date.now() + 24 *60 *60 *1000),
        isEmailVerified: false,
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(userWithValidToken);

      const result = await UserService.verifyEmail({ token: 'valid-token' });

      expect(result.success).toBe(true);
      expect(userWithValidToken.isEmailVerified).toBe(true);
      expect(userWithValidToken.save).toHaveBeenCalled();
    });

    it('should reject invalid verification token', async () => {
      User.findOne.mockResolvedValue(null);

      const result = await UserService.verifyEmail({ token: 'invalid-token' });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('TOKEN_INVALID');
    });

    it('should resend verification email', async () => {
      User.findById.mockResolvedValue(mockUser);

      const result = await UserService.resendVerificationEmail('507f1f77bcf86cd799439011');

      expect(result.success).toBe(true);
      expect(result.data?.verificationToken).toBe('new-verification-token');
      expect(mockUser.generateEmailVerificationToken).toHaveBeenCalled();
    });

    it('should handle already verified user', async () => {
      const verifiedUser = { ...mockUser, isEmailVerified: true };
      User.findById.mockResolvedValue(verifiedUser);

      const result = await UserService.resendVerificationEmail('507f1f77bcf86cd799439011');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('already verified');
    });
  });

  describe('User Listing and Queries', () => {
    it('should get paginated users', async () => {
      buildQuery.mockReturnValue({ role: 'user' });
      executeUserQuery.mockResolvedValue([mockUser]);
      formatPaginatedResult.mockReturnValue({
        data: [mockUser.toPublicJSON()],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const result = await UserService.getUsers({ role: 'user' }, 1, 10);

      expect(result.success).toBe(true);
      expect(result.data?.data).toHaveLength(1);
      expect(buildQuery).toHaveBeenCalled();
      expect(executeUserQuery).toHaveBeenCalled();
    });

    it('should handle query execution errors', async () => {
      buildQuery.mockReturnValue({});
      executeUserQuery.mockRejectedValue(new Error('Query failed'));

      const result = await UserService.getUsers({}, 1, 10);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Query failed');
    });
  });

  describe('Subscription Management', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('should update subscription tier', async () => {
      User.findById.mockResolvedValue(mockUser);
      const updatedUser = { ...mockUser, subscriptionTier: 'premium' };
      User.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await UserService.updateSubscription(userId, 'premium');

      expect(result.success).toBe(true);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { subscriptionTier: 'premium' },
        { new: true, runValidators: true }
      );
    });

    it('should handle user not found in subscription update', async () => {
      User.findById.mockResolvedValue(null);

      const result = await UserService.updateSubscription(userId, 'premium');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('User Deletion', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('should delete user successfully', async () => {
      User.findById.mockResolvedValue(mockUser);
      User.findByIdAndDelete.mockResolvedValue(mockUser);

      const result = await UserService.deleteUser(userId);

      expect(result.success).toBe(true);
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });

    it('should handle user not found in deletion', async () => {
      User.findById.mockResolvedValue(null);

      const result = await UserService.deleteUser(userId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('User Statistics', () => {
    it('should get user statistics', async () => {
      const mockStats = [{
          _id: null,
          totalUsers: 100,
          verifiedUsers: 80,
          activeUsers: 60,
          subscriptionBreakdown: [
            { _id: 'free', count: 70 },
            { _id: 'premium', count: 30 },
          ],
      }];
      User.aggregate.mockResolvedValue(mockStats);

      const result = await UserService.getUserStats();

      expect(result.success).toBe(true);
      expect(result.data?.totalUsers).toBe(100);
      expect(result.data?.subscriptionBreakdown).toBeDefined();
    });

    it('should handle empty stats', async () => {
      User.aggregate.mockResolvedValue([]);

      const result = await UserService.getUserStats();

      expect(result.success).toBe(true);
      expect(result.data?.totalUsers).toBe(0);
    });

    it('should handle stats aggregation errors', async () => {
      User.aggregate.mockRejectedValue(new Error('Aggregation failed'));

      const result = await UserService.getUserStats();

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Aggregation failed');
    });
  });

  describe('Error Handling', () => {
    it('should handle UserNotFoundError', async () => {
      User.findOne.mockRejectedValue(new UserNotFoundError('User not found'));

      const result = await UserService.authenticateUser({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });

    it('should handle generic errors', async () => {
      User.findOne.mockRejectedValue(new Error('Generic error'));

      const result = await UserService.authenticateUser({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Generic error');
    });

    it('should handle malformed user ID', async () => {
      User.findById.mockRejectedValue(new Error('Invalid ObjectId'));

      const result = await UserService.getUserById('invalid-id');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Invalid ObjectId');
    });
  });
});