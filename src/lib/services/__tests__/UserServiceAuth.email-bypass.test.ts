import { UserServiceAuth } from '../UserServiceAuth';
import { createValidUserData } from './UserServiceAuth.test-helpers';

// Mock the User model with proper methods
jest.mock('../../models/User', () => {
  const MockUser = jest.fn().mockImplementation((data) => ({
    ...data,
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    generateEmailVerificationToken: jest.fn().mockResolvedValue('mock-token'),
    save: jest.fn().mockResolvedValue(true),
    toPublicJSON: jest.fn().mockImplementation(function() {
      return {
        id: this._id.toString(),
        email: this.email,
        username: this.username,
        firstName: this.firstName,
        lastName: this.lastName,
        isEmailVerified: this.isEmailVerified,
        emailVerificationToken: this.emailVerificationToken,
      };
    }),
  }));

  // Add static methods
  MockUser.findByEmail = jest.fn().mockResolvedValue(null);
  MockUser.findByUsername = jest.fn().mockResolvedValue(null);
  
  return {
    default: MockUser,
    findByEmail: MockUser.findByEmail,
    findByUsername: MockUser.findByUsername,
  };
});

/**
 * Tests for email verification bypass functionality
 * Related to GitHub Issue #430: Bypass email verification for registration for MVP
 */
describe('UserServiceAuth - Email Verification Bypass', () => {
  const originalEnv = process.env.BYPASS_EMAIL_VERIFICATION;

  afterEach(() => {
    // Restore original environment variable
    if (originalEnv === undefined) {
      delete process.env.BYPASS_EMAIL_VERIFICATION;
    } else {
      process.env.BYPASS_EMAIL_VERIFICATION = originalEnv;
    }
    jest.clearAllMocks();
  });

  describe('when BYPASS_EMAIL_VERIFICATION is true', () => {
    beforeEach(() => {
      process.env.BYPASS_EMAIL_VERIFICATION = 'true';
    });

    it('should create user with isEmailVerified set to true', async () => {
      const userData = createValidUserData({
        email: 'bypass-test@example.com',
        username: 'bypassuser'
      });

      const result = await UserServiceAuth.createUser(userData);

      // Debug the result when test fails
      if (!result.success) {
        console.log('Test failed with error:', result.error);
      }

      // The test should pass when we implement the bypass logic
      expect(result.success).toBe(true);
      if (result.success) {
        // User should be automatically verified when bypass is enabled
        expect(result.data.isEmailVerified).toBe(true);
      }
    });

    it('should not generate email verification token when bypass is enabled', async () => {
      const userData = createValidUserData({
        email: 'no-token-test@example.com',
        username: 'notoken'
      });

      const result = await UserServiceAuth.createUser(userData);

      expect(result.success).toBe(true);
      if (result.success) {
        // User should not have a verification token when bypass is enabled
        expect(result.data.emailVerificationToken).toBeUndefined();
      }
    });

    it('should handle multiple users with bypass enabled', async () => {
      const users = [
        createValidUserData({
          email: 'user1-bypass@example.com',
          username: 'user1bypass'
        }),
        createValidUserData({
          email: 'user2-bypass@example.com',
          username: 'user2bypass'
        })
      ];

      const results = await Promise.all(
        users.map(userData => UserServiceAuth.createUser(userData))
      );

      results.forEach(result => {
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.isEmailVerified).toBe(true);
        }
      });
    });
  });

  describe('when BYPASS_EMAIL_VERIFICATION is false', () => {
    beforeEach(() => {
      process.env.BYPASS_EMAIL_VERIFICATION = 'false';
    });

    it('should create user with isEmailVerified set to false (default behavior)', async () => {
      const userData = createValidUserData({
        email: 'no-bypass-test@example.com',
        username: 'nobypassuser'
      });

      const result = await UserServiceAuth.createUser(userData);

      expect(result.success).toBe(true);
      if (result.success) {
        // User should require email verification when bypass is disabled
        expect(result.data.isEmailVerified).toBe(false);
      }
    });

    it('should generate email verification token when bypass is disabled', async () => {
      const userData = createValidUserData({
        email: 'with-token-test@example.com',
        username: 'withtoken'
      });

      const result = await UserServiceAuth.createUser(userData);

      expect(result.success).toBe(true);
      if (result.success) {
        // User should have a verification token when bypass is disabled
        expect(result.data.emailVerificationToken).toBeDefined();
        expect(typeof result.data.emailVerificationToken).toBe('string');
        expect(result.data.emailVerificationToken.length).toBeGreaterThan(0);
      }
    });
  });

  describe('when BYPASS_EMAIL_VERIFICATION is not set', () => {
    beforeEach(() => {
      delete process.env.BYPASS_EMAIL_VERIFICATION;
    });

    it('should default to requiring email verification (false behavior)', async () => {
      const userData = createValidUserData({
        email: 'default-behavior@example.com',
        username: 'defaultuser'
      });

      const result = await UserServiceAuth.createUser(userData);

      expect(result.success).toBe(true);
      if (result.success) {
        // Default behavior should require email verification
        expect(result.data.isEmailVerified).toBe(false);
        expect(result.data.emailVerificationToken).toBeDefined();
      }
    });
  });

  describe('when BYPASS_EMAIL_VERIFICATION has invalid values', () => {
    it.each(['invalid', '1', 'yes', 'TRUE', 'True'])(
      'should default to false behavior for invalid value: %s',
      async (invalidValue) => {
        process.env.BYPASS_EMAIL_VERIFICATION = invalidValue;

        const userData = createValidUserData({
          email: `invalid-${invalidValue}@example.com`,
          username: `invalid${invalidValue.toLowerCase()}`
        });

        const result = await UserServiceAuth.createUser(userData);

        expect(result.success).toBe(true);
        if (result.success) {
          // Invalid values should default to requiring email verification
          expect(result.data.isEmailVerified).toBe(false);
          expect(result.data.emailVerificationToken).toBeDefined();
        }
      }
    );
  });
});