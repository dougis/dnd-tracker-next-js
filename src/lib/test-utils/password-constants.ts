/**
 * Test password utilities and constants for testing purposes
 * These are not actual secrets and are used only for test scenarios
 */

export const TestPasswordConstants = {
  // Standard test passwords with sufficient complexity
  VALID_PASSWORD: process.env.TEST_PASSWORD_VALID || 'TestPassword123!',
  STRONG_PASSWORD: process.env.TEST_PASSWORD_STRONG || 'StrongPassword123!',
  WEAK_PASSWORD: process.env.TEST_PASSWORD_WEAK || 'weak',
  SHORT_PASSWORD: process.env.TEST_PASSWORD_SHORT || 'short',

  // Specific test scenario passwords
  AUTH_TEST_PASSWORD: process.env.TEST_PASSWORD_AUTH || 'AuthTestPassword123!',
  ORIGINAL_PASSWORD: process.env.TEST_PASSWORD_ORIGINAL || 'OriginalPassword123!',
  NEW_PASSWORD: process.env.TEST_PASSWORD_NEW || 'NewPassword123!',
  SALT_TEST_PASSWORD: process.env.TEST_PASSWORD_SALT || 'SaltTestPassword123!',
  SECURITY_COMPLIANT_PASSWORD: process.env.TEST_PASSWORD_SECURITY || 'SecurityCompliantPassword123!',
  DIRECT_BCRYPT_PASSWORD: process.env.TEST_PASSWORD_BCRYPT || 'DirectBcryptTest123!',
  REPORT_TEST_PASSWORD: process.env.TEST_PASSWORD_REPORT || 'ReportTest123!',
  SECURE_TEST_PASSWORD: process.env.TEST_PASSWORD_SECURE || 'SecureTestPassword123!',

  // Pre-hashed password for testing (using bcrypt with known salt)
  HASHED_PASSWORD_EXAMPLE: process.env.TEST_HASHED_PASSWORD || '$2b$12$W/6WPGC5/e.M2vtQEpusM.0ltMcd1DeZUzqQ5LxJ.W7iRsyp0zZNm',
  HASHED_PASSWORD_ALT: process.env.TEST_HASHED_PASSWORD_ALT || '$2b$12$hashedPasswordExample.hash.here.example',
} as const;

/**
 * Generate a test password with optional prefix for uniqueness
 */
export function generateTestPassword(prefix = 'Test'): string {
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}Password${timestamp}!`;
}

/**
 * Get a random test password from the available constants
 */
export function getRandomTestPassword(): string {
  const passwords = [
    TestPasswordConstants.VALID_PASSWORD,
    TestPasswordConstants.STRONG_PASSWORD,
    TestPasswordConstants.AUTH_TEST_PASSWORD,
    TestPasswordConstants.SECURITY_COMPLIANT_PASSWORD,
  ];
  return passwords[Math.floor(Math.random() * passwords.length)];
}