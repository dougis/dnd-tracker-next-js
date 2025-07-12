/**
 * Real Password Hashing Test - Simplified for compatibility
 * This test simulates real password hashing behavior without database conflicts
 */

import bcrypt from 'bcryptjs';
import { isPasswordHashed, hashPassword, comparePassword } from '../../utils/password-security';
import { TestPasswordConstants } from '../../test-utils/password-constants';

describe('Real Password Hashing Security Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Security Utilities', () => {
    it('should automatically hash passwords correctly', async () => {
      const plainPassword = TestPasswordConstants.VALID_PASSWORD;

      // Before hashing, check if password is plain text
      expect(isPasswordHashed(plainPassword)).toBe(false);
      console.log('Before hashing - password:', plainPassword);

      // Hash the password
      const hashedPassword = await hashPassword(plainPassword);

      // After hashing, password should be hashed
      console.log('After hashing - passwordHash:', hashedPassword);
      console.log('Password length:', hashedPassword.length);
      console.log('Is bcrypt hash?', hashedPassword.startsWith('$2'));

      // Check if password was actually hashed
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/);
      expect(hashedPassword.length).toBeGreaterThan(50);
      expect(isPasswordHashed(hashedPassword)).toBe(true);

      // Verify comparePassword works
      const isValid = await comparePassword(plainPassword, hashedPassword);
      expect(isValid).toBe(true);

      const isInvalid = await comparePassword('WrongPassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });

    it('should handle direct bcrypt operations', async () => {
      const plainPassword = TestPasswordConstants.DIRECT_BCRYPT_PASSWORD;

      // Test direct bcrypt hashing
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);

      console.log('Direct bcrypt hash:', hashedPassword);

      expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/);
      expect(hashedPassword).not.toBe(plainPassword);
      expect(isPasswordHashed(hashedPassword)).toBe(true);

      // Test comparison
      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should detect if passwords are stored as plaintext', async () => {
      const testPasswords = [
        'Password123!',
        'AnotherPassword456!',
        'SimplePassword789!',
      ];

      for (const password of testPasswords) {
        console.log(`Testing password: "${password}"`);

        // Hash the password
        const hashedPassword = await hashPassword(password);
        console.log(`Password: "${password}" -> Hash: "${hashedPassword}"`);

        // CRITICAL SECURITY CHECK: Password should NEVER be stored as plaintext
        expect(hashedPassword).not.toBe(password);
        expect(isPasswordHashed(hashedPassword)).toBe(true);

        // Check if it looks like a bcrypt hash
        if (hashedPassword === password) {
          console.error('🚨 SECURITY VULNERABILITY: Password stored as plaintext!');
          throw new Error('SECURITY VULNERABILITY: Password stored as plaintext');
        }

        // Verify the hashed password can be used for comparison
        const isValid = await comparePassword(password, hashedPassword);
        expect(isValid).toBe(true);
      }
    });
  });

  describe('Security Implementation Analysis', () => {
    it('should report the current password hashing behavior', async () => {
      const plainPassword = TestPasswordConstants.REPORT_TEST_PASSWORD;

      console.log('=== PASSWORD HASHING ANALYSIS ===');
      console.log('Original password:', plainPassword);
      console.log('Is plaintext hashed initially?', isPasswordHashed(plainPassword));

      // Hash the password using our security utilities
      const hashedPassword = await hashPassword(plainPassword);

      console.log('After hashing:', hashedPassword);
      console.log('Password equals original after hashing?', hashedPassword === plainPassword);
      console.log('Looks like bcrypt hash?', hashedPassword.startsWith('$2'));
      console.log('Hash length:', hashedPassword.length);
      console.log('Is considered hashed?', isPasswordHashed(hashedPassword));
      console.log('=== END ANALYSIS ===');

      // Test authentication
      try {
        const isValid = await comparePassword(plainPassword, hashedPassword);
        console.log('comparePassword result:', isValid);
        expect(isValid).toBe(true);
      } catch (error) {
        console.log('comparePassword error:', error);
        throw error;
      }

      // Ensure security compliance
      expect(hashedPassword).not.toBe(plainPassword);
      expect(isPasswordHashed(hashedPassword)).toBe(true);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/);
    });
  });
});