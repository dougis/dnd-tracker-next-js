import { User } from '../models/User';
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
  type PublicUser,
  type SubscriptionTier,
} from '../validations/user';

/**
 * User Service Layer for D&D Encounter Tracker
 *
 * Provides business logic for user management, authentication,
 * and account operations. Abstracts database operations from
 * API routes and provides consistent error handling.
 */

// Custom error classes for better error handling
export class UserServiceError extends Error {
  public code: string;
  public statusCode: number;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.name = 'UserServiceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class UserNotFoundError extends UserServiceError {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`, 'USER_NOT_FOUND', 404);
  }
}

export class UserAlreadyExistsError extends UserServiceError {
  constructor(field: string, value: string) {
    super(
      `User already exists with ${field}: ${value}`,
      'USER_ALREADY_EXISTS',
      409
    );
  }
}

export class InvalidCredentialsError extends UserServiceError {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }
}

export class TokenExpiredError extends UserServiceError {
  constructor(tokenType: string) {
    super(`${tokenType} token has expired`, 'TOKEN_EXPIRED', 410);
  }
}

export class TokenInvalidError extends UserServiceError {
  constructor(tokenType: string) {
    super(`Invalid ${tokenType} token`, 'TOKEN_INVALID', 400);
  }
}

// Service response types
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    statusCode: number;
  };
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserStats {
  totalUsers: number;
  verifiedUsers: number;
  activeUsers: number;
  subscriptionBreakdown: Record<SubscriptionTier, number>;
}

