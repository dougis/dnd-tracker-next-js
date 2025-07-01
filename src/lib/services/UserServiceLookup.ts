import User from '../models/User';
import {
  UserNotFoundError,
  TokenInvalidError,
  ServiceResult,
} from './UserServiceErrors';
import { UserServiceResponseHelpers } from './UserServiceResponseHelpers';

/**
 * User lookup utilities for UserService
 * Centralizes all user finding operations with consistent error handling
 */
export class UserServiceLookup {
  /**
   * Find user by ID and return standardized error if not found
   */
  static async findUserOrError(userId: string): Promise<ServiceResult<any>> {
    const user = await User.findById(userId);
    if (!user) {
      return UserServiceResponseHelpers.createErrorResponse(
        new UserNotFoundError(userId)
      );
    }
    return UserServiceResponseHelpers.createSuccessResponse(user);
  }

  /**
   * Find user by ID or throw UserNotFoundError
   */
  static async findUserByIdOrThrow(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }
    return user;
  }

  /**
   * Find user by email or throw UserNotFoundError
   */
  static async findUserByEmailOrThrow(email: string): Promise<any> {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError(email);
    }
    return user;
  }

  /**
   * Find user by email (nullable return for security operations)
   */
  static async findUserByEmailNullable(email: string): Promise<any | null> {
    return await User.findByEmail(email);
  }

  /**
   * Find user by password reset token or throw TokenInvalidError
   */
  static async findUserByResetTokenOrThrow(token: string): Promise<any> {
    const user = await User.findByResetToken(token);
    if (!user) {
      throw new TokenInvalidError('Password reset');
    }
    return user;
  }

  /**
   * Find user by email verification token or throw TokenInvalidError
   */
  static async findUserByVerificationTokenOrThrow(token: string): Promise<any> {
    const user = await User.findByVerificationToken(token);
    if (!user) {
      throw new TokenInvalidError('Email verification');
    }
    return user;
  }

  /**
   * Check if user exists and return boolean
   */
  static async userExists(userId: string): Promise<boolean> {
    try {
      await this.findUserByIdOrThrow(userId);
      return true;
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Check if email exists and return boolean
   */
  static async emailExists(email: string): Promise<boolean> {
    try {
      await this.findUserByEmailOrThrow(email);
      return true;
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return false;
      }
      throw error;
    }
  }
}
