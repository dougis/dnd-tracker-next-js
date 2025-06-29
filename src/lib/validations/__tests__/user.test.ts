/**
 * @jest-environment node
 */

import {
  userRegistrationSchema,
  userLoginSchema,
  userProfileUpdateSchema,
  changePasswordSchema,
  passwordResetSchema,
  passwordResetRequestSchema,
  userSessionSchema,
  userPreferencesSchema,
  subscriptionTierSchema,
  userRoleSchema,
} from '../user';
import { safeValidate } from '../base';

describe('User Validation Schemas', () => {
  describe('userRegistrationSchema', () => {
    const validRegistration = {
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      username: 'testuser',
      firstName: 'John',
      lastName: 'Doe',
      agreeToTerms: true,
      subscribeToNewsletter: false,
    };

    it('should validate correct registration data', () => {
      const result = safeValidate(userRegistrationSchema, validRegistration);
      expect(result.success).toBe(true);
    });

    it('should reject when passwords do not match', () => {
      const invalidData = {
        ...validRegistration,
        confirmPassword: 'DifferentPassword123!',
      };

      const result = safeValidate(userRegistrationSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when terms are not agreed', () => {
      const invalidData = {
        ...validRegistration,
        agreeToTerms: false,
      };

      const result = safeValidate(userRegistrationSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        ...validRegistration,
        email: 'invalid-email',
      };

      const result = safeValidate(userRegistrationSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const invalidData = {
        ...validRegistration,
        password: 'weak',
        confirmPassword: 'weak',
      };

      const result = safeValidate(userRegistrationSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('userLoginSchema', () => {
    const validLogin = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false,
    };

    it('should validate correct login data', () => {
      const result = safeValidate(userLoginSchema, validLogin);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        ...validLogin,
        email: 'invalid-email',
      };

      const result = safeValidate(userLoginSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        ...validLogin,
        password: '',
      };

      const result = safeValidate(userLoginSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should default rememberMe to false', () => {
      const dataWithoutRememberMe = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = safeValidate(userLoginSchema, dataWithoutRememberMe);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rememberMe).toBe(false);
      }
    });
  });

  describe('userProfileUpdateSchema', () => {
    it('should validate partial updates', () => {
      const updates = [
        { username: 'newusername' },
        { firstName: 'NewFirst' },
        { email: 'new@example.com' },
        {},
      ];

      updates.forEach(update => {
        const result = safeValidate(userProfileUpdateSchema, update);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid data in updates', () => {
      const invalidUpdates = [
        { username: 'ab' }, // too short
        { firstName: 'John123' }, // invalid characters
        { email: 'invalid-email' },
      ];

      invalidUpdates.forEach(update => {
        const result = safeValidate(userProfileUpdateSchema, update);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('changePasswordSchema', () => {
    const validChangePassword = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmNewPassword: 'NewPassword123!',
    };

    it('should validate correct password change', () => {
      const result = safeValidate(changePasswordSchema, validChangePassword);
      expect(result.success).toBe(true);
    });

    it('should reject when new passwords do not match', () => {
      const invalidData = {
        ...validChangePassword,
        confirmNewPassword: 'DifferentPassword123!',
      };

      const result = safeValidate(changePasswordSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when new password is same as current', () => {
      const invalidData = {
        currentPassword: 'SamePassword123!',
        newPassword: 'SamePassword123!',
        confirmNewPassword: 'SamePassword123!',
      };

      const result = safeValidate(changePasswordSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject weak new password', () => {
      const invalidData = {
        ...validChangePassword,
        newPassword: 'weak',
        confirmNewPassword: 'weak',
      };

      const result = safeValidate(changePasswordSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('passwordResetSchema', () => {
    const validReset = {
      token: 'valid-reset-token',
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };

    it('should validate correct password reset', () => {
      const result = safeValidate(passwordResetSchema, validReset);
      expect(result.success).toBe(true);
    });

    it('should reject when passwords do not match', () => {
      const invalidData = {
        ...validReset,
        confirmPassword: 'DifferentPassword123!',
      };

      const result = safeValidate(passwordResetSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty token', () => {
      const invalidData = {
        ...validReset,
        token: '',
      };

      const result = safeValidate(passwordResetSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('passwordResetRequestSchema', () => {
    it('should validate correct email', () => {
      const data = { email: 'test@example.com' };
      const result = safeValidate(passwordResetRequestSchema, data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = { email: 'invalid-email' };
      const result = safeValidate(passwordResetRequestSchema, data);
      expect(result.success).toBe(false);
    });
  });

  describe('userSessionSchema', () => {
    const validSession = {
      id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      subscriptionTier: 'free',
      preferences: {
        theme: 'dark',
        emailNotifications: true,
        browserNotifications: false,
        timezone: 'UTC',
        language: 'en',
        diceRollAnimations: true,
        autoSaveEncounters: true,
      },
      isEmailVerified: false,
    };

    it('should validate correct session data', () => {
      const result = safeValidate(userSessionSchema, validSession);
      expect(result.success).toBe(true);
    });

    it('should reject invalid ObjectId', () => {
      const invalidData = {
        ...validSession,
        id: 'invalid-id',
      };

      const result = safeValidate(userSessionSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid subscription tier', () => {
      const invalidData = {
        ...validSession,
        subscriptionTier: 'invalid-tier',
      };

      const result = safeValidate(userSessionSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('userPreferencesSchema', () => {
    it('should validate with default values', () => {
      const result = safeValidate(userPreferencesSchema, {});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.theme).toBe('system');
        expect(result.data.emailNotifications).toBe(true);
        expect(result.data.browserNotifications).toBe(false);
      }
    });

    it('should validate custom preferences', () => {
      const preferences = {
        theme: 'dark',
        emailNotifications: false,
        browserNotifications: true,
        timezone: 'America/New_York',
        language: 'es',
        diceRollAnimations: false,
        autoSaveEncounters: false,
      };

      const result = safeValidate(userPreferencesSchema, preferences);
      expect(result.success).toBe(true);
    });

    it('should reject invalid theme', () => {
      const preferences = { theme: 'invalid-theme' };
      const result = safeValidate(userPreferencesSchema, preferences);
      expect(result.success).toBe(false);
    });
  });

  describe('subscriptionTierSchema', () => {
    it('should validate valid subscription tiers', () => {
      const validTiers = ['free', 'seasoned', 'expert', 'master', 'guild'];

      validTiers.forEach(tier => {
        const result = safeValidate(subscriptionTierSchema, tier);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid subscription tiers', () => {
      const invalidTiers = ['basic', 'premium', 'invalid'];

      invalidTiers.forEach(tier => {
        const result = safeValidate(subscriptionTierSchema, tier);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('userRoleSchema', () => {
    it('should validate valid user roles', () => {
      const validRoles = ['user', 'admin'];

      validRoles.forEach(role => {
        const result = safeValidate(userRoleSchema, role);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid user roles', () => {
      const invalidRoles = ['moderator', 'guest', 'invalid'];

      invalidRoles.forEach(role => {
        const result = safeValidate(userRoleSchema, role);
        expect(result.success).toBe(false);
      });
    });
  });
});
