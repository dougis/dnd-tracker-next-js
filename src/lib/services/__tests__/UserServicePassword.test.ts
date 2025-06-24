import '../__test-helpers__/test-setup';
import { UserService } from '../UserService';
import { mockUser, mockUserData } from '../__test-helpers__/test-setup';

describe('UserService Password Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('changePassword', () => {
    const passwordData = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmNewPassword: 'NewPassword123!',
    };

    it('should successfully change password', async () => {
      const mockPasswordUser = {
        ...mockUserData,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      };

      mockUser.findById.mockResolvedValue(mockPasswordUser as any);

      const result = await UserService.changePassword(
        '507f1f77bcf86cd799439011',
        passwordData
      );

      expect(result.success).toBe(true);
      expect(mockPasswordUser.comparePassword).toHaveBeenCalledWith(
        'OldPassword123!'
      );
      expect(mockPasswordUser.save).toHaveBeenCalled();
    });

    it('should return error for incorrect current password', async () => {
      const mockPasswordUser = {
        ...mockUserData,
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      mockUser.findById.mockResolvedValue(mockPasswordUser as any);

      const result = await UserService.changePassword(
        '507f1f77bcf86cd799439011',
        passwordData
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CURRENT_PASSWORD');
    });
  });

  describe('requestPasswordReset', () => {
    it('should generate reset token for existing user', async () => {
      const mockResetUser = {
        ...mockUserData,
        generatePasswordResetToken: jest
          .fn()
          .mockReturnValue('reset-token-123'),
        save: jest.fn().mockResolvedValue(true),
      };

      mockUser.findByEmail.mockResolvedValue(mockResetUser as any);

      const result = await UserService.requestPasswordReset({
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('reset-token-123');
      expect(mockResetUser.generatePasswordResetToken).toHaveBeenCalled();
    });

    it('should return success even for non-existent user (security)', async () => {
      mockUser.findByEmail.mockResolvedValue(null);

      const result = await UserService.requestPasswordReset({
        email: 'nonexistent@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('dummy-token');
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid token', async () => {
      const mockResetUser = {
        ...mockUserData,
        save: jest.fn().mockResolvedValue(true),
      };

      mockUser.findByResetToken.mockResolvedValue(mockResetUser as any);

      const result = await UserService.resetPassword({
        token: 'valid-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });

      expect(result.success).toBe(true);
      expect(mockUser.findByResetToken).toHaveBeenCalledWith('valid-token');
      expect(mockResetUser.save).toHaveBeenCalled();
    });

    it('should return error for invalid token', async () => {
      mockUser.findByResetToken.mockResolvedValue(null);

      const result = await UserService.resetPassword({
        token: 'invalid-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('TOKEN_INVALID');
    });
  });

  describe('verifyEmail', () => {
    it('should successfully verify email with valid token', async () => {
      const mockVerifyUser = {
        ...mockUserData,
        save: jest.fn().mockResolvedValue(true),
        toPublicJSON: jest.fn().mockReturnValue({
          ...mockUserData,
          isEmailVerified: true,
        }),
      };

      mockUser.findByVerificationToken.mockResolvedValue(mockVerifyUser as any);

      const result = await UserService.verifyEmail({
        token: 'valid-verification-token',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockUser.findByVerificationToken).toHaveBeenCalledWith(
        'valid-verification-token'
      );
      expect(mockVerifyUser.save).toHaveBeenCalled();
    });

    it('should return error for invalid verification token', async () => {
      mockUser.findByVerificationToken.mockResolvedValue(null);

      const result = await UserService.verifyEmail({ token: 'invalid-token' });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('TOKEN_INVALID');
    });
  });
});
