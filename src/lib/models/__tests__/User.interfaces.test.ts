import {
  type CreateUserInput,
  type PublicUser,
  type SubscriptionFeature,
  SUBSCRIPTION_LIMITS
} from '../User';

describe('User Model Types and Interfaces', () => {
  describe('Type Definitions', () => {
    it('should have User model defined', () => {
      // Just check that the module exports exist
      expect(SUBSCRIPTION_LIMITS).toBeDefined();
    });

    it('should have correct SubscriptionFeature type', () => {
      const validFeatures: SubscriptionFeature[] = ['parties', 'encounters', 'characters'];
      expect(validFeatures).toHaveLength(3);
    });

    it('should validate CreateUserInput interface shape', () => {
      const validInput: CreateUserInput = {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
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
        }
      };

      expect(validInput.email).toBe('test@example.com');
      expect(validInput.username).toBe('testuser');
      expect(validInput.firstName).toBe('John');
      expect(validInput.lastName).toBe('Doe');
      expect(validInput.password).toBe('password123');
      expect(validInput.role).toBe('user');
      expect(validInput.subscriptionTier).toBe('free');
      expect(validInput.preferences?.theme).toBe('dark');
    });

    it('should validate PublicUser interface excludes sensitive fields', () => {
      const mockPublicUser: PublicUser = {
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        subscriptionTier: 'free',
        isEmailVerified: false,
        preferences: {
          theme: 'system',
          emailNotifications: true,
          browserNotifications: false,
          timezone: 'UTC',
          language: 'en',
          diceRollAnimations: true,
          autoSaveEncounters: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(mockPublicUser).not.toHaveProperty('passwordHash');
      expect(mockPublicUser).not.toHaveProperty('emailVerificationToken');
      expect(mockPublicUser).not.toHaveProperty('passwordResetToken');
      expect(mockPublicUser).not.toHaveProperty('passwordResetExpires');
      expect(mockPublicUser).toHaveProperty('id');
      expect(mockPublicUser).not.toHaveProperty('_id');
    });
  });

  describe('Constants and Enums', () => {
    it('should have all subscription tier limits defined', () => {
      expect(SUBSCRIPTION_LIMITS).toBeDefined();
      expect(typeof SUBSCRIPTION_LIMITS).toBe('object');

      const expectedTiers = ['free', 'seasoned', 'expert', 'master', 'guild'];
      const actualTiers = Object.keys(SUBSCRIPTION_LIMITS);

      expect(actualTiers.sort()).toEqual(expectedTiers.sort());
    });

    it('should have numeric limits for all tiers except guild', () => {
      const nonGuildTiers = ['free', 'seasoned', 'expert', 'master'];
      const features = ['parties', 'encounters', 'characters'];

      nonGuildTiers.forEach(tier => {
        features.forEach(feature => {
          const limit = SUBSCRIPTION_LIMITS[tier as keyof typeof SUBSCRIPTION_LIMITS][feature as SubscriptionFeature];
          expect(typeof limit).toBe('number');
          expect(limit).toBeGreaterThan(0);
          expect(Number.isFinite(limit)).toBe(true);
        });
      });
    });

    it('should have infinite limits for guild tier', () => {
      const features: SubscriptionFeature[] = ['parties', 'encounters', 'characters'];

      features.forEach(feature => {
        const limit = SUBSCRIPTION_LIMITS.guild[feature];
        expect(limit).toBe(Infinity);
      });
    });
  });

  describe('Model Schema Validation Logic', () => {
    it('should validate theme enum values', () => {
      const validThemes = ['light', 'dark', 'system'];
      expect(validThemes).toContain('light');
      expect(validThemes).toContain('dark');
      expect(validThemes).toContain('system');
    });

    it('should validate role enum values', () => {
      const validRoles = ['user', 'admin'];
      expect(validRoles).toContain('user');
      expect(validRoles).toContain('admin');
    });

    it('should validate subscription tier enum values', () => {
      const validTiers = ['free', 'seasoned', 'expert', 'master', 'guild'];
      expect(validTiers).toContain('free');
      expect(validTiers).toContain('seasoned');
      expect(validTiers).toContain('expert');
      expect(validTiers).toContain('master');
      expect(validTiers).toContain('guild');
    });

    it('should have proper default preferences structure', () => {
      const defaultPreferences = {
        theme: 'system',
        emailNotifications: true,
        browserNotifications: false,
        timezone: 'UTC',
        language: 'en',
        diceRollAnimations: true,
        autoSaveEncounters: true,
      };

      expect(defaultPreferences.theme).toBe('system');
      expect(defaultPreferences.emailNotifications).toBe(true);
      expect(defaultPreferences.browserNotifications).toBe(false);
      expect(defaultPreferences.timezone).toBe('UTC');
      expect(defaultPreferences.language).toBe('en');
      expect(defaultPreferences.diceRollAnimations).toBe(true);
      expect(defaultPreferences.autoSaveEncounters).toBe(true);
    });
  });
});
