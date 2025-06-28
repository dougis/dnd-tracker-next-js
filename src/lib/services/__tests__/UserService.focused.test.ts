/**
 * UserService Focused Tests
 * 
 * Streamlined tests targeting key UserService functionality to improve coverage.
 * These tests are designed to work with the actual UserService implementation.
 */

// Import existing test setup
import '../__test-helpers__/test-setup';
import { UserService } from '../UserService';
import {
  UserNotFoundError,
  UserAlreadyExistsError,
  InvalidCredentialsError,
} from '../UserServiceErrors';

// Get mocked dependencies
const User = require('../../models/User').default;

// Mock helper modules to avoid ES module issues
jest.mock('../UserServiceHelpers', () => ({
  checkUserExists: jest.fn(),
  checkProfileUpdateConflicts: jest.fn(),
}));

jest.mock('../UserServiceQueryHelpers', () => ({
  buildQuery: jest.fn(),
  executeUserQuery: jest.fn(),
  formatPaginatedResult: jest.fn(),
}));

const { checkUserExists } = require('../UserServiceHelpers');

describe('UserService Focused Tests', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    save: jest.fn().mockResolvedValue(true),
    comparePassword: jest.fn().mockResolvedValue(true),
    updateLastLogin: jest.fn().mockResolvedValue(true),
    generatePasswordResetToken: jest.fn().mockReturnValue('reset-token'),
    generateEmailVerificationToken: jest.fn().mockReturnValue('verify-token'),
    toPublicJSON: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Creation', () => {
    it('should create user successfully', async () => {
      checkUserExists.mockResolvedValue(); // No error means user doesn't exist
      const mockUserInstance = { 
        ...mockUser, 
        generateEmailVerificationToken: jest.fn(),
        save: jest.fn().mockResolvedValue(mockUser) 
      };
      User.mockImplementation(() => mockUserInstance);

      const result = await UserService.createUser({
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      });

      expect(result.success).toBe(true);
      expect(mockUserInstance.save).toHaveBeenCalled();
    });

    it('should handle existing user error', async () => {
      checkUserExists.mockRejectedValue(new UserAlreadyExistsError('email', 'test@example.com'));

      const result = await UserService.createUser({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_ALREADY_EXISTS');
    });
  });

  describe('User Authentication', () => {
    it('should authenticate valid credentials', async () => {
      User.findByEmail.mockResolvedValue(mockUser);

      const result = await UserService.authenticateUser({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(User.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should reject invalid email', async () => {
      User.findByEmail.mockResolvedValue(null);

      const result = await UserService.authenticateUser({
        email: 'notfound@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('User Retrieval', () => {
    it('should get user by ID', async () => {
      User.findById.mockResolvedValue(mockUser);

      const result = await UserService.getUserById('507f1f77bcf86cd799439011');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle user not found by ID', async () => {
      User.findById.mockResolvedValue(null);

      const result = await UserService.getUserById('507f1f77bcf86cd799439011');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });

    it('should get user by email', async () => {
      User.findByEmail.mockResolvedValue(mockUser);

      const result = await UserService.getUserByEmail('test@example.com');

      expect(result.success).toBe(true);
      expect(User.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('Password Management', () => {
    it('should change password successfully', async () => {
      User.findById.mockResolvedValue(mockUser);

      const result = await UserService.changePassword('507f1f77bcf86cd799439011', {
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
      });

      expect(result.success).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should request password reset', async () => {
      User.findByEmail.mockResolvedValue(mockUser);

      const result = await UserService.requestPasswordReset({
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('reset-token');
    });

    it('should reset password with valid token', async () => {
      User.findByResetToken.mockResolvedValue(mockUser);

      const result = await UserService.resetPassword({
        token: 'valid-token',
        password: 'newpass123',
      });

      expect(result.success).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('Email Verification', () => {
    it('should verify email with valid token', async () => {
      User.findByVerificationToken.mockResolvedValue(mockUser);

      const result = await UserService.verifyEmail({ token: 'valid-token' });

      expect(result.success).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should resend verification email', async () => {
      User.findById.mockResolvedValue(mockUser);

      const result = await UserService.resendVerificationEmail('507f1f77bcf86cd799439011');

      expect(result.success).toBe(true);
      expect(result.data?.verificationToken).toBe('verify-token');
    });
  });

  describe('User Management', () => {
    it('should update subscription tier', async () => {
      User.findById.mockResolvedValue(mockUser);
      User.findByIdAndUpdate.mockResolvedValue({ ...mockUser, subscriptionTier: 'premium' });

      const result = await UserService.updateSubscription('507f1f77bcf86cd799439011', 'premium');

      expect(result.success).toBe(true);
    });

    it('should delete user successfully', async () => {
      User.findById.mockResolvedValue(mockUser);
      User.findByIdAndDelete.mockResolvedValue(mockUser);

      const result = await UserService.deleteUser('507f1f77bcf86cd799439011');

      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      User.findById.mockRejectedValue(new Error('Database error'));

      const result = await UserService.getUserById('507f1f77bcf86cd799439011');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Database error');
    });
  });
});