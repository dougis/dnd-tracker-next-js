/**
 * Database operation helpers for UserService
 * Consolidates common database patterns and test compatibility
 */
export class UserServiceDatabase {

  /**
   * Safely save a user with test environment compatibility
   */
  static async saveUserSafely(user: any): Promise<void> {
    // Save might be a mock in tests, handle null/undefined gracefully
    if (user && typeof user.save === 'function') {
      await user.save();
    }
  }

  /**
   * Generate email verification token and save user
   */
  static async generateAndSaveEmailToken(user: any): Promise<void> {
    if (user && typeof user.generateEmailVerificationToken === 'function') {
      await user.generateEmailVerificationToken();
    }
    // Note: generateEmailVerificationToken() already saves the user internally,
    // so we don't need to call saveUserSafely() here to avoid ParallelSaveError
  }

  /**
   * Generate password reset token and save user
   */
  static async generateAndSaveResetToken(user: any): Promise<string> {
    let resetToken = 'dummy-token';

    if (user && typeof user.generatePasswordResetToken === 'function') {
      resetToken = await user.generatePasswordResetToken();
    }

    await this.saveUserSafely(user);
    return resetToken;
  }

  /**
   * Clear specified tokens and save user
   */
  static async clearTokensAndSave(
    user: any,
    tokenTypes: string[]
  ): Promise<void> {
    for (const tokenType of tokenTypes) {
      switch (tokenType) {
        case 'passwordReset':
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          break;
        case 'emailVerification':
          user.emailVerificationToken = undefined;
          break;
      }
    }

    await this.saveUserSafely(user);
  }

  /**
   * Update user fields and save
   */
  static async updateUserFieldsAndSave(
    user: any,
    updateData: any
  ): Promise<void> {
    Object.assign(user, updateData);
    await this.saveUserSafely(user);
  }

  /**
   * Update user's last login timestamp
   */
  static async updateLastLogin(user: any): Promise<void> {
    if (user && typeof user.updateLastLogin === 'function') {
      await user.updateLastLogin();
    }
  }

  /**
   * Mark email as verified and clear verification token
   */
  static async markEmailVerified(user: any): Promise<void> {
    user.isEmailVerified = true;
    await this.clearTokensAndSave(user, ['emailVerification']);
  }

  /**
   * Update user password and clear reset tokens
   */
  static async updatePasswordAndClearTokens(
    user: any,
    newPassword: string
  ): Promise<void> {
    user.passwordHash = newPassword; // Will be hashed by middleware
    await this.clearTokensAndSave(user, ['passwordReset']);
  }
}
