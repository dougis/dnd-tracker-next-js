/**
 * Central export file for all Mongoose models in the D&D Encounter Tracker
 *
 * This file provides a single point of import for all database models
 * used throughout the application.
 */

// User model and types
export { default as User } from './User';
export type {
  IUser,
  IUserModel,
  UserType,
  PublicUser,
  SubscriptionTier,
  UserRole,
  UserPreferences,
} from './User';

// Re-export validation schemas for convenience
export {
  userSchema,
  publicUserSchema,
  userRegistrationSchema,
  userLoginSchema,
  userProfileUpdateSchema,
  changePasswordSchema,
  passwordResetSchema,
  passwordResetRequestSchema,
  userSessionSchema,
  subscriptionTierSchema,
  userRoleSchema,
  userPreferencesSchema,
} from '../validations/user';