export class UserService {
  /**
   * Create a new user account
   */
  static async createUser(
    userData: UserRegistration
  ): Promise<ServiceResult<PublicUser>> {
    try {
      // Validate input data
      const validatedData = userRegistrationSchema.parse(userData);

      // Check if user already exists
      const existingUserByEmail = await User.findByEmail(validatedData.email);
      if (existingUserByEmail) {
        throw new UserAlreadyExistsError('email', validatedData.email);
      }

      const existingUserByUsername = await User.findByUsername(
        validatedData.username
      );
      if (existingUserByUsername) {
        throw new UserAlreadyExistsError('username', validatedData.username);
      }

      // Create new user
      const newUser = new User({
        email: validatedData.email,
        username: validatedData.username,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        passwordHash: validatedData.password, // Will be hashed by middleware
        role: 'user',
        subscriptionTier: 'free',
        isEmailVerified: false,
      });

      // Generate email verification token
      newUser.generateEmailVerificationToken();

      await newUser.save();

      return {
        success: true,
        data: newUser.toPublicJSON(),
      };
    } catch (error) {
      if (error instanceof UserServiceError) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
          },
        };
      }

      // Handle validation errors
      if (error instanceof Error && error.message.includes('validation')) {
        return {
          success: false,
          error: {
            message: 'Invalid user data provided',
            code: 'VALIDATION_ERROR',
            statusCode: 400,
          },
        };
      }

      // Handle duplicate key errors from MongoDB
      if (error instanceof Error && 'code' in error && error.code === 11000) {
        const field = error.message.includes('email') ? 'email' : 'username';
        return {
          success: false,
          error: {
            message: `User already exists with this ${field}`,
            code: 'USER_ALREADY_EXISTS',
            statusCode: 409,
          },
        };
      }

      return {
        success: false,
        error: {
          message: 'Failed to create user',
          code: 'USER_CREATION_FAILED',
          statusCode: 500,
        },
      };
    }
  }

  /**
   * Authenticate user login
   */
  static async authenticateUser(
    loginData: UserLogin
  ): Promise<
    ServiceResult<{ user: PublicUser; requiresVerification: boolean }>
  > {
    try {
      // Validate input data
      const validatedData = userLoginSchema.parse(loginData);

      // Find user by email
      const user = await User.findByEmail(validatedData.email);
      if (!user) {
        throw new InvalidCredentialsError();
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(
        validatedData.password
      );
      if (!isPasswordValid) {
        throw new InvalidCredentialsError();
      }

      // Update last login timestamp
      await user.updateLastLogin();

      return {
        success: true,
        data: {
          user: user.toPublicJSON(),
          requiresVerification: !user.isEmailVerified,
        },
      };
    } catch (error) {
      if (error instanceof UserServiceError) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
          },
        };
      }

      return {
        success: false,
        error: {
          message: 'Authentication failed',
          code: 'AUTHENTICATION_FAILED',
          statusCode: 401,
        },
      };
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<ServiceResult<PublicUser>> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new UserNotFoundError(userId);
      }

      return {
        success: true,
        data: user.toPublicJSON(),
      };
    } catch (error) {
      if (error instanceof UserServiceError) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
          },
        };
      }

      return {
        success: false,
        error: {
          message: 'Failed to retrieve user',
          code: 'USER_RETRIEVAL_FAILED',
          statusCode: 500,
        },
      };
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(
    email: string
  ): Promise<ServiceResult<PublicUser>> {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        throw new UserNotFoundError(email);
      }

      return {
        success: true,
        data: user.toPublicJSON(),
      };
    } catch (error) {
      if (error instanceof UserServiceError) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
          },
        };
      }

      return {
        success: false,
        error: {
          message: 'Failed to retrieve user',
          code: 'USER_RETRIEVAL_FAILED',
          statusCode: 500,
        },
      };
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
      const validatedData = userProfileUpdateSchema.parse(updateData);

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        throw new UserNotFoundError(userId);
      }

      // Check for conflicts if email or username is being updated
      if (validatedData.email && validatedData.email !== user.email) {
        const existingUser = await User.findByEmail(validatedData.email);
        if (existingUser && existingUser._id.toString() !== userId) {
          throw new UserAlreadyExistsError('email', validatedData.email);
        }
      }

      if (validatedData.username && validatedData.username !== user.username) {
        const existingUser = await User.findByUsername(validatedData.username);
        if (existingUser && existingUser._id.toString() !== userId) {
          throw new UserAlreadyExistsError('username', validatedData.username);
        }
      }

      // Update user fields
      Object.assign(user, validatedData);
      await user.save();

      return {
        success: true,
        data: user.toPublicJSON(),
      };
    } catch (error) {
      if (error instanceof UserServiceError) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
          },
        };
      }

      return {
        success: false,
        error: {
          message: 'Failed to update user profile',
          code: 'PROFILE_UPDATE_FAILED',
          statusCode: 500,
        },
      };
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    passwordData: ChangePassword
  ): Promise<ServiceResult<void>> {
    try {
      // Validate input data
      const validatedData = changePasswordSchema.parse(passwordData);

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        throw new UserNotFoundError(userId);
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(
        validatedData.currentPassword
      );
      if (!isCurrentPasswordValid) {
        throw new UserServiceError(
          'Current password is incorrect',
          'INVALID_CURRENT_PASSWORD',
          400
        );
      }

      // Update password
      user.passwordHash = validatedData.newPassword; // Will be hashed by middleware
      await user.save();

      return {
        success: true,
      };
    } catch (error) {
      if (error instanceof UserServiceError) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
          },
        };
      }

      return {
        success: false,
        error: {
          message: 'Failed to change password',
          code: 'PASSWORD_CHANGE_FAILED',
          statusCode: 500,
        },
      };
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(
    resetData: PasswordResetRequest
  ): Promise<ServiceResult<{ token: string }>> {
    try {
      // Validate input data
      const validatedData = passwordResetRequestSchema.parse(resetData);

      // Find user by email
      const user = await User.findByEmail(validatedData.email);
      if (!user) {
        // For security, don't reveal that the email doesn't exist
        return {
          success: true,
          data: { token: 'dummy-token' },
        };
      }

      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      return {
        success: true,
        data: { token: resetToken },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to process password reset request',
          code: 'PASSWORD_RESET_REQUEST_FAILED',
          statusCode: 500,
        },
      };
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(
    resetData: PasswordReset
  ): Promise<ServiceResult<void>> {
    try {
      // Validate input data
      const validatedData = passwordResetSchema.parse(resetData);

      // Find user by reset token
      const user = await User.findByResetToken(validatedData.token);
      if (!user) {
        throw new TokenInvalidError('Password reset');
      }

      // Reset password and clear token
      user.passwordHash = validatedData.password; // Will be hashed by middleware
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return {
        success: true,
      };
    } catch (error) {
      if (error instanceof UserServiceError) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
          },
        };
      }

      return {
        success: false,
        error: {
          message: 'Failed to reset password',
          code: 'PASSWORD_RESET_FAILED',
          statusCode: 500,
        },
      };
    }
  }

  /**
   * Verify email address
   */
  static async verifyEmail(
    verificationData: EmailVerification
  ): Promise<ServiceResult<PublicUser>> {
    try {
      // Validate input data
      const validatedData = emailVerificationSchema.parse(verificationData);

      // Find user by verification token
      const user = await User.findByVerificationToken(validatedData.token);
      if (!user) {
        throw new TokenInvalidError('Email verification');
      }

      // Mark email as verified and clear token
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();

      return {
        success: true,
        data: user.toPublicJSON(),
      };
    } catch (error) {
      if (error instanceof UserServiceError) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
          },
        };
      }

      return {
        success: false,
        error: {
          message: 'Failed to verify email',
          code: 'EMAIL_VERIFICATION_FAILED',
          statusCode: 500,
        },
      };
    }
  }

  /**
   * Get paginated list of users (admin only)
   */
  static async getUsers(
    page: number = 1,
    limit: number = 20,
    filters?: {
      role?: string;
      subscriptionTier?: string;
      isEmailVerified?: boolean;
    }
  ): Promise<ServiceResult<PaginatedResult<PublicUser>>> {
    try {
      const skip = (page - 1) * limit;
      const query = filters ? { ...filters } : {};

      const [users, total] = await Promise.all([
        User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        User.countDocuments(query),
      ]);

      const publicUsers = users.map(user => {
        // Convert to public format manually since we're using lean()
        const {
          passwordHash: _passwordHash,
          emailVerificationToken: _emailVerificationToken,
          passwordResetToken: _passwordResetToken,
          passwordResetExpires: _passwordResetExpires,
          ...publicUser
        } = user;
        return publicUser as PublicUser;
      });

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          data: publicUsers,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to retrieve users',
          code: 'USERS_RETRIEVAL_FAILED',
          statusCode: 500,
        },
      };
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
      const user = await User.findById(userId);
      if (!user) {
        throw new UserNotFoundError(userId);
      }

      user.subscriptionTier = newTier;
      await user.save();

      return {
        success: true,
        data: user.toPublicJSON(),
      };
    } catch (error) {
      if (error instanceof UserServiceError) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
          },
        };
      }

      return {
        success: false,
        error: {
          message: 'Failed to update subscription',
          code: 'SUBSCRIPTION_UPDATE_FAILED',
          statusCode: 500,
        },
      };
    }
  }

  /**
   * Delete user account
   */
  static async deleteUser(userId: string): Promise<ServiceResult<void>> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new UserNotFoundError(userId);
      }

      await User.findByIdAndDelete(userId);

      return {
        success: true,
      };
    } catch (error) {
      if (error instanceof UserServiceError) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
          },
        };
      }

      return {
        success: false,
        error: {
          message: 'Failed to delete user',
          code: 'USER_DELETION_FAILED',
          statusCode: 500,
        },
      };
    }
  }

  /**
   * Get user statistics (admin only)
   */
  static async getUserStats(): Promise<ServiceResult<UserStats>> {
    try {
      const [totalUsers, verifiedUsers, activeUsers, subscriptionStats] =
        await Promise.all([
          User.countDocuments(),
          User.countDocuments({ isEmailVerified: true }),
          User.countDocuments({
            lastLoginAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            }, // Last 30 days
          }),
          User.aggregate([
            {
              $group: {
                _id: '$subscriptionTier',
                count: { $sum: 1 },
              },
            },
          ]),
        ]);

      const subscriptionBreakdown = subscriptionStats.reduce(
        (acc, stat) => {
          acc[stat._id as SubscriptionTier] = stat.count;
          return acc;
        },
        {
          free: 0,
          seasoned: 0,
          expert: 0,
          master: 0,
          guild: 0,
        } as Record<SubscriptionTier, number>
      );

      return {
        success: true,
        data: {
          totalUsers,
          verifiedUsers,
          activeUsers,
          subscriptionBreakdown,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to retrieve user statistics',
          code: 'USER_STATS_FAILED',
          statusCode: 500,
        },
      };
    }
  }
}
