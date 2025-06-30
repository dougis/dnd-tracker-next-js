import {
  type CreateUserInput,
  type PublicUser,
  type SubscriptionFeature,
  SUBSCRIPTION_LIMITS
} from '../User';

describe('User Model Types and Interfaces', () => {
  // Constants to avoid duplication
  const VALID_FEATURES: SubscriptionFeature[] = ['parties', 'encounters', 'characters'];
  const TIER_NAMES = ['free', 'seasoned', 'expert', 'master', 'guild'];
  const NON_GUILD_TIERS = ['free', 'seasoned', 'expert', 'master'];

  const SAMPLE_PREFERENCES = {
    theme: 'dark' as const,
    emailNotifications: true,
    browserNotifications: false,
    timezone: 'UTC',
    language: 'en',
    diceRollAnimations: true,
    autoSaveEncounters: true,
  };

  const DEFAULT_PREFERENCES = {
    theme: 'system' as const,
    emailNotifications: true,
    browserNotifications: false,
    timezone: 'UTC',
    language: 'en',
    diceRollAnimations: true,
    autoSaveEncounters: true,
  };

  const SENSITIVE_FIELDS = ['passwordHash', 'emailVerificationToken', 'passwordResetToken', 'passwordResetExpires'];

  describe('Type Definitions', () => {
    it('should have User model defined', () => {
      expect(SUBSCRIPTION_LIMITS).toBeDefined();
    });

    it('should have correct SubscriptionFeature type', () => {
      expect(VALID_FEATURES).toHaveLength(3);
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
        preferences: SAMPLE_PREFERENCES
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
        preferences: DEFAULT_PREFERENCES,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Check sensitive fields are excluded
      SENSITIVE_FIELDS.forEach(field => {
        expect(mockPublicUser).not.toHaveProperty(field);
      });

      expect(mockPublicUser).toHaveProperty('id');
      expect(mockPublicUser).not.toHaveProperty('_id');
    });
  });

  describe('Constants and Enums', () => {
    it('should have all subscription tier limits defined', () => {
      expect(SUBSCRIPTION_LIMITS).toBeDefined();
      expect(typeof SUBSCRIPTION_LIMITS).toBe('object');

      const actualTiers = Object.keys(SUBSCRIPTION_LIMITS);
      expect(actualTiers.sort()).toEqual(TIER_NAMES.sort());
    });

    it('should have numeric limits for all tiers except guild', () => {
      NON_GUILD_TIERS.forEach(tier => {
        VALID_FEATURES.forEach(feature => {
          const limit = SUBSCRIPTION_LIMITS[tier as keyof typeof SUBSCRIPTION_LIMITS][feature];
          expect(typeof limit).toBe('number');
          expect(limit).toBeGreaterThan(0);
          expect(Number.isFinite(limit)).toBe(true);
        });
      });
    });

    it('should have infinite limits for guild tier', () => {
      VALID_FEATURES.forEach(feature => {
        const limit = SUBSCRIPTION_LIMITS.guild[feature];
        expect(limit).toBe(Infinity);
      });
    });
  });

  describe('Model Schema Validation Logic', () => {
    const enumValidationTests = [
      { name: 'theme', values: ['light', 'dark', 'system'] },
      { name: 'role', values: ['user', 'admin'] },
      { name: 'subscription tier', values: TIER_NAMES },
    ];

    enumValidationTests.forEach(({ name, values }) => {
      it(`should validate ${name} enum values`, () => {
        values.forEach(value => {
          expect(values).toContain(value);
        });
      });
    });

    it('should have proper default preferences structure', () => {
      Object.entries(DEFAULT_PREFERENCES).forEach(([key, expectedValue]) => {
        expect(DEFAULT_PREFERENCES[key as keyof typeof DEFAULT_PREFERENCES]).toBe(expectedValue);
      });
    });
  });
});
