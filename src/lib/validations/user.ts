import { z } from 'zod';
import {
  emailSchema,
  passwordSchema,
  usernameSchema,
  nameSchema,
  objectIdSchema,
  dateSchema,
  createOptionalSchema,
  type InferSchemaType,
} from './base';

/**
 * User validation schemas for authentication and user management
 */

// Subscription tier validation
export const subscriptionTierSchema = z.enum(
  ['free', 'seasoned', 'expert', 'master', 'guild'],
  {
    errorMap: () => ({ message: 'Invalid subscription tier' }),
  }
);

// User role validation
export const userRoleSchema = z.enum(['user', 'admin'], {
  errorMap: () => ({ message: 'Invalid user role' }),
});

// User preferences schema
export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  emailNotifications: z.boolean().default(true),
  browserNotifications: z.boolean().default(false),
  timezone: z.string().default('UTC'),
  language: z.string().default('en'),
  diceRollAnimations: z.boolean().default(true),
  autoSaveEncounters: z.boolean().default(true),
});

// User registration schema
export const userRegistrationSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    username: usernameSchema,
    firstName: nameSchema,
    lastName: nameSchema,
    agreeToTerms: z
      .boolean()
      .refine(
        val => val === true,
        'You must agree to the terms and conditions'
      ),
    subscribeToNewsletter: z.boolean().default(false),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// User login schema
export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

// Password reset schema
export const passwordResetSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// User profile update schema
export const userProfileUpdateSchema = z.object({
  username: createOptionalSchema(usernameSchema),
  firstName: createOptionalSchema(nameSchema),
  lastName: createOptionalSchema(nameSchema),
  email: createOptionalSchema(emailSchema),
  preferences: createOptionalSchema(userPreferencesSchema),
});

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// Complete User schema (for database operations)
export const userSchema = z.object({
  _id: createOptionalSchema(objectIdSchema),
  email: emailSchema,
  username: usernameSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  passwordHash: z.string().min(1, 'Password hash is required'),
  role: userRoleSchema.default('user'),
  subscriptionTier: subscriptionTierSchema.default('free'),
  preferences: userPreferencesSchema.default({}),
  isEmailVerified: z.boolean().default(false),
  emailVerificationToken: createOptionalSchema(z.string()),
  passwordResetToken: createOptionalSchema(z.string()),
  passwordResetExpires: createOptionalSchema(dateSchema),
  lastLoginAt: createOptionalSchema(dateSchema),
  createdAt: dateSchema.default(() => new Date().toISOString()),
  updatedAt: dateSchema.default(() => new Date().toISOString()),
});

// Public user schema (for API responses)
export const publicUserSchema = userSchema
  .omit({
    passwordHash: true,
    emailVerificationToken: true,
    passwordResetToken: true,
    passwordResetExpires: true,
    _id: true,
  })
  .extend({
    id: objectIdSchema,
  });

// User session schema
export const userSessionSchema = z.object({
  id: objectIdSchema,
  email: emailSchema,
  username: usernameSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  role: userRoleSchema,
  subscriptionTier: subscriptionTierSchema,
  preferences: userPreferencesSchema,
  isEmailVerified: z.boolean(),
});

// API schemas
export const getUserByIdSchema = z.object({
  id: objectIdSchema,
});

export const getUserByEmailSchema = z.object({
  email: emailSchema,
});

export const getUserByUsernameSchema = z.object({
  username: usernameSchema,
});

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// Subscription management schemas
export const updateSubscriptionSchema = z.object({
  tier: subscriptionTierSchema,
  stripeCustomerId: createOptionalSchema(z.string()),
  stripeSubscriptionId: createOptionalSchema(z.string()),
});

// Admin user management schemas
export const adminUserUpdateSchema = z.object({
  role: createOptionalSchema(userRoleSchema),
  subscriptionTier: createOptionalSchema(subscriptionTierSchema),
  isEmailVerified: createOptionalSchema(z.boolean()),
  preferences: createOptionalSchema(userPreferencesSchema),
});

// Type exports
export type User = InferSchemaType<typeof userSchema>;
export type PublicUser = InferSchemaType<typeof publicUserSchema>;
export type UserSession = InferSchemaType<typeof userSessionSchema>;
export type UserRegistration = InferSchemaType<typeof userRegistrationSchema>;
export type UserLogin = InferSchemaType<typeof userLoginSchema>;
export type UserProfileUpdate = InferSchemaType<typeof userProfileUpdateSchema>;
export type PasswordReset = InferSchemaType<typeof passwordResetSchema>;
export type PasswordResetRequest = InferSchemaType<
  typeof passwordResetRequestSchema
>;
export type ChangePassword = InferSchemaType<typeof changePasswordSchema>;
export type UserPreferences = InferSchemaType<typeof userPreferencesSchema>;
export type SubscriptionTier = InferSchemaType<typeof subscriptionTierSchema>;
export type UserRole = InferSchemaType<typeof userRoleSchema>;
export type EmailVerification = InferSchemaType<typeof emailVerificationSchema>;
export type UpdateSubscription = InferSchemaType<
  typeof updateSubscriptionSchema
>;
export type AdminUserUpdate = InferSchemaType<typeof adminUserUpdateSchema>;
