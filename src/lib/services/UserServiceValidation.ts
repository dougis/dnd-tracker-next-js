import {
  userRegistrationSchema,
  userLoginSchema,
  userProfileUpdateSchema,
  changePasswordSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  emailVerificationSchema,
  type UserRegistration,
  type UserLogin,
  type UserProfileUpdate,
  type ChangePassword,
  type PasswordResetRequest,
  type PasswordReset,
  type EmailVerification,
} from '../validations/user';

/**
 * Input validation helpers for UserService
 * Centralizes all validation logic and schema parsing
 */
export class UserServiceValidation {
  /**
   * Validate and parse user registration data
   */
  static validateAndParseRegistration(data: unknown): UserRegistration {
    return userRegistrationSchema.parse(data);
  }

  /**
   * Validate and parse user login data
   */
  static validateAndParseLogin(data: unknown): UserLogin {
    return userLoginSchema.parse(data);
  }

  /**
   * Validate and parse user profile update data
   */
  static validateAndParseProfileUpdate(data: unknown): UserProfileUpdate {
    return userProfileUpdateSchema.parse(data);
  }

  /**
   * Validate and parse password change data
   */
  static validateAndParsePasswordChange(data: unknown): ChangePassword {
    return changePasswordSchema.parse(data);
  }

  /**
   * Validate and parse password reset request data
   */
  static validateAndParsePasswordResetRequest(
    data: unknown
  ): PasswordResetRequest {
    return passwordResetRequestSchema.parse(data);
  }

  /**
   * Validate and parse password reset data
   */
  static validateAndParsePasswordReset(data: unknown): PasswordReset {
    return passwordResetSchema.parse(data);
  }

  /**
   * Validate and parse email verification data
   */
  static validateAndParseEmailVerification(data: unknown): EmailVerification {
    return emailVerificationSchema.parse(data);
  }

  /**
   * Check if two values are different (for profile update conflict detection)
   */
  static hasChanged(
    currentValue: string | undefined,
    newValue: string | undefined
  ): boolean {
    return newValue !== undefined && newValue !== currentValue;
  }

  /**
   * Prepare conflict check parameters for profile updates
   */
  static prepareConflictCheckParams(
    user: any,
    validatedData: UserProfileUpdate
  ): { emailToCheck?: string; usernameToCheck?: string } {
    const userEmail = user.email || '';
    const userUsername = user.username || '';

    const emailToCheck = this.hasChanged(userEmail, validatedData.email)
      ? validatedData.email
      : undefined;

    const usernameToCheck = this.hasChanged(
      userUsername,
      validatedData.username
    )
      ? validatedData.username
      : undefined;

    return { emailToCheck, usernameToCheck };
  }

  /**
   * Extract user ID as string for conflict checking
   */
  static extractUserIdString(user: any): string {
    if (user._id) {
      return typeof user._id.toString === 'function'
        ? user._id.toString()
        : String(user._id);
    }
    throw new Error('User ID not found');
  }
}
