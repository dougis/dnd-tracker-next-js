import {
  type UserRegistration,
  type UserLogin,
  type UserProfileUpdate,
  type ChangePassword,
  type PasswordResetRequest,
  type PasswordReset,
  type EmailVerification,
  type PublicUser,
  type SubscriptionTier,
} from '../validations/user';

import { ServiceResult } from './UserServiceErrors';
import { UserServiceAuth } from './UserServiceAuth';
import { UserServiceProfile } from './UserServiceProfile';
import {
  UserServiceStats,
  type PaginatedResult,
  type QueryFilters,
  type UserStats
} from './UserServiceStats';

/**
 * User Service Layer for D&D Encounter Tracker
 *
 * Provides business logic for user management, authentication,
 * and account operations. Abstracts database operations from
 * API routes and provides consistent error handling.
 *
 * This class acts as a coordination layer, delegating operations
 * to specialized modules for better organization and maintainability.
 */
export class UserService {
  // ================================
  // Authentication Operations
  // ================================

  /**
   * Create a new user account
   */
  static async createUser(
    userData: UserRegistration
  ): Promise<ServiceResult<PublicUser>> {
    return UserServiceAuth.createUser(userData);
  }

  /**
   * Authenticate user login
   */
  static async authenticateUser(
    loginData: UserLogin
  ): Promise<ServiceResult<{ user: PublicUser; requiresVerification: boolean }>> {
    return UserServiceAuth.authenticateUser(loginData);
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    passwordData: ChangePassword
  ): Promise<ServiceResult<void>> {
    return UserServiceAuth.changePassword(userId, passwordData);
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(
    resetData: PasswordResetRequest
  ): Promise<ServiceResult<{ token: string }>> {
    return UserServiceAuth.requestPasswordReset(resetData);
  }

  /**
   * Reset password with token
   */
  static async resetPassword(
    resetData: PasswordReset
  ): Promise<ServiceResult<void>> {
    return UserServiceAuth.resetPassword(resetData);
  }

  /**
   * Verify email address
   */
  static async verifyEmail(
    verificationData: EmailVerification
  ): Promise<ServiceResult<PublicUser>> {
    return UserServiceAuth.verifyEmail(verificationData);
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(
    email: string
  ): Promise<ServiceResult<void>> {
    return UserServiceAuth.resendVerificationEmail(email);
  }

  // ================================
  // Profile Management Operations
  // ================================

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<ServiceResult<PublicUser>> {
    return UserServiceProfile.getUserById(userId);
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<ServiceResult<PublicUser>> {
    return UserServiceProfile.getUserByEmail(email);
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string,
    updateData: UserProfileUpdate
  ): Promise<ServiceResult<PublicUser>> {
    return UserServiceProfile.updateUserProfile(userId, updateData);
  }

  /**
   * Update user subscription tier
   */
  static async updateSubscription(
    userId: string,
    newTier: SubscriptionTier
  ): Promise<ServiceResult<PublicUser>> {
    return UserServiceProfile.updateSubscription(userId, newTier);
  }

  /**
   * Delete user account
   */
  static async deleteUser(userId: string): Promise<ServiceResult<void>> {
    return UserServiceProfile.deleteUser(userId);
  }

  // ================================
  // Administrative Operations
  // ================================

  /**
   * Get paginated list of users (admin only)
   */
  static async getUsers(
    page: number = 1,
    limit: number = 20,
    filters?: QueryFilters
  ): Promise<ServiceResult<PaginatedResult<PublicUser>>> {
    return UserServiceStats.getUsers(page, limit, filters);
  }

  /**
   * Get user statistics (admin only)
   */
  static async getUserStats(): Promise<ServiceResult<UserStats>> {
    return UserServiceStats.getUserStats();
  }
}

// Re-export types for convenience
export type {
  PaginatedResult,
  UserStats,
  QueryFilters,
  PublicUser,
  SubscriptionTier,
  UserRegistration,
  UserLogin,
  UserProfileUpdate,
  ChangePassword,
  PasswordResetRequest,
  PasswordReset,
  EmailVerification,
};
