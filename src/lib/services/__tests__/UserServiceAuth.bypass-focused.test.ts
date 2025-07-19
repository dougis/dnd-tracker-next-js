/**
 * Focused test for email verification bypass functionality
 * Specifically targets the bypass logic lines for 80%+ coverage
 */

import { UserServiceAuth } from '../UserServiceAuth';

// Mock all dependencies to focus on bypass logic
jest.mock('../UserServiceHelpers', () => ({
  checkUserExists: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../UserServiceValidation', () => ({
  UserServiceValidation: {
    validateAndParseRegistration: jest.fn(data => data),
  },
}));

jest.mock('../UserServiceDatabase', () => ({
  UserServiceDatabase: {
    generateAndSaveEmailToken: jest.fn().mockResolvedValue(undefined),
    saveUserSafely: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../models/User', () => {
  return jest.fn().mockImplementation((data) => ({
    ...data,
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    toPublicJSON: jest.fn().mockReturnValue({
      id: '507f1f77bcf86cd799439011',
      email: data.email,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      isEmailVerified: data.isEmailVerified,
      emailVerificationToken: data.emailVerificationToken,
    }),
  }));
});

jest.mock('../../utils/password-security', () => ({
  validatePasswordStrength: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
  isPasswordHashed: jest.fn().mockReturnValue(false),
}));

jest.mock('../UserServiceResponseHelpers', () => ({
  UserServiceResponseHelpers: {
    createSuccessResponse: jest.fn().mockImplementation(data => ({ success: true, data })),
    safeToPublicJSON: jest.fn().mockImplementation(user => user.toPublicJSON()),
  },
}));

describe('UserServiceAuth - Email Bypass Focus', () => {
  const originalEnv = process.env.BYPASS_EMAIL_VERIFICATION;
  
  // Get mocked modules
  const { UserServiceDatabase } = require('../UserServiceDatabase');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment variable
    if (originalEnv === undefined) {
      delete process.env.BYPASS_EMAIL_VERIFICATION;
    } else {
      process.env.BYPASS_EMAIL_VERIFICATION = originalEnv;
    }
  });

  const createValidUserData = () => ({
    email: 'test@example.com',
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    agreeToTerms: true,
    subscribeToNewsletter: false,
  });

  describe('shouldBypassEmailVerification', () => {
    it('should return true when BYPASS_EMAIL_VERIFICATION is "true"', () => {
      process.env.BYPASS_EMAIL_VERIFICATION = 'true';

      // Test line 38: const bypassValue = process.env.BYPASS_EMAIL_VERIFICATION;
      // Test line 39: return bypassValue === 'true';
      const result = (UserServiceAuth as any).shouldBypassEmailVerification();

      expect(result).toBe(true);
    });

    it('should return false when BYPASS_EMAIL_VERIFICATION is "false"', () => {
      process.env.BYPASS_EMAIL_VERIFICATION = 'false';

      // Test line 38: const bypassValue = process.env.BYPASS_EMAIL_VERIFICATION;
      // Test line 39: return bypassValue === 'true';
      const result = (UserServiceAuth as any).shouldBypassEmailVerification();

      expect(result).toBe(false);
    });

    it('should return false when BYPASS_EMAIL_VERIFICATION is not set', () => {
      delete process.env.BYPASS_EMAIL_VERIFICATION;

      // Test line 38: const bypassValue = process.env.BYPASS_EMAIL_VERIFICATION;
      // Test line 39: return bypassValue === 'true';
      const result = (UserServiceAuth as any).shouldBypassEmailVerification();

      expect(result).toBe(false);
    });

    it('should return false for various invalid values', () => {
      const invalidValues = ['invalid', '1', 'yes', 'TRUE', 'True', 'on', ''];

      invalidValues.forEach(value => {
        process.env.BYPASS_EMAIL_VERIFICATION = value;

        // Test line 38: const bypassValue = process.env.BYPASS_EMAIL_VERIFICATION;
        // Test line 39: return bypassValue === 'true';
        const result = (UserServiceAuth as any).shouldBypassEmailVerification();

        expect(result).toBe(false);
      });
    });
  });

  describe('createUser integration with bypass logic', () => {
    it('should use bypass path when BYPASS_EMAIL_VERIFICATION is true', async () => {
      process.env.BYPASS_EMAIL_VERIFICATION = 'true';
      const userData = createValidUserData();

      // Test line 105: const bypassEmailVerification = this.shouldBypassEmailVerification();
      // Test line 119: if (!bypassEmailVerification) - should be false, so skip generateAndSaveEmailToken
      // Test line 123: await UserServiceDatabase.saveUserSafely(newUser);
      const result = await UserServiceAuth.createUser(userData);

      expect(result.success).toBe(true);
      
      // Verify bypass path was taken
      expect(UserServiceDatabase.saveUserSafely).toHaveBeenCalledTimes(1);
      expect(UserServiceDatabase.generateAndSaveEmailToken).not.toHaveBeenCalled();
    });

    it('should use normal path when BYPASS_EMAIL_VERIFICATION is false', async () => {
      process.env.BYPASS_EMAIL_VERIFICATION = 'false';
      const userData = createValidUserData();

      // Test line 105: const bypassEmailVerification = this.shouldBypassEmailVerification();
      // Test line 119: if (!bypassEmailVerification) - should be true
      // Test line 120: await UserServiceDatabase.generateAndSaveEmailToken(newUser);
      const result = await UserServiceAuth.createUser(userData);

      expect(result.success).toBe(true);
      
      // Verify normal path was taken
      expect(UserServiceDatabase.generateAndSaveEmailToken).toHaveBeenCalledTimes(1);
      expect(UserServiceDatabase.saveUserSafely).not.toHaveBeenCalled();
    });
  });
});