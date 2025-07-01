/**
 * UserService Authentication Operations Tests
 * Tests delegation to UserServiceAuth module
 */

import { UserService } from '../UserService';
import { UserServiceAuth } from '../UserServiceAuth';
import { ServiceResult } from '../UserServiceErrors';
import type {
  UserRegistration,
  UserLogin,
  ChangePassword,
  PasswordResetRequest,
  PasswordReset,
  EmailVerification,
  PublicUser,
} from '../../validations/user';

// Mock UserServiceAuth
jest.mock('../UserServiceAuth');

const mockUserServiceAuth = UserServiceAuth as jest.Mocked<typeof UserServiceAuth>;

describe('UserService Authentication Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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