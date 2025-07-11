import bcrypt from 'bcryptjs';

/**
 * Password Security Utilities
 *
 * Provides centralized password hashing and validation utilities
 * to ensure consistent security practices across the application.
 */

/**
 * Validate password input before hashing
 * @param plainPassword - The password to validate
 * @throws Error if validation fails
 */
function validatePasswordInput(plainPassword: string): void {
  if (typeof plainPassword !== 'string') {
    throw new Error('Password must be a string');
  }

  if (plainPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  if (plainPassword.length > 1000) {
    throw new Error('Password is too long');
  }

  if (isPasswordHashed(plainPassword)) {
    throw new Error('Password appears to be already hashed');
  }
}

/**
 * Hash a password using bcrypt with secure defaults
 * @param plainPassword - The plaintext password to hash
 * @returns Promise<string> - The hashed password
 * @throws Error if hashing fails or password is invalid
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  validatePasswordInput(plainPassword);

  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    if (!isPasswordHashed(hashedPassword)) {
      throw new Error('CRITICAL: Password hashing failed verification');
    }

    return hashedPassword;
  } catch (error) {
    if (error instanceof Error && error.message.includes('CRITICAL')) {
      throw error;
    }
    if (error instanceof Error) {
      throw new Error(`Password hashing failed: ${error.message}`);
    }
    throw new Error('Password hashing failed with unknown error');
  }
}

/**
 * Compare a plaintext password with a hashed password
 * @param plainPassword - The plaintext password to verify
 * @param hashedPassword - The hashed password to compare against
 * @returns Promise<boolean> - True if passwords match, false otherwise
 * @throws Error if comparison fails
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  // Validate inputs
  if (typeof plainPassword !== 'string' || typeof hashedPassword !== 'string') {
    throw new Error('Both password and hash must be strings');
  }

  if (!isPasswordHashed(hashedPassword)) {
    throw new Error('SECURITY ERROR: Attempting to compare with unhashed password');
  }

  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Password comparison failed: ${error.message}`);
    }
    throw new Error('Password comparison failed with unknown error');
  }
}

/**
 * Check if a string appears to be a bcrypt hashed password
 * @param password - The string to check
 * @returns boolean - True if it looks like a bcrypt hash
 */
export function isPasswordHashed(password: string): boolean {
  if (typeof password !== 'string') {
    return false;
  }

  // bcrypt hashes start with $2a$, $2b$, or $2y$ followed by cost and salt+hash
  // Total length is 60 characters: $2X$NN$ (7 chars) + salt+hash (53 chars)
  const bcryptPattern = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
  return bcryptPattern.test(password) && password.length === 60;
}

/**
 * Check password character criteria
 * @param password - The password to check
 * @returns Array of boolean values for character criteria
 */
function checkPasswordCriteria(password: string): {
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumbers: boolean;
  hasSpecialChars: boolean;
  criteriaCount: number;
} {
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return {
    hasLowercase,
    hasUppercase,
    hasNumbers,
    hasSpecialChars,
    criteriaCount: [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars].filter(Boolean).length,
  };
}

/**
 * Determine password strength based on criteria
 * @param password - The password to evaluate
 * @param criteriaCount - Number of character criteria met
 * @returns Password strength level
 */
function determinePasswordStrength(password: string, criteriaCount: number): 'weak' | 'medium' | 'strong' {
  if (password.length >= 12 && criteriaCount >= 4) {
    return 'strong';
  } else if (password.length >= 8 && criteriaCount >= 3) {
    return 'medium';
  }
  return 'weak';
}

/**
 * Add character requirement errors for non-strong passwords
 * @param errors - Error array to populate
 * @param criteria - Character criteria object
 * @param strength - Password strength level
 */
function addCharacterErrors(
  errors: string[],
  criteria: ReturnType<typeof checkPasswordCriteria>,
  strength: 'weak' | 'medium' | 'strong'
): void {
  if (strength === 'strong') return;

  if (!criteria.hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!criteria.hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!criteria.hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!criteria.hasSpecialChars) {
    errors.push('Password must contain at least one special character');
  }
}

/**
 * Validate password strength requirements
 * @param password - The password to validate
 * @returns Object with validation results
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];

  if (typeof password !== 'string') {
    errors.push('Password must be a string');
    return { isValid: false, errors, strength: 'weak' };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 1000) {
    errors.push('Password is too long');
  }

  const criteria = checkPasswordCriteria(password);
  const strength = determinePasswordStrength(password, criteria.criteriaCount);
  addCharacterErrors(errors, criteria, strength);

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Security audit: Detect if any passwords in an array are stored as plaintext
 * This is for testing and security auditing purposes
 * @param passwords - Array of password strings to check
 * @returns Object with audit results
 */
export function auditPasswordSecurity(passwords: string[]): {
  totalPasswords: number;
  hashedPasswords: number;
  plaintextPasswords: number;
  suspiciousPasswords: string[];
} {
  const suspiciousPasswords: string[] = [];
  let hashedCount = 0;
  let plaintextCount = 0;

  for (const password of passwords) {
    if (isPasswordHashed(password)) {
      hashedCount++;
    } else {
      plaintextCount++;
      // Don't log the actual password for security
      suspiciousPasswords.push(`[${password.length} chars, starts with "${password.substring(0, 3)}..."]`);
    }
  }

  return {
    totalPasswords: passwords.length,
    hashedPasswords: hashedCount,
    plaintextPasswords: plaintextCount,
    suspiciousPasswords,
  };
}