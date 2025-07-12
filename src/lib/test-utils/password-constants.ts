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
  
  // Common test passwords for various scenarios
  PASSWORD_123: process.env.TEST_PASSWORD_123 || 'Password123!',
  OLD_PASSWORD: process.env.TEST_OLD_PASSWORD || 'OldPassword123!',
  WRONG_PASSWORD: process.env.TEST_WRONG_PASSWORD || 'WrongPassword123!',
  DIFFERENT_PASSWORD: process.env.TEST_DIFFERENT_PASSWORD || 'DifferentPassword123!',
  SAME_PASSWORD: process.env.TEST_SAME_PASSWORD || 'SamePassword123!',
  VALID_ALT_PASSWORD: process.env.TEST_VALID_ALT_PASSWORD || 'ValidPassword123!',
  ANOTHER_PASSWORD: process.env.TEST_ANOTHER_PASSWORD || 'AnotherPassword456!',
  SECOND_PASSWORD: process.env.TEST_SECOND_PASSWORD || 'AnotherSecurePassword456!',
  THIRD_PASSWORD: process.env.TEST_THIRD_PASSWORD || 'ThirdPassword789!',
  SIMPLE_PASSWORD: process.env.TEST_SIMPLE_PASSWORD || 'SimplePassword789!',
  
  // Special passwords with extra complexity
  SPECIAL_CHARS_PASSWORD: process.env.TEST_SPECIAL_PASSWORD || 'P@ssw0rd!@#',
  MY_STRONG_PASSWORD: process.env.TEST_MY_STRONG_PASSWORD || 'MyStr0ng@Pass',
  COMPLEXITY_PASSWORD: process.env.TEST_COMPLEXITY_PASSWORD || 'Complex1ty$',
  
  // Pre-hashed password for testing (using bcrypt with known salt)
  HASHED_PASSWORD_EXAMPLE: process.env.TEST_HASHED_PASSWORD || '$2b$12$W/6WPGC5/e.M2vtQEpusM.0ltMcd1DeZUzqQ5LxJ.W7iRsyp0zZNm',
  HASHED_PASSWORD_ALT: process.env.TEST_HASHED_PASSWORD_ALT || '$2b$12$hashedPasswordExample.hash.here.example',
  HASHED_PASSWORD_SIMPLE: process.env.TEST_HASHED_PASSWORD_SIMPLE || '$2b$12$hashedpassword',
  
  // Simple passwords for weak validation tests
  SIMPLE_WEAK: process.env.TEST_PASSWORD_SIMPLE_WEAK || 'password',
  WEAK_123: process.env.TEST_PASSWORD_WEAK_123 || 'password123',
  PLAIN_TEXT: process.env.TEST_PASSWORD_PLAIN || 'plaintext',
  PLAINPASSWORD: process.env.TEST_PASSWORD_PLAINPASSWORD || 'plainpassword',
  CORRECT_PASSWORD: process.env.TEST_PASSWORD_CORRECT || 'correctpassword',
  WRONG_SIMPLE: process.env.TEST_PASSWORD_WRONG_SIMPLE || 'wrongpassword',
  SECURE_SIMPLE: process.env.TEST_PASSWORD_SECURE_SIMPLE || 'securepassword123',
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

/**
 * Create mock password data for testing APIs
 */
export function createMockPasswordData(overrides?: Partial<{
  password: string;
  confirmPassword: string;
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}>) {
  return {
    password: TestPasswordConstants.PASSWORD_123,
    confirmPassword: TestPasswordConstants.PASSWORD_123,
    ...overrides,
  };
}

/**
 * Create mock change password data for testing
 */
export function createMockChangePasswordData(overrides?: Partial<{
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}>) {
  return {
    currentPassword: TestPasswordConstants.OLD_PASSWORD,
    newPassword: TestPasswordConstants.NEW_PASSWORD,
    confirmNewPassword: TestPasswordConstants.NEW_PASSWORD,
    ...overrides,
  };
}

/**
 * Create mock reset password data for testing
 */
export function createMockResetPasswordData(overrides?: Partial<{
  token: string;
  password: string;
  confirmPassword: string;
}>) {
  return {
    token: 'mock-reset-token',
    password: TestPasswordConstants.NEW_PASSWORD,
    confirmPassword: TestPasswordConstants.NEW_PASSWORD,
    ...overrides,
  };
}