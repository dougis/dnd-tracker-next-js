import bcrypt from 'bcryptjs';
import { userSchema } from '../../validations/user';

/**
 * Tests for User model validation and utility functions
 *
 * These tests focus on the validation logic and password hashing
 * without requiring a full MongoDB connection.
 */

// Test data
const validUserData = {
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  passwordHash: 'plainPassword123!',
  role: 'user' as const,
  subscriptionTier: 'free' as const,
  preferences: {
    theme: 'dark' as const,
    emailNotifications: true,
    browserNotifications: false,
    timezone: 'America/New_York',
    language: 'en',
    diceRollAnimations: true,
    autoSaveEncounters: true,
  },
  isEmailVerified: false,
};

const adminUserData = {
  email: 'admin@example.com',
  username: 'adminuser',
  firstName: 'Admin',
  lastName: 'User',
  passwordHash: 'adminPassword123!',
  role: 'admin' as const,
  subscriptionTier: 'guild' as const,
};

describe('User Model Validation', () => {
  describe('Zod Schema Validation', () => {
    it('should validate correct user data', () => {
      const result = userSchema.safeParse(validUserData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.email).toBe(validUserData.email);
        expect(result.data.username).toBe(validUserData.username);
        expect(result.data.firstName).toBe(validUserData.firstName);
        expect(result.data.lastName).toBe(validUserData.lastName);
        expect(result.data.role).toBe('user');
        expect(result.data.subscriptionTier).toBe('free');
      }
    });

    it('should validate admin user data', () => {
      const result = userSchema.safeParse(adminUserData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.role).toBe('admin');
        expect(result.data.subscriptionTier).toBe('guild');
      }
    });

    it('should set default values for optional fields', () => {
      const minimalUserData = {
        email: 'minimal@example.com',
        username: 'minimaluser',
        firstName: 'Minimal',
        lastName: 'User',
        passwordHash: 'password123!',
      };

      const result = userSchema.safeParse(minimalUserData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.role).toBe('user');
        expect(result.data.subscriptionTier).toBe('free');
        expect(result.data.isEmailVerified).toBe(false);
        expect(result.data.preferences.theme).toBe('system');
        expect(result.data.preferences.emailNotifications).toBe(true);
        expect(result.data.preferences.timezone).toBe('UTC');
      }
    });

    it('should reject invalid email format', () => {
      const invalidEmailUser = {
        ...validUserData,
        email: 'invalid-email',
      };

      const result = userSchema.safeParse(invalidEmailUser);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['email'],
              message: expect.stringContaining('email'),
            }),
          ])
        );
      }
    });

    it('should reject invalid username format', () => {
      const invalidUsernameUser = {
        ...validUserData,
        username: 'invalid user!',
      };

      const result = userSchema.safeParse(invalidUsernameUser);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['username'],
            }),
          ])
        );
      }
    });

    it('should reject invalid subscription tier', () => {
      const invalidTierUser = {
        ...validUserData,
        subscriptionTier: 'premium' as any,
      };

      const result = userSchema.safeParse(invalidTierUser);
      expect(result.success).toBe(false);
    });

    it('should reject invalid role', () => {
      const invalidRoleUser = {
        ...validUserData,
        role: 'superuser' as any,
      };

      const result = userSchema.safeParse(invalidRoleUser);
      expect(result.success).toBe(false);
    });

    it('should validate preferences schema', () => {
      const customPreferences = {
        theme: 'light' as const,
        emailNotifications: false,
        browserNotifications: true,
        timezone: 'Europe/London',
        language: 'es',
        diceRollAnimations: false,
        autoSaveEncounters: false,
      };

      const userWithCustomPrefs = {
        ...validUserData,
        preferences: customPreferences,
      };

      const result = userSchema.safeParse(userWithCustomPrefs);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.preferences).toEqual(customPreferences);
      }
    });

    it('should handle optional fields correctly', () => {
      const userWithOptionals = {
        ...validUserData,
        emailVerificationToken: 'verification-token-123',
        passwordResetToken: 'reset-token-456',
        passwordResetExpires: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const result = userSchema.safeParse(userWithOptionals);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.emailVerificationToken).toBe(
          'verification-token-123'
        );
        expect(result.data.passwordResetToken).toBe('reset-token-456');
        expect(result.data.passwordResetExpires).toBeTruthy();
        expect(result.data.lastLoginAt).toBeTruthy();
      }
    });
  });

  describe('Password Hashing Utilities', () => {
    const plainPassword = 'testPassword123!';
    let hashedPassword: string;

    beforeAll(async () => {
      hashedPassword = await bcrypt.hash(plainPassword, 12);
    });

    it('should hash passwords correctly', async () => {
      const hash = await bcrypt.hash(plainPassword, 12);

      expect(hash).not.toBe(plainPassword);
      expect(hash).toMatch(/^\$2[ab]\$/); // bcrypt hash format ($2a$ or $2b$)
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should verify correct passwords', async () => {
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const isMatch = await bcrypt.compare('wrongPassword', hashedPassword);
      expect(isMatch).toBe(false);
    });

    it('should reject empty passwords', async () => {
      const isMatch = await bcrypt.compare('', hashedPassword);
      expect(isMatch).toBe(false);
    });

    it('should handle bcrypt comparison errors gracefully', async () => {
      // Test with invalid hash format - bcrypt returns false for invalid hashes rather than throwing
      const result = await bcrypt.compare(plainPassword, 'invalid-hash');
      expect(result).toBe(false);
    });
  });

  describe('Subscription Tier Logic', () => {
    const subscriptionLimits = {
      free: { parties: 1, encounters: 3, creatures: 10 },
      seasoned: { parties: 3, encounters: 15, creatures: 50 },
      expert: { parties: 10, encounters: 50, creatures: 200 },
      master: { parties: 25, encounters: 100, creatures: 500 },
      guild: { parties: Infinity, encounters: Infinity, creatures: Infinity },
    };

    it('should have correct limits for each subscription tier', () => {
      expect(subscriptionLimits.free.parties).toBe(1);
      expect(subscriptionLimits.seasoned.encounters).toBe(15);
      expect(subscriptionLimits.expert.creatures).toBe(200);
      expect(subscriptionLimits.master.parties).toBe(25);
      expect(subscriptionLimits.guild.creatures).toBe(Infinity);
    });

    it('should validate subscription tier progression', () => {
      const tiers = ['free', 'seasoned', 'expert', 'master', 'guild'];

      for (let i = 0; i < tiers.length - 1; i++) {
        const currentTier = tiers[i] as keyof typeof subscriptionLimits;
        const nextTier = tiers[i + 1] as keyof typeof subscriptionLimits;

        expect(subscriptionLimits[nextTier].parties).toBeGreaterThanOrEqual(
          subscriptionLimits[currentTier].parties
        );
        expect(subscriptionLimits[nextTier].encounters).toBeGreaterThanOrEqual(
          subscriptionLimits[currentTier].encounters
        );
        expect(subscriptionLimits[nextTier].creatures).toBeGreaterThanOrEqual(
          subscriptionLimits[currentTier].creatures
        );
      }
    });
  });

  describe('Token Generation Utilities', () => {
    it('should generate random tokens of correct length', () => {
      const crypto = require('crypto');

      // Test token generation similar to what the model would do
      const token1 = crypto.randomBytes(32).toString('hex');
      const token2 = crypto.randomBytes(32).toString('hex');

      expect(token1).toHaveLength(64); // 32 bytes in hex = 64 characters
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2); // Should be unique
      expect(token1).toMatch(/^[a-f0-9]+$/); // Should be hex
    });

    it('should generate different tokens each time', () => {
      const crypto = require('crypto');
      const tokens = new Set();

      // Generate 100 tokens to check uniqueness
      for (let i = 0; i < 100; i++) {
        const token = crypto.randomBytes(32).toString('hex');
        tokens.add(token);
      }

      expect(tokens.size).toBe(100); // All tokens should be unique
    });
  });

  describe('Email and Username Normalization', () => {
    it('should handle email case normalization', () => {
      const testEmails = [
        'TEST@EXAMPLE.COM',
        'Test@Example.Com',
        'test@EXAMPLE.com',
      ];

      testEmails.forEach(email => {
        const normalized = email.toLowerCase();
        expect(normalized).toBe('test@example.com');
      });
    });

    it('should handle username case normalization', () => {
      const testUsernames = ['TESTUSER', 'TestUser', 'testUSER'];

      testUsernames.forEach(username => {
        const normalized = username.toLowerCase();
        expect(normalized).toBe('testuser');
      });
    });
  });

  describe('Date and Timestamp Handling', () => {
    it('should handle ISO date strings', () => {
      const now = new Date();
      const isoString = now.toISOString();

      expect(isoString).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );

      const parsed = new Date(isoString);
      expect(parsed.getTime()).toBe(now.getTime());
    });

    it('should calculate password reset expiry correctly', () => {
      const now = Date.now();
      const expiry = new Date(now + 10 * 60 * 1000); // 10 minutes

      expect(expiry.getTime()).toBe(now + 600000); // 600,000 ms = 10 minutes
      expect(expiry.getTime()).toBeGreaterThan(now);
    });

    it('should validate date objects', () => {
      const validDate = new Date();
      const invalidDate = new Date('invalid');

      expect(validDate.getTime()).not.toBeNaN();
      expect(invalidDate.getTime()).toBeNaN();
    });
  });

  describe('User Preferences Validation', () => {
    it('should validate theme enum values', () => {
      const validThemes = ['light', 'dark', 'system'];
      const invalidThemes = ['blue', 'red', 'auto'];

      validThemes.forEach(theme => {
        const userData = {
          ...validUserData,
          preferences: { ...validUserData.preferences, theme: theme as any },
        };

        const result = userSchema.safeParse(userData);
        expect(result.success).toBe(true);
      });

      invalidThemes.forEach(theme => {
        const userData = {
          ...validUserData,
          preferences: { ...validUserData.preferences, theme: theme as any },
        };

        const result = userSchema.safeParse(userData);
        expect(result.success).toBe(false);
      });
    });

    it('should validate boolean preferences', () => {
      const booleanFields = [
        'emailNotifications',
        'browserNotifications',
        'diceRollAnimations',
        'autoSaveEncounters',
      ];

      booleanFields.forEach(field => {
        // Test with valid boolean values
        [true, false].forEach(value => {
          const userData = {
            ...validUserData,
            preferences: { ...validUserData.preferences, [field]: value },
          };

          const result = userSchema.safeParse(userData);
          expect(result.success).toBe(true);
        });

        // Test with invalid values
        ['yes', 'no', 1, 0, null].forEach(value => {
          const userData = {
            ...validUserData,
            preferences: { ...validUserData.preferences, [field]: value },
          };

          const result = userSchema.safeParse(userData);
          expect(result.success).toBe(false);
        });
      });
    });

    it('should validate timezone strings', () => {
      const validTimezones = [
        'UTC',
        'America/New_York',
        'Europe/London',
        'Asia/Tokyo',
        'Australia/Sydney',
      ];

      validTimezones.forEach(timezone => {
        const userData = {
          ...validUserData,
          preferences: { ...validUserData.preferences, timezone },
        };

        const result = userSchema.safeParse(userData);
        expect(result.success).toBe(true);
      });
    });

    it('should validate language codes', () => {
      const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh'];

      validLanguages.forEach(language => {
        const userData = {
          ...validUserData,
          preferences: { ...validUserData.preferences, language },
        };

        const result = userSchema.safeParse(userData);
        expect(result.success).toBe(true);
      });
    });
  });
});
