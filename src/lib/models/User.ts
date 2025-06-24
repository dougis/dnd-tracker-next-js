import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  userSchema,
  publicUserSchema,
  type User as UserType,
  type PublicUser,
  type SubscriptionTier,
  type UserRole,
  type UserPreferences,
} from '../validations/user';

/**
 * User Mongoose schema and model for D&D Encounter Tracker
 * Handles user authentication, subscription management, and preferences
 */

// Extend the User type with Mongoose Document methods
export interface IUser extends Omit<UserType, '_id'>, Document {
  _id: mongoose.Types.ObjectId;

  // Instance methods
  comparePassword(_candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): string;
  generateEmailVerificationToken(): string;
  toPublicJSON(): PublicUser;
  updateLastLogin(): Promise<IUser>;
  isSubscriptionActive(): boolean;
  canAccessFeature(_feature: string): boolean;
}

// Static methods interface
export interface IUserModel extends Model<IUser> {
  findByEmail(_email: string): Promise<IUser | null>;
  findByUsername(_username: string): Promise<IUser | null>;
  findByResetToken(_token: string): Promise<IUser | null>;
  findByVerificationToken(_token: string): Promise<IUser | null>;
  createUser(_userData: Partial<UserType>): Promise<IUser>;
  validateUser(_userData: unknown): Promise<UserType>;
}

// User preferences sub-schema
const userPreferencesSubSchema = new Schema(
  {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    browserNotifications: {
      type: Boolean,
      default: false,
    },
    timezone: {
      type: String,
      default: 'UTC',
      validate: {
        validator: function (v: string) {
          // Basic timezone validation - could be enhanced with a full list
          return /^[A-Za-z_\/\-+]+$/.test(v);
        },
        message: 'Invalid timezone format',
      },
    },
    language: {
      type: String,
      default: 'en',
      minlength: 2,
      maxlength: 5,
    },
    diceRollAnimations: {
      type: Boolean,
      default: true,
    },
    autoSaveEncounters: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

// Main User schema
const userSchemaDefinition = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      validate: {
        validator: function (v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address',
      },
      index: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      validate: {
        validator: function (v: string) {
          return /^[a-zA-Z0-9_-]+$/.test(v);
        },
        message:
          'Username can only contain letters, numbers, underscores, and hyphens',
      },
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: 100,
      validate: {
        validator: function (v: string) {
          return /^[a-zA-Z\s'-]+$/.test(v);
        },
        message:
          'First name can only contain letters, spaces, apostrophes, and hyphens',
      },
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: 100,
      validate: {
        validator: function (v: string) {
          return /^[a-zA-Z\s'-]+$/.test(v);
        },
        message:
          'Last name can only contain letters, spaces, apostrophes, and hyphens',
      },
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      minlength: 1,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    subscriptionTier: {
      type: String,
      enum: ['free', 'seasoned', 'expert', 'master', 'guild'],
      default: 'free',
      index: true,
    },
    preferences: {
      type: userPreferencesSubSchema,
      default: () => ({}),
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailVerificationToken: {
      type: String,
      sparse: true, // Only index non-null values
    },
    passwordResetToken: {
      type: String,
      sparse: true, // Only index non-null values
    },
    passwordResetExpires: {
      type: Date,
      sparse: true,
    },
    lastLoginAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: {
      transform: function (doc, ret) {
        // Remove sensitive fields from JSON output
        delete ret.passwordHash;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        // Remove sensitive fields from object output
        delete ret.passwordHash;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      },
    },
  }
);

// Indexes for better query performance
userSchemaDefinition.index({ email: 1 });
userSchemaDefinition.index({ username: 1 });
userSchemaDefinition.index({ role: 1 });
userSchemaDefinition.index({ subscriptionTier: 1 });
userSchemaDefinition.index({ isEmailVerified: 1 });
userSchemaDefinition.index({ lastLoginAt: -1 });
userSchemaDefinition.index({ createdAt: -1 });
userSchemaDefinition.index({ emailVerificationToken: 1 }, { sparse: true });
userSchemaDefinition.index({ passwordResetToken: 1 }, { sparse: true });
userSchemaDefinition.index(
  { passwordResetExpires: 1 },
  { sparse: true, expireAfterSeconds: 0 }
);

// Instance methods
userSchemaDefinition.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    throw new Error('Error comparing password');
  }
};

userSchemaDefinition.methods.generatePasswordResetToken = function (): string {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = token;
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return token;
};

userSchemaDefinition.methods.generateEmailVerificationToken =
  function (): string {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    this.emailVerificationToken = token;

    return token;
  };

userSchemaDefinition.methods.toPublicJSON = function (): PublicUser {
  const userObject = this.toObject();

  // Validate and ensure the object matches the public schema
  const result = publicUserSchema.safeParse(userObject);

  if (!result.success) {
    throw new Error('Failed to convert user to public format');
  }

  return result.data;
};

userSchemaDefinition.methods.updateLastLogin =
  async function (): Promise<IUser> {
    this.lastLoginAt = new Date();
    return await this.save();
  };

userSchemaDefinition.methods.isSubscriptionActive = function (): boolean {
  // For now, all subscription tiers are considered active
  // This could be enhanced with actual subscription tracking
  return this.subscriptionTier !== 'free' || true;
};

userSchemaDefinition.methods.canAccessFeature = function (
  _feature: string
): boolean {
  const featureLimits = {
    free: {
      parties: 1,
      encounters: 3,
      creatures: 10,
    },
    seasoned: {
      parties: 3,
      encounters: 15,
      creatures: 50,
    },
    expert: {
      parties: 10,
      encounters: 50,
      creatures: 200,
    },
    master: {
      parties: 25,
      encounters: 100,
      creatures: 500,
    },
    guild: {
      parties: Infinity,
      encounters: Infinity,
      creatures: Infinity,
    },
  };

  const userLimits = featureLimits[this.subscriptionTier];

  // This is a basic implementation - would need to be enhanced
  // with actual feature checking logic
  return Boolean(userLimits);
};

// Static methods
userSchemaDefinition.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchemaDefinition.statics.findByUsername = function (username: string) {
  return this.findOne({ username: username.toLowerCase() });
};

userSchemaDefinition.statics.findByResetToken = function (token: string) {
  return this.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });
};

