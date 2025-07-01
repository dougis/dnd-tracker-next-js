import '../__test-helpers__/test-setup';
import { UserServiceAuth } from '../UserServiceAuth';
import User from '../../models/User';
import { createMockUser } from './testUtils';

/**
 * Additional comprehensive tests for UserServiceAuth to reach 80% coverage
 * Focuses on authenticateUser, changePassword, resetPassword, and email verification
 */
describe('UserServiceAuth - Additional Coverage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateUser', () => {
    const validLoginData = {
      email: 'auth@example.com',
      password: 'TestPassword123!',
      rememberMe: false,
    };

    describe('Success scenarios', () => {
      beforeEach(() => {
        const mockAuthUser = createMockUser({
          email: 'auth@example.com',
          isEmailVerified: true,
          comparePassword: jest.fn().mockResolvedValue(true),
        });

        (User.findOne as jest.Mock).mockResolvedValue(mockAuthUser);

        // Mock UserServiceLookup.findUserByEmailNullable
        jest.doMock('../UserServiceLookup', () => ({
          findUserByEmailNullable: jest.fn().mockResolvedValue(mockAuthUser),
        }));

        // Mock UserServiceDatabase.updateLastLogin
        jest.doMock('../UserServiceDatabase', () => ({
          updateLastLogin: jest.fn().mockResolvedValue(undefined),
        }));
      });

      it('should successfully authenticate valid credentials', async () => {
        const result = await UserServiceAuth.authenticateUser(validLoginData);

        expect(result.success).toBe(true);
        expect(result.data?.user).toBeDefined();
        expect(result.data?.user.email).toBe(validLoginData.email);
        expect(result.data?.requiresVerification).toBe(false);
      });

      it('should indicate verification required for unverified users', async () => {
        const unverifiedUser = createMockUser({
          email: 'auth@example.com',
          isEmailVerified: false,
          comparePassword: jest.fn().mockResolvedValue(true),
        });

        // Mock UserServiceLookup to return unverified user
        const UserServiceLookup = require('../UserServiceLookup');
        UserServiceLookup.findUserByEmailNullable = jest.fn().mockResolvedValue(unverifiedUser);

        const result = await UserServiceAuth.authenticateUser(validLoginData);

        expect(result.success).toBe(true);
        expect(result.data?.requiresVerification).toBe(true);
      });

      it('should handle validation and return proper user data', async () => {
        const result = await UserServiceAuth.authenticateUser(validLoginData);

        expect(result.success).toBe(true);
        expect(result.data?.user).toMatchObject({
          email: validLoginData.email,
          username: expect.any(String),
          role: 'user',
          subscriptionTier: 'free',
        });
      });
    });

    describe('Failure scenarios', () => {
      it('should return error for non-existent user', async () => {
        // Mock UserServiceLookup to return null
        const UserServiceLookup = require('../UserServiceLookup');
        UserServiceLookup.findUserByEmailNullable = jest.fn().mockResolvedValue(null);

        const result = await UserServiceAuth.authenticateUser(validLoginData);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('INVALID_CREDENTIALS');
        expect(result.error?.statusCode).toBe(401);
      });

      it('should return error for incorrect password', async () => {
        const mockAuthUser = createMockUser({
          email: 'auth@example.com',
          comparePassword: jest.fn().mockResolvedValue(false),
        });

        const UserServiceLookup = require('../UserServiceLookup');
        UserServiceLookup.findUserByEmailNullable = jest.fn().mockResolvedValue(mockAuthUser);

        const result = await UserServiceAuth.authenticateUser(validLoginData);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('INVALID_CREDENTIALS');
        expect(result.error?.statusCode).toBe(401);
      });

      it('should handle validation errors gracefully', async () => {
        const invalidLoginData = {
          email: 'invalid-email',
          password: '',
          rememberMe: false,
        };

        const result = await UserServiceAuth.authenticateUser(invalidLoginData);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('INVALID_CREDENTIALS');
        expect(result.error?.statusCode).toBe(401);
      });
    });
  });

  describe('changePassword', () => {
    const userId = 'test-user-id';
    const validPasswordData = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword456!',
      confirmNewPassword: 'NewPassword456!',
    };

    describe('Success scenarios', () => {
      beforeEach(() => {
        const mockUser = createMockUser({
          _id: userId,
          comparePassword: jest.fn().mockResolvedValue(true),
        });

        // Mock UserServiceLookup.findUserByIdOrThrow
        jest.doMock('../UserServiceLookup', () => ({
          findUserByIdOrThrow: jest.fn().mockResolvedValue(mockUser),
        }));

        // Mock UserServiceDatabase.updatePasswordAndClearTokens
        jest.doMock('../UserServiceDatabase', () => ({
          updatePasswordAndClearTokens: jest.fn().mockResolvedValue(undefined),
        }));
      });

      it('should successfully change password with valid data', async () => {
        const result = await UserServiceAuth.changePassword(userId, validPasswordData);

        expect(result.success).toBe(true);
        expect(result.data).toBeUndefined(); // void return
      });

      it('should verify current password before changing', async () => {
        const mockUser = createMockUser({
          _id: userId,
          comparePassword: jest.fn().mockResolvedValue(true),
        });

        const UserServiceLookup = require('../UserServiceLookup');
        UserServiceLookup.findUserByIdOrThrow = jest.fn().mockResolvedValue(mockUser);

        await UserServiceAuth.changePassword(userId, validPasswordData);

        expect(mockUser.comparePassword).toHaveBeenCalledWith(validPasswordData.currentPassword);
      });
    });

    describe('Failure scenarios', () => {
      it('should return error for incorrect current password', async () => {
        const mockUser = createMockUser({
          _id: userId,
          comparePassword: jest.fn().mockResolvedValue(false), // Wrong password
        });

        const UserServiceLookup = require('../UserServiceLookup');
        UserServiceLookup.findUserByIdOrThrow = jest.fn().mockResolvedValue(mockUser);

        const result = await UserServiceAuth.changePassword(userId, validPasswordData);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('INVALID_CURRENT_PASSWORD');
        expect(result.error?.statusCode).toBe(400);
      });

      it('should handle validation errors for weak passwords', async () => {
        const weakPasswordData = {
          currentPassword: 'OldPassword123!',
          newPassword: '123',
          confirmNewPassword: '123',
        };

        const result = await UserServiceAuth.changePassword(userId, weakPasswordData);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('PASSWORD_CHANGE_FAILED');
        expect(result.error?.statusCode).toBe(400);
      });

      it('should handle non-existent user errors', async () => {
        const UserServiceLookup = require('../UserServiceLookup');
        UserServiceLookup.findUserByIdOrThrow = jest.fn().mockRejectedValue(new Error('User not found'));

        const result = await UserServiceAuth.changePassword('non-existent-id', validPasswordData);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('PASSWORD_CHANGE_FAILED');
        expect(result.error?.statusCode).toBe(400);
      });
    });
  });

  describe('requestPasswordReset', () => {
    const validResetData = {
      email: 'reset@example.com',
    };

    describe('Success scenarios', () => {
      it('should generate reset token for existing user', async () => {
        const mockUser = createMockUser({ email: 'reset@example.com' });

        const UserServiceLookup = require('../UserServiceLookup');
        UserServiceLookup.findUserByEmailNullable = jest.fn().mockResolvedValue(mockUser);

        // Mock UserServiceDatabase.generateAndSaveResetToken
        const UserServiceDatabase = require('../UserServiceDatabase');
        UserServiceDatabase.generateAndSaveResetToken = jest.fn().mockResolvedValue('reset-token-123');

        const result = await UserServiceAuth.requestPasswordReset(validResetData);

        expect(result.success).toBe(true);
        expect(result.data?.token).toBe('reset-token-123');
      });

      it('should return dummy token for non-existent email (security)', async () => {
        const UserServiceLookup = require('../UserServiceLookup');
        UserServiceLookup.findUserByEmailNullable = jest.fn().mockResolvedValue(null);

        const result = await UserServiceAuth.requestPasswordReset(validResetData);

        expect(result.success).toBe(true);
        expect(result.data?.token).toBe('dummy-token');
      });
    });

    describe('Validation scenarios', () => {
      it('should handle validation error for invalid email', async () => {
        const invalidResetData = {
          email: 'invalid-email',
        };

        const result = await UserServiceAuth.requestPasswordReset(invalidResetData);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('PASSWORD_RESET_REQUEST_FAILED');
        expect(result.error?.statusCode).toBe(400);
      });

      it('should handle general errors gracefully', async () => {
        const UserServiceLookup = require('../UserServiceLookup');
        UserServiceLookup.findUserByEmailNullable = jest.fn().mockRejectedValue(new Error('Database error'));

        const result = await UserServiceAuth.requestPasswordReset(validResetData);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('PASSWORD_RESET_REQUEST_FAILED');
      });
    });
  });

  describe('resetPassword', () => {
    const validResetData = {
      token: 'valid-reset-token',
      password: 'NewSecurePassword123!',
      confirmPassword: 'NewSecurePassword123!',
    };

    describe('Success scenarios', () => {
      it('should successfully reset password with valid token', async () => {
        const mockUser = createMockUser({ email: 'reset@example.com' });

        const UserServiceLookup = require('../UserServiceLookup');
        UserServiceLookup.findUserByResetTokenOrThrow = jest.fn().mockResolvedValue(mockUser);

        const UserServiceDatabase = require('../UserServiceDatabase');
        UserServiceDatabase.updatePasswordAndClearTokens = jest.fn().mockResolvedValue(undefined);

        const result = await UserServiceAuth.resetPassword(validResetData);

        expect(result.success).toBe(true);
        expect(result.data).toBeUndefined(); // void return
      });
    });

    describe('Failure scenarios', () => {
      it('should handle invalid token errors', async () => {
        const UserServiceLookup = require('../UserServiceLookup');
        UserServiceLookup.findUserByResetTokenOrThrow = jest.fn().mockRejectedValue(new Error('Invalid token'));

        const result = await UserServiceAuth.resetPassword(validResetData);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('PASSWORD_RESET_FAILED');
        expect(result.error?.statusCode).toBe(400);
      });

      it('should handle validation errors for weak passwords', async () => {
        const weakPasswordData = {
          token: 'valid-reset-token',
          password: '123',
          confirmPassword: '123',
        };

        const result = await UserServiceAuth.resetPassword(weakPasswordData);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('PASSWORD_RESET_FAILED');
        expect(result.error?.statusCode).toBe(400);
      });
    });
  });

  describe('verifyEmail', () => {
    const validVerificationData = {
      token: 'valid-verification-token',
    };

    describe('Success scenarios', () => {
      it('should successfully verify email with valid token', async () => {
        const mockUser = createMockUser({
          email: 'verify@example.com',
          isEmailVerified: false,
        });

        const UserServiceLookup = require('../UserServiceLookup');
        UserServiceLookup.findUserByVerificationTokenOrThrow = jest.fn().mockResolvedValue(mockUser);

        const UserServiceDatabase = require('../UserServiceDatabase');
        UserServiceDatabase.markEmailVerified = jest.fn().mockResolvedValue(undefined);

        const result = await UserServiceAuth.verifyEmail(validVerificationData);

        expect(result.success).toBe(true);
        expect(result.data?.email).toBe('verify@example.com');
      });
    });

    describe('Failure scenarios', () => {
      it('should handle invalid verification token', async () => {
        const UserServiceLookup = require('../UserServiceLookup');
        UserServiceLookup.findUserByVerificationTokenOrThrow = jest.fn().mockRejectedValue(new Error('Invalid token'));

        const result = await UserServiceAuth.verifyEmail(validVerificationData);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('EMAIL_VERIFICATION_FAILED');
        expect(result.error?.statusCode).toBe(400);
      });

      it('should handle validation errors for invalid token format', async () => {
        const invalidTokenData = {
          token: '',
        };

        const result = await UserServiceAuth.verifyEmail(invalidTokenData);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('EMAIL_VERIFICATION_FAILED');
        expect(result.error?.statusCode).toBe(400);
      });
    });
  });

  describe('resendVerificationEmail', () => {
    describe('Success scenarios', () => {
      it('should resend verification email for unverified user', async () => {
        const mockUser = createMockUser({
          email: 'resend@example.com',
          isEmailVerified: false,
        });

        const UserServiceLookup = require('../UserServiceLookup');
        UserServiceLookup.findUserByEmailOrThrow = jest.fn().mockResolvedValue(mockUser);

        const UserServiceDatabase = require('../UserServiceDatabase');
        UserServiceDatabase.generateAndSaveEmailToken = jest.fn().mockResolvedValue(undefined);

        const result = await UserServiceAuth.resendVerificationEmail('resend@example.com');

        expect(result.success).toBe(true);
        expect(result.data).toBeUndefined(); // void return
      });
    });

    describe('Failure scenarios', () => {
      it('should return error for already verified email', async () => {
        const mockUser = createMockUser({
          email: 'verified@example.com',
          isEmailVerified: true,
        });

        const UserServiceLookup = require('../UserServiceLookup');
        UserServiceLookup.findUserByEmailOrThrow = jest.fn().mockResolvedValue(mockUser);

        const result = await UserServiceAuth.resendVerificationEmail('verified@example.com');

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('EMAIL_ALREADY_VERIFIED');
        expect(result.error?.statusCode).toBe(400);
      });

      it('should handle non-existent user errors', async () => {
        const UserServiceLookup = require('../UserServiceLookup');
        UserServiceLookup.findUserByEmailOrThrow = jest.fn().mockRejectedValue(new Error('User not found'));

        const result = await UserServiceAuth.resendVerificationEmail('nonexistent@example.com');

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('VERIFICATION_EMAIL_FAILED');
        expect(result.error?.statusCode).toBe(400);
      });
    });
  });
});