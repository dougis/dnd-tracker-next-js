import { hashPassword, comparePassword, isPasswordHashed, validatePasswordStrength } from '../../utils/password-security';
import { TestPasswordConstants } from '../../test-utils/password-constants';

/**
 * Critical Security Test: Password Hashing Verification
 * This test verifies that passwords are properly hashed and never stored in plaintext
 */
describe('Password Hashing Security Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Security Utilities', () => {
    it('should hash password correctly', async () => {
      const plainPassword = TestPasswordConstants.VALID_PASSWORD;

      // Before hashing, password should not be considered hashed
      expect(isPasswordHashed(plainPassword)).toBe(false);

      // Hash the password
      const hashedPassword = await hashPassword(plainPassword);

      // After hashing, password should be properly hashed
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
      expect(isPasswordHashed(hashedPassword)).toBe(true);

      // Should be able to compare with original password
      const isValid = await comparePassword(plainPassword, hashedPassword);
      expect(isValid).toBe(true);

      // Should fail with wrong password
      const isInvalid = await comparePassword(TestPasswordConstants.WRONG_SIMPLE, hashedPassword);
      expect(isInvalid).toBe(false);
    });

    it('should not rehash already hashed passwords', async () => {
      const plainPassword = TestPasswordConstants.VALID_PASSWORD;
      const hashedPassword = await hashPassword(plainPassword);

      // Attempting to hash an already hashed password should throw an error
      await expect(hashPassword(hashedPassword)).rejects.toThrow('already hashed');
    });

    it('should validate password strength requirements', async () => {
      const strongPassword = TestPasswordConstants.STRONG_PASSWORD;
      const weakPassword = TestPasswordConstants.WEAK_PASSWORD;

      // Strong password should pass validation
      const strongValidation = validatePasswordStrength(strongPassword);
      expect(strongValidation.isValid).toBe(true);
      expect(strongValidation.strength).toBe('strong');
      expect(strongValidation.errors).toHaveLength(0);

      // Weak password should fail validation
      const weakValidation = validatePasswordStrength(weakPassword);
      expect(weakValidation.isValid).toBe(false);
      expect(weakValidation.strength).toBe('weak');
      expect(weakValidation.errors.length).toBeGreaterThan(0);
    });

    it('should authenticate user with hashed password comparison', async () => {
      const plainPassword = TestPasswordConstants.AUTH_TEST_PASSWORD;

      // Hash the password
      const hashedPassword = await hashPassword(plainPassword);

      // Should authenticate with correct password
      const isCorrect = await comparePassword(plainPassword, hashedPassword);
      expect(isCorrect).toBe(true);

      // Should fail with wrong password
      const isWrong = await comparePassword(TestPasswordConstants.WRONG_PASSWORD, hashedPassword);
      expect(isWrong).toBe(false);
    });

    it('should handle password changes securely', async () => {
      const originalPassword = TestPasswordConstants.ORIGINAL_PASSWORD;
      const newPassword = TestPasswordConstants.NEW_PASSWORD;

      // Hash both passwords
      const originalHash = await hashPassword(originalPassword);
      const newHash = await hashPassword(newPassword);

      // Hashes should be different
      expect(originalHash).not.toBe(newHash);
      expect(originalHash).not.toBe(newPassword);
      expect(newHash).not.toBe(originalPassword);

      // Both should be valid bcrypt hashes
      expect(isPasswordHashed(originalHash)).toBe(true);
      expect(isPasswordHashed(newHash)).toBe(true);

      // Should authenticate with correct passwords
      const originalValid = await comparePassword(originalPassword, originalHash);
      expect(originalValid).toBe(true);

      const newValid = await comparePassword(newPassword, newHash);
      expect(newValid).toBe(true);
    });
  });

  describe('Security Compliance', () => {
    it('should never store plaintext passwords', async () => {
      const passwords = [
        TestPasswordConstants.PASSWORD_123,
        TestPasswordConstants.ANOTHER_PASSWORD,
        TestPasswordConstants.THIRD_PASSWORD,
      ];

      for (const password of passwords) {
        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Password should be hashed, not plaintext
        expect(hashedPassword).not.toBe(password);
        expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are long
        expect(hashedPassword.startsWith('$2')).toBe(true); // bcrypt prefix
        expect(isPasswordHashed(hashedPassword)).toBe(true);

        // Should be able to verify the password
        const isValid = await comparePassword(password, hashedPassword);
        expect(isValid).toBe(true);
      }
    });

    it('should use proper bcrypt salt rounds', async () => {
      const password = TestPasswordConstants.SALT_TEST_PASSWORD;

      // Hash the password
      const hashedPassword = await hashPassword(password);

      // Extract salt rounds from hash
      const hashParts = hashedPassword.split('$');
      const saltRounds = parseInt(hashParts[2], 10);

      // Should use at least 12 rounds for security
      expect(saltRounds).toBeGreaterThanOrEqual(12);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d{2}\$/);
    });

    it('should detect plaintext vs hashed passwords', () => {
      const plaintextPasswords = [
        TestPasswordConstants.WEAK_123,
        TestPasswordConstants.VALID_PASSWORD,
        TestPasswordConstants.SHORT_PASSWORD,
        'verylongpasswordthatisnothashedbutlongenoughtobeconfusing',
      ];

      const hashedPasswords = [
        '$2a$12$W/6WPGC5/e.M2vtQEpusM.0ltMcd1DeZUzqQ5LxJ.W7iRsyp0zZNm',
        '$2b$10$W/6WPGC5/e.M2vtQEpusM.0ltMcd1DeZUzqQ5LxJ.W7iRsyp0zZNm',
        '$2y$15$W/6WPGC5/e.M2vtQEpusM.0ltMcd1DeZUzqQ5LxJ.W7iRsyp0zZNm',
      ];

      // All plaintext passwords should be detected as NOT hashed
      for (const password of plaintextPasswords) {
        expect(isPasswordHashed(password)).toBe(false);
      }

      // All hashed passwords should be detected as hashed
      for (const hash of hashedPasswords) {
        expect(isPasswordHashed(hash)).toBe(true);
      }
    });

    it('should reject weak passwords', async () => {
      const weakPasswords = [
        TestPasswordConstants.SHORT_PASSWORD,     // too short
        '',          // empty
        'a'.repeat(1001), // too long
      ];

      for (const weakPassword of weakPasswords) {
        await expect(hashPassword(weakPassword)).rejects.toThrow();
      }

      // Note: Some passwords like "password" or "12345678" may be 8+ characters
      // but still weak. They should be caught by password strength validation,
      // not the hashing function itself. The hashing function only validates
      // basic requirements like length.
    });

    it('should enforce password security requirements', async () => {
      // Test password strength validation
      const testCases = [
        { password: TestPasswordConstants.STRONG_PASSWORD, shouldPass: true, expectedStrength: 'strong' },
        { password: 'MediumPass1', shouldPass: false, expectedStrength: 'medium' },
        { password: TestPasswordConstants.WEAK_PASSWORD, shouldPass: false, expectedStrength: 'weak' },
      ];

      for (const testCase of testCases) {
        const validation = validatePasswordStrength(testCase.password);
        expect(validation.isValid).toBe(testCase.shouldPass);
        expect(validation.strength).toBe(testCase.expectedStrength);

        if (!testCase.shouldPass) {
          expect(validation.errors.length).toBeGreaterThan(0);
        }
      }
    });
  });
});