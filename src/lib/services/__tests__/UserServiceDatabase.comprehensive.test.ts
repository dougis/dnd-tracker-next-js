import { UserServiceDatabase } from '../UserServiceDatabase';
import { TestPasswordConstants } from '../../test-utils/password-constants';

describe('UserServiceDatabase - Comprehensive Tests', () => {
  let mockUser: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a fresh mock user for each test
    mockUser = {
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'hashedPassword',
      isEmailVerified: false,
      passwordResetToken: 'reset-token',
      passwordResetExpires: new Date(),
      emailVerificationToken: 'verification-token',
      save: jest.fn().mockResolvedValue(undefined),
      generateEmailVerificationToken: jest.fn(),
      generatePasswordResetToken: jest
        .fn()
        .mockResolvedValue('new-reset-token'),
      updateLastLogin: jest.fn().mockResolvedValue(undefined),
    };
  });

  describe('saveUserSafely', () => {
    it('should save user when save method exists', async () => {
      await UserServiceDatabase.saveUserSafely(mockUser);

      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should not throw error when save method does not exist', async () => {
      const userWithoutSave = { ...mockUser };
      delete userWithoutSave.save;

      await expect(
        UserServiceDatabase.saveUserSafely(userWithoutSave)
      ).resolves.not.toThrow();
    });

    it('should not throw error when user is null', async () => {
      // This should handle null gracefully by checking for save method
      await expect(
        UserServiceDatabase.saveUserSafely(null)
      ).resolves.toBeUndefined();
    });

    it('should not throw error when user is undefined', async () => {
      // This should handle undefined gracefully by checking for save method
      await expect(
        UserServiceDatabase.saveUserSafely(undefined)
      ).resolves.toBeUndefined();
    });

    it('should handle save method that returns a promise', async () => {
      mockUser.save.mockResolvedValue({ _id: 'saved-user' });

      await UserServiceDatabase.saveUserSafely(mockUser);

      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should handle save method that throws an error', async () => {
      mockUser.save.mockRejectedValue(new Error('Save failed'));

      await expect(
        UserServiceDatabase.saveUserSafely(mockUser)
      ).rejects.toThrow('Save failed');
    });

    it('should handle non-function save property', async () => {
      mockUser.save = 'not-a-function';

      await expect(
        UserServiceDatabase.saveUserSafely(mockUser)
      ).resolves.not.toThrow();
    });
  });

  describe('generateAndSaveEmailToken', () => {
    it('should generate email verification token and save user', async () => {
      await UserServiceDatabase.generateAndSaveEmailToken(mockUser);

      expect(mockUser.generateEmailVerificationToken).toHaveBeenCalledTimes(1);
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should save user even when generateEmailVerificationToken does not exist', async () => {
      const userWithoutMethod = { ...mockUser };
      delete userWithoutMethod.generateEmailVerificationToken;

      await UserServiceDatabase.generateAndSaveEmailToken(userWithoutMethod);

      expect(userWithoutMethod.save).toHaveBeenCalledTimes(1);
    });

    it('should handle non-function generateEmailVerificationToken property', async () => {
      mockUser.generateEmailVerificationToken = 'not-a-function';

      await UserServiceDatabase.generateAndSaveEmailToken(mockUser);

      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should handle generateEmailVerificationToken that throws an error', async () => {
      mockUser.generateEmailVerificationToken.mockImplementation(() => {
        throw new Error('Token generation failed');
      });

      await expect(
        UserServiceDatabase.generateAndSaveEmailToken(mockUser)
      ).rejects.toThrow('Token generation failed');
    });

    it('should handle save failure after token generation', async () => {
      mockUser.save.mockRejectedValue(new Error('Save failed'));

      await expect(
        UserServiceDatabase.generateAndSaveEmailToken(mockUser)
      ).rejects.toThrow('Save failed');
      expect(mockUser.generateEmailVerificationToken).toHaveBeenCalled();
    });
  });

  describe('generateAndSaveResetToken', () => {
    it('should generate password reset token and save user', async () => {
      const result =
        await UserServiceDatabase.generateAndSaveResetToken(mockUser);

      expect(mockUser.generatePasswordResetToken).toHaveBeenCalledTimes(1);
      expect(mockUser.save).toHaveBeenCalledTimes(1);
      expect(result).toBe('new-reset-token');
    });

    it('should return dummy token when generatePasswordResetToken does not exist', async () => {
      const userWithoutMethod = { ...mockUser };
      delete userWithoutMethod.generatePasswordResetToken;

      const result =
        await UserServiceDatabase.generateAndSaveResetToken(userWithoutMethod);

      expect(userWithoutMethod.save).toHaveBeenCalledTimes(1);
      expect(result).toBe('dummy-token');
    });

    it('should handle non-function generatePasswordResetToken property', async () => {
      mockUser.generatePasswordResetToken = 'not-a-function';

      const result =
        await UserServiceDatabase.generateAndSaveResetToken(mockUser);

      expect(mockUser.save).toHaveBeenCalledTimes(1);
      expect(result).toBe('dummy-token');
    });

    it('should handle generatePasswordResetToken that returns a promise', async () => {
      mockUser.generatePasswordResetToken.mockResolvedValue('async-token');

      const result =
        await UserServiceDatabase.generateAndSaveResetToken(mockUser);

      expect(result).toBe('async-token');
    });

    it('should handle generatePasswordResetToken that throws an error', async () => {
      mockUser.generatePasswordResetToken.mockRejectedValue(
        new Error('Token generation failed')
      );

      await expect(
        UserServiceDatabase.generateAndSaveResetToken(mockUser)
      ).rejects.toThrow('Token generation failed');
    });

    it('should handle save failure after token generation', async () => {
      mockUser.save.mockRejectedValue(new Error('Save failed'));

      await expect(
        UserServiceDatabase.generateAndSaveResetToken(mockUser)
      ).rejects.toThrow('Save failed');
      expect(mockUser.generatePasswordResetToken).toHaveBeenCalled();
    });
  });

  describe('clearTokensAndSave', () => {
    it('should clear password reset tokens and save user', async () => {
      await UserServiceDatabase.clearTokensAndSave(mockUser, ['passwordReset']);

      expect(mockUser.passwordResetToken).toBeUndefined();
      expect(mockUser.passwordResetExpires).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should clear email verification token and save user', async () => {
      await UserServiceDatabase.clearTokensAndSave(mockUser, [
        'emailVerification',
      ]);

      expect(mockUser.emailVerificationToken).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should clear multiple token types', async () => {
      await UserServiceDatabase.clearTokensAndSave(mockUser, [
        'passwordReset',
        'emailVerification',
      ]);

      expect(mockUser.passwordResetToken).toBeUndefined();
      expect(mockUser.passwordResetExpires).toBeUndefined();
      expect(mockUser.emailVerificationToken).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should handle empty token types array', async () => {
      const originalTokens = {
        passwordResetToken: mockUser.passwordResetToken,
        passwordResetExpires: mockUser.passwordResetExpires,
        emailVerificationToken: mockUser.emailVerificationToken,
      };

      await UserServiceDatabase.clearTokensAndSave(mockUser, []);

      expect(mockUser.passwordResetToken).toBe(
        originalTokens.passwordResetToken
      );
      expect(mockUser.passwordResetExpires).toBe(
        originalTokens.passwordResetExpires
      );
      expect(mockUser.emailVerificationToken).toBe(
        originalTokens.emailVerificationToken
      );
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should handle unknown token types gracefully', async () => {
      await UserServiceDatabase.clearTokensAndSave(mockUser, [
        'unknownToken',
        'anotherUnknown',
      ]);

      // Should not clear known tokens
      expect(mockUser.passwordResetToken).toBe('reset-token');
      expect(mockUser.emailVerificationToken).toBe('verification-token');
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should handle mixed known and unknown token types', async () => {
      await UserServiceDatabase.clearTokensAndSave(mockUser, [
        'passwordReset',
        'unknownToken',
        'emailVerification',
      ]);

      expect(mockUser.passwordResetToken).toBeUndefined();
      expect(mockUser.passwordResetExpires).toBeUndefined();
      expect(mockUser.emailVerificationToken).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should handle save failure', async () => {
      mockUser.save.mockRejectedValue(new Error('Save failed'));

      await expect(
        UserServiceDatabase.clearTokensAndSave(mockUser, ['passwordReset'])
      ).rejects.toThrow('Save failed');
    });

    it('should handle null user', async () => {
      await expect(
        UserServiceDatabase.clearTokensAndSave(null, ['passwordReset'])
      ).rejects.toThrow(TypeError);
    });

    it('should handle undefined user', async () => {
      await expect(
        UserServiceDatabase.clearTokensAndSave(undefined, ['passwordReset'])
      ).rejects.toThrow(TypeError);
    });
  });

  describe('updateUserFieldsAndSave', () => {
    it('should update user fields and save', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@example.com',
      };

      await UserServiceDatabase.updateUserFieldsAndSave(mockUser, updateData);

      expect(mockUser.firstName).toBe('Updated');
      expect(mockUser.lastName).toBe('Name');
      expect(mockUser.email).toBe('updated@example.com');
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should handle empty update data', async () => {
      const originalUser = { ...mockUser };

      await UserServiceDatabase.updateUserFieldsAndSave(mockUser, {});

      expect(mockUser).toEqual(originalUser);
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should handle null update data', async () => {
      await expect(
        UserServiceDatabase.updateUserFieldsAndSave(mockUser, null)
      ).resolves.not.toThrow();
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should handle undefined update data', async () => {
      await expect(
        UserServiceDatabase.updateUserFieldsAndSave(mockUser, undefined)
      ).resolves.not.toThrow();
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should overwrite existing fields', async () => {
      mockUser.existingField = 'original';
      const updateData = { existingField: 'updated' };

      await UserServiceDatabase.updateUserFieldsAndSave(mockUser, updateData);

      expect(mockUser.existingField).toBe('updated');
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should add new fields', async () => {
      const updateData = { newField: 'new value' };

      await UserServiceDatabase.updateUserFieldsAndSave(mockUser, updateData);

      expect(mockUser.newField).toBe('new value');
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should handle nested object updates', async () => {
      const updateData = {
        preferences: {
          theme: 'dark',
          notifications: true,
        },
      };

      await UserServiceDatabase.updateUserFieldsAndSave(mockUser, updateData);

      expect(mockUser.preferences).toEqual({
        theme: 'dark',
        notifications: true,
      });
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should handle save failure', async () => {
      mockUser.save.mockRejectedValue(new Error('Save failed'));

      await expect(
        UserServiceDatabase.updateUserFieldsAndSave(mockUser, {
          field: 'value',
        })
      ).rejects.toThrow('Save failed');
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login when method exists', async () => {
      await UserServiceDatabase.updateLastLogin(mockUser);

      expect(mockUser.updateLastLogin).toHaveBeenCalledTimes(1);
    });

    it('should not throw error when updateLastLogin method does not exist', async () => {
      const userWithoutMethod = { ...mockUser };
      delete userWithoutMethod.updateLastLogin;

      await expect(
        UserServiceDatabase.updateLastLogin(userWithoutMethod)
      ).resolves.not.toThrow();
    });

    it('should handle non-function updateLastLogin property', async () => {
      mockUser.updateLastLogin = 'not-a-function';

      await expect(
        UserServiceDatabase.updateLastLogin(mockUser)
      ).resolves.not.toThrow();
    });

    it('should handle updateLastLogin that throws an error', async () => {
      mockUser.updateLastLogin.mockRejectedValue(new Error('Update failed'));

      await expect(
        UserServiceDatabase.updateLastLogin(mockUser)
      ).rejects.toThrow('Update failed');
    });

    it('should handle null user', async () => {
      // Should handle null gracefully by checking for updateLastLogin method
      await expect(
        UserServiceDatabase.updateLastLogin(null)
      ).resolves.toBeUndefined();
    });

    it('should handle undefined user', async () => {
      // Should handle undefined gracefully by checking for updateLastLogin method
      await expect(
        UserServiceDatabase.updateLastLogin(undefined)
      ).resolves.toBeUndefined();
    });
  });

  describe('markEmailVerified', () => {
    it('should mark email as verified and clear verification token', async () => {
      await UserServiceDatabase.markEmailVerified(mockUser);

      expect(mockUser.isEmailVerified).toBe(true);
      expect(mockUser.emailVerificationToken).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should handle user that is already verified', async () => {
      mockUser.isEmailVerified = true;

      await UserServiceDatabase.markEmailVerified(mockUser);

      expect(mockUser.isEmailVerified).toBe(true);
      expect(mockUser.emailVerificationToken).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should handle save failure', async () => {
      mockUser.save.mockRejectedValue(new Error('Save failed'));

      await expect(
        UserServiceDatabase.markEmailVerified(mockUser)
      ).rejects.toThrow('Save failed');
      expect(mockUser.isEmailVerified).toBe(true); // Should still be set
    });
  });

  describe('updatePasswordAndClearTokens', () => {
    it('should update password hash and clear reset tokens', async () => {
      const newPassword = TestPasswordConstants.NEW_PASSWORD;

      await UserServiceDatabase.updatePasswordAndClearTokens(
        mockUser,
        newPassword
      );

      expect(mockUser.passwordHash).toBe(newPassword);
      expect(mockUser.passwordResetToken).toBeUndefined();
      expect(mockUser.passwordResetExpires).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should handle empty password', async () => {
      await UserServiceDatabase.updatePasswordAndClearTokens(mockUser, '');

      expect(mockUser.passwordHash).toBe('');
      expect(mockUser.passwordResetToken).toBeUndefined();
      expect(mockUser.passwordResetExpires).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should handle null password', async () => {
      await UserServiceDatabase.updatePasswordAndClearTokens(
        mockUser,
        null as any
      );

      expect(mockUser.passwordHash).toBeNull();
      expect(mockUser.passwordResetToken).toBeUndefined();
      expect(mockUser.passwordResetExpires).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should handle save failure', async () => {
      mockUser.save.mockRejectedValue(new Error('Save failed'));

      await expect(
        UserServiceDatabase.updatePasswordAndClearTokens(mockUser, 'newpass')
      ).rejects.toThrow('Save failed');
      expect(mockUser.passwordHash).toBe('newpass'); // Should still be set
    });
  });

  describe('Integration tests', () => {
    it('should handle multiple operations on the same user', async () => {
      // Generate email token
      await UserServiceDatabase.generateAndSaveEmailToken(mockUser);
      expect(mockUser.generateEmailVerificationToken).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalledTimes(1);

      // Update fields
      await UserServiceDatabase.updateUserFieldsAndSave(mockUser, {
        firstName: 'Test',
      });
      expect(mockUser.firstName).toBe('Test');
      expect(mockUser.save).toHaveBeenCalledTimes(2);

      // Mark email verified
      await UserServiceDatabase.markEmailVerified(mockUser);
      expect(mockUser.isEmailVerified).toBe(true);
      expect(mockUser.save).toHaveBeenCalledTimes(3);
    });

    it('should handle error in one operation without affecting others', async () => {
      // First operation succeeds
      await UserServiceDatabase.updateUserFieldsAndSave(mockUser, {
        firstName: 'Test',
      });
      expect(mockUser.firstName).toBe('Test');

      // Second operation fails
      mockUser.save.mockRejectedValue(new Error('Save failed'));
      await expect(
        UserServiceDatabase.markEmailVerified(mockUser)
      ).rejects.toThrow('Save failed');

      // User state should still be partially updated
      expect(mockUser.firstName).toBe('Test');
      expect(mockUser.isEmailVerified).toBe(true); // Set but not saved
    });

    it('should handle complex token clearing scenarios', async () => {
      // Set up user with multiple tokens
      mockUser.customToken = 'custom-value';

      // Clear only specific tokens
      await UserServiceDatabase.clearTokensAndSave(mockUser, ['passwordReset']);
      expect(mockUser.passwordResetToken).toBeUndefined();
      expect(mockUser.emailVerificationToken).toBe('verification-token'); // Should remain
      expect(mockUser.customToken).toBe('custom-value'); // Should remain

      // Clear remaining tokens
      await UserServiceDatabase.clearTokensAndSave(mockUser, [
        'emailVerification',
      ]);
      expect(mockUser.emailVerificationToken).toBeUndefined();
      expect(mockUser.customToken).toBe('custom-value'); // Should still remain
    });
  });
});
