import User from '../models/User';
import { ServiceResult, UserAlreadyExistsError } from './UserServiceErrors';
import {
  type UserProfileUpdate,
  type PublicUser,
  type SubscriptionTier,
} from '../validations/user';
import { checkProfileUpdateConflicts } from './UserServiceHelpers';
import { UserServiceValidation } from './UserServiceValidation';
import { UserServiceResponseHelpers } from './UserServiceResponseHelpers';
import { UserServiceDatabase } from './UserServiceDatabase';
import { UserServiceLookup } from './UserServiceLookup';

/**
 * Profile management operations for UserService
 * Handles user profile retrieval, updates, subscription management, and account deletion
 */
export class UserServiceProfile {

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<ServiceResult<PublicUser>> {
    try {
      const userResult = await UserServiceLookup.findUserOrError(userId);
      if (!userResult.success) {
        return userResult;
      }

      return UserServiceResponseHelpers.createSuccessResponse(
        UserServiceResponseHelpers.safeToPublicJSON(userResult.data)
      );
    } catch (error) {
      try {
        return UserServiceResponseHelpers.handleValidationError(error);
      } catch {
        return UserServiceResponseHelpers.handleCustomError(
          error,
          'User not found',
          'USER_NOT_FOUND',
          404
        );
      }
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(
    email: string
  ): Promise<ServiceResult<PublicUser>> {
    try {
      const user = await UserServiceLookup.findUserByEmailOrThrow(email);

      return UserServiceResponseHelpers.createSuccessResponse(
        UserServiceResponseHelpers.safeToPublicJSON(user)
      );
    } catch (error) {
      return UserServiceResponseHelpers.handleCustomError(
        error,
        'Failed to retrieve user',
        'USER_RETRIEVAL_FAILED'
      );
    }
  }

  /**
   * Find user by ID for profile operations
   */
  private static async findUserForProfileUpdate(
    userId: string
  ): Promise<ServiceResult<any>> {
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        error: {
          message: `User not found: ${userId}`,
          code: 'USER_NOT_FOUND',
          statusCode: 404,
        },
      };
    }
    return UserServiceResponseHelpers.createSuccessResponse(user);
  }

  /**
   * Handle profile update conflict checking
   */
  private static async handleProfileUpdateConflicts(
    user: any,
    validatedData: UserProfileUpdate
  ): Promise<ServiceResult<void> | null> {
    const { emailToCheck, usernameToCheck } =
      UserServiceValidation.prepareConflictCheckParams(user, validatedData);

    if (!emailToCheck && !usernameToCheck) {
      return null; // No conflicts to check
    }

    try {
      if (user._id) {
        const userIdString = UserServiceValidation.extractUserIdString(user);
        await checkProfileUpdateConflicts(
          userIdString,
          emailToCheck,
          usernameToCheck
        );
      }
      return null; // No conflicts found
    } catch (conflictError) {
      if (conflictError instanceof UserAlreadyExistsError) {
        return UserServiceResponseHelpers.createErrorResponse(conflictError);
      }
      throw conflictError;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string,
    updateData: UserProfileUpdate
  ): Promise<ServiceResult<PublicUser>> {
    try {
      // Validate input data
      const validatedData =
        UserServiceValidation.validateAndParseProfileUpdate(updateData);

      // Find user
      const userResult = await this.findUserForProfileUpdate(userId);
      if (!userResult.success) {
        return userResult;
      }
      const user = userResult.data;

      // Check for conflicts
      const conflictResult = await this.handleProfileUpdateConflicts(
        user,
        validatedData
      );
      if (conflictResult) {
        return conflictResult as ServiceResult<PublicUser>;
      }

      // Update user fields and save
      await UserServiceDatabase.updateUserFieldsAndSave(user, validatedData);

      return UserServiceResponseHelpers.createSuccessResponse(
        UserServiceResponseHelpers.safeToPublicJSON(user)
      );
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        return UserServiceResponseHelpers.createErrorResponse(error);
      }

      return UserServiceResponseHelpers.handleCustomError(
        error,
        'Failed to update user profile',
        'PROFILE_UPDATE_FAILED'
      );
    }
  }

  /**
   * Update user subscription tier
   */
  static async updateSubscription(
    userId: string,
    newTier: SubscriptionTier
  ): Promise<ServiceResult<PublicUser>> {
    try {
      const userResult = await UserServiceLookup.findUserOrError(userId);
      if (!userResult.success) {
        return userResult;
      }

      const user = userResult.data;
      await UserServiceDatabase.updateUserFieldsAndSave(user, {
        subscriptionTier: newTier,
      });

      return UserServiceResponseHelpers.createSuccessResponse(
        UserServiceResponseHelpers.safeToPublicJSON(user)
      );
    } catch (error) {
      return UserServiceResponseHelpers.handleCustomError(
        error,
        'Failed to update subscription',
        'SUBSCRIPTION_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete user account
   */
  static async deleteUser(userId: string): Promise<ServiceResult<void>> {
    try {
      // First check if user exists
      const userResult = await UserServiceLookup.findUserOrError(userId);
      if (!userResult.success) {
        return userResult;
      }

      // Now delete the user
      await User.findByIdAndDelete(userId);

      return UserServiceResponseHelpers.createSuccessResponse();
    } catch (error) {
      return UserServiceResponseHelpers.handleCustomError(
        error,
        'Failed to delete user',
        'USER_DELETION_FAILED'
      );
    }
  }
}
