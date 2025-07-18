/**
 * Unit test for email verification bypass logic
 * Tests the shouldBypassEmailVerification method in isolation
 */

// Direct import to test the static method
import { UserServiceAuth } from '../UserServiceAuth';

describe('UserServiceAuth - Email Bypass Logic', () => {
  const originalEnv = process.env.BYPASS_EMAIL_VERIFICATION;

  afterEach(() => {
    // Restore original environment variable
    if (originalEnv === undefined) {
      delete process.env.BYPASS_EMAIL_VERIFICATION;
    } else {
      process.env.BYPASS_EMAIL_VERIFICATION = originalEnv;
    }
  });

  describe('shouldBypassEmailVerification', () => {
    it('should return true when BYPASS_EMAIL_VERIFICATION is "true"', () => {
      process.env.BYPASS_EMAIL_VERIFICATION = 'true';
      
      // Access the private method through any means necessary for testing
      const result = (UserServiceAuth as any).shouldBypassEmailVerification();
      
      expect(result).toBe(true);
    });

    it('should return false when BYPASS_EMAIL_VERIFICATION is "false"', () => {
      process.env.BYPASS_EMAIL_VERIFICATION = 'false';
      
      const result = (UserServiceAuth as any).shouldBypassEmailVerification();
      
      expect(result).toBe(false);
    });

    it('should return false when BYPASS_EMAIL_VERIFICATION is not set', () => {
      delete process.env.BYPASS_EMAIL_VERIFICATION;
      
      const result = (UserServiceAuth as any).shouldBypassEmailVerification();
      
      expect(result).toBe(false);
    });

    it('should return false for invalid values', () => {
      const invalidValues = ['invalid', '1', 'yes', 'TRUE', 'True', 'on'];
      
      invalidValues.forEach(value => {
        process.env.BYPASS_EMAIL_VERIFICATION = value;
        
        const result = (UserServiceAuth as any).shouldBypassEmailVerification();
        
        expect(result).toBe(false);
      });
    });

    it('should be case sensitive (only "true" returns true)', () => {
      const caseSensitiveValues = ['TRUE', 'True', 'tRue', 'TRUE'];
      
      caseSensitiveValues.forEach(value => {
        process.env.BYPASS_EMAIL_VERIFICATION = value;
        
        const result = (UserServiceAuth as any).shouldBypassEmailVerification();
        
        expect(result).toBe(false);
      });
    });
  });
});