userSchemaDefinition.statics.findByVerificationToken = function (
  token: string
) {
  return this.findOne({ emailVerificationToken: token });
};

userSchemaDefinition.statics.createUser = async function (
  userData: Partial<UserType>
): Promise<IUser> {
  // Validate the data using Zod schema
  const validatedData = userSchema.parse(userData);

  // Create the user
  const user = new this(validatedData);
  return await user.save();
};

userSchemaDefinition.statics.validateUser = async function (
  userData: unknown
): Promise<UserType> {
  const result = userSchema.safeParse(userData);

  if (!result.success) {
    throw new Error(`User validation failed: ${result.error.message}`);
  }

  return result.data;
};

// Pre-save middleware
userSchemaDefinition.pre('save', async function (next) {
  // Only hash password if it's been modified (or is new)
  if (!this.isModified('passwordHash')) return next();

  try {
    // If passwordHash is a plain password, hash it
    if (this.passwordHash && !this.passwordHash.startsWith('$2a$')) {
      const saltRounds = 12;
      this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware for timestamps and lowercase fields
userSchemaDefinition.pre('save', function (next) {
  // Ensure email and username are lowercase
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  if (this.username) {
    this.username = this.username.toLowerCase();
  }

  next();
});

// Create and export the model
const User: IUserModel =
  mongoose.models.User ||
  mongoose.model<IUser, IUserModel>('User', userSchemaDefinition);

export default User;

// Export types for use in other files
export type {
  UserType,
  PublicUser,
  SubscriptionTier,
  UserRole,
  UserPreferences,
};
