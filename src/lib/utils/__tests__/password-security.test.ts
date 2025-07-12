import {
  hashPassword,
  comparePassword,
  isPasswordHashed,
  validatePasswordStrength,
  auditPasswordSecurity,
} from '../password-security';
import { TestPasswordConstants } from '../test-utils/password-constants';

describe('Password Security Utils', () => {
  describe('hashPassword', () => {
    it('should hash a valid password', async () => {
      const plainPassword = TestPasswordConstants.VALID_PASSWORD;
      const hashedPassword = await hashPassword(plainPassword);

      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d{2}\$/);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it('should reject weak passwords', async () => {
      const weakPasswords = [
        'short', // too short
        '', // empty
        'a'.repeat(1001), // too long
      ];

      for (const password of weakPasswords) {
        await expect(hashPassword(password)).rejects.toThrow();
      }
    });

    it('should reject already hashed passwords', async () => {
      const hashedPassword = TestPasswordConstants.HASHED_PASSWORD_EXAMPLE;
      await expect(hashPassword(hashedPassword)).rejects.toThrow('already hashed');
    });

    it('should reject invalid inputs', async () => {
      await expect(hashPassword(null as any)).rejects.toThrow('must be a string');
      await expect(hashPassword(123 as any)).rejects.toThrow('must be a string');
      await expect(hashPassword('')).rejects.toThrow('at least 8 characters');
      await expect(hashPassword('a'.repeat(1001))).rejects.toThrow('too long');
    });
  });

  describe('comparePassword', () => {
    it('should correctly compare passwords', async () => {
      const plainPassword = TestPasswordConstants.VALID_PASSWORD;
      const hashedPassword = await hashPassword(plainPassword);

      const isValid = await comparePassword(plainPassword, hashedPassword);
      expect(isValid).toBe(true);

      const isInvalid = await comparePassword(TestPasswordConstants.WRONG_PASSWORD, hashedPassword);
      expect(isInvalid).toBe(false);
    });

    it('should reject comparison with unhashed passwords', async () => {
      await expect(
        comparePassword(TestPasswordConstants.SIMPLE_WEAK, TestPasswordConstants.PLAIN_TEXT)
      ).rejects.toThrow('SECURITY ERROR');
    });

    it('should reject invalid inputs', async () => {
      const hashedPassword = TestPasswordConstants.HASHED_PASSWORD_ALT;

      await expect(
        comparePassword(null as any, hashedPassword)
      ).rejects.toThrow('must be strings');

      await expect(
        comparePassword(TestPasswordConstants.SIMPLE_WEAK, null as any)
      ).rejects.toThrow('must be strings');
    });
  });

  describe('isPasswordHashed', () => {
    it('should correctly identify hashed passwords', () => {
      const hashedPasswords = [
        '$2a$12$W/6WPGC5/e.M2vtQEpusM.0ltMcd1DeZUzqQ5LxJ.W7iRsyp0zZNm',
        '$2b$10$W/6WPGC5/e.M2vtQEpusM.0ltMcd1DeZUzqQ5LxJ.W7iRsyp0zZNm',
        '$2y$15$W/6WPGC5/e.M2vtQEpusM.0ltMcd1DeZUzqQ5LxJ.W7iRsyp0zZNm',
      ];

      for (const hash of hashedPasswords) {
        expect(isPasswordHashed(hash)).toBe(true);
      }
    });

    it('should correctly identify non-hashed passwords', () => {
      const plainPasswords = [
        TestPasswordConstants.WEAK_123,
        TestPasswordConstants.VALID_PASSWORD,
        '$invalid$hash',
        '$2a$hashedPasswordExample', // too short
        'plaintext',
        '',
      ];

      for (const password of plainPasswords) {
        expect(isPasswordHashed(password)).toBe(false);
      }
    });

    it('should handle invalid inputs gracefully', () => {
      expect(isPasswordHashed(null as any)).toBe(false);
      expect(isPasswordHashed(undefined as any)).toBe(false);
      expect(isPasswordHashed(123 as any)).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        TestPasswordConstants.STRONG_PASSWORD,
        'MySecureP@ssw0rd',
        'Complex$Pass123',
      ];

      for (const password of strongPasswords) {
        const result = validatePasswordStrength(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.strength).toBe('strong');
      }
    });

    it('should identify medium strength passwords', () => {
      const mediumPasswords = [
        { password: 'Password123', expectValid: false }, // missing special char
        { password: 'Pass$word1', expectValid: true },   // has all criteria
      ];

      for (const { password, expectValid } of mediumPasswords) {
        const result = validatePasswordStrength(password);
        expect(result.strength).toBe('medium');
        expect(result.isValid).toBe(expectValid);
      }
    });

    it('should identify weak passwords', () => {
      const weakPasswords = [
        TestPasswordConstants.SIMPLE_WEAK,
        '12345678',
        'PASSWORD',
        'short',
      ];

      for (const password of weakPasswords) {
        const result = validatePasswordStrength(password);
        expect(result.isValid).toBe(false);
        expect(result.strength).toBe('weak');
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('should handle invalid inputs', () => {
      const result = validatePasswordStrength(123 as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be a string');
    });
  });

  describe('auditPasswordSecurity', () => {
    it('should correctly audit password arrays', () => {
      const passwords = [
        '$2b$12$W/6WPGC5/e.M2vtQEpusM.0ltMcd1DeZUzqQ5LxJ.W7iRsyp0zZNm', // hashed
        'plaintext1', // plaintext
        '$2a$10$W/6WPGC5/e.M2vtQEpusM.0ltMcd1DeZUzqQ5LxJ.W7iRsyp0zZNm', // hashed
        'plaintext2', // plaintext
      ];

      const audit = auditPasswordSecurity(passwords);

      expect(audit.totalPasswords).toBe(4);
      expect(audit.hashedPasswords).toBe(2);
      expect(audit.plaintextPasswords).toBe(2);
      expect(audit.suspiciousPasswords).toHaveLength(2);
      expect(audit.suspiciousPasswords[0]).toContain('[10 chars');
      expect(audit.suspiciousPasswords[1]).toContain('[10 chars');
    });

    it('should handle empty arrays', () => {
      const audit = auditPasswordSecurity([]);
      expect(audit.totalPasswords).toBe(0);
      expect(audit.hashedPasswords).toBe(0);
      expect(audit.plaintextPasswords).toBe(0);
      expect(audit.suspiciousPasswords).toHaveLength(0);
    });
  });

  describe('integration security tests', () => {
    it('should provide end-to-end password security', async () => {
      const plainPassword = TestPasswordConstants.SECURE_TEST_PASSWORD;

      // Validate password strength
      const validation = validatePasswordStrength(plainPassword);
      expect(validation.isValid).toBe(true);
      expect(validation.strength).toBe('strong');

      // Hash the password
      const hashedPassword = await hashPassword(plainPassword);
      expect(isPasswordHashed(hashedPassword)).toBe(true);

      // Compare passwords
      const isValid = await comparePassword(plainPassword, hashedPassword);
      expect(isValid).toBe(true);

      // Audit security
      const audit = auditPasswordSecurity([hashedPassword, 'plaintext']);
      expect(audit.hashedPasswords).toBe(1);
      expect(audit.plaintextPasswords).toBe(1);
    });
  });
});