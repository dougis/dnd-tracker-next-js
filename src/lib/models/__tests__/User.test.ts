/**
 * @jest-environment node
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User, { CreateUserInput } from '../User';

describe('User Model', () => {
  let mongoServer: MongoMemoryServer;

  // Set up in-memory MongoDB server
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  // Clean up after tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Clear database between tests
  afterEach(async () => {
    await User.deleteMany({});
  });

  // Valid user data for testing
  const validUserData: CreateUserInput = {
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    password: 'Password123!',
  };

  describe('User Schema Validation', () => {
    it('should create a valid user', async () => {
      const user = await User.createUser(validUserData);

      expect(user).toBeDefined();
      expect(user.email).toBe(validUserData.email);
      expect(user.username).toBe(validUserData.username);
      expect(user.firstName).toBe(validUserData.firstName);
      expect(user.lastName).toBe(validUserData.lastName);
      expect(user.passwordHash).toBeDefined();
      expect(user.passwordHash).not.toBe(validUserData.password); // Should be hashed
      expect(user.role).toBe('user'); // Default role
      expect(user.subscriptionTier).toBe('free'); // Default tier
      expect(user.isEmailVerified).toBe(false); // Default verification status
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should not create a user with duplicate email', async () => {
      await User.createUser(validUserData);

      await expect(
        User.createUser({
          ...validUserData,
          username: 'differentuser',
        })
      ).rejects.toThrow('Email already exists');
    });

    it('should not create a user with duplicate username', async () => {
      await User.createUser(validUserData);

      await expect(
        User.createUser({
          ...validUserData,
          email: 'different@example.com',
        })
      ).rejects.toThrow('Username already exists');
    });

    it('should convert email and username to lowercase', async () => {
      const userWithMixedCase = await User.createUser({
        ...validUserData,
        email: 'MixedCase@Example.com',
        username: 'MixedCaseUser',
      });

      expect(userWithMixedCase.email).toBe('mixedcase@example.com');
      expect(userWithMixedCase.username).toBe('mixedcaseuser');
    });

    it('should set default values for preferences', async () => {
      const user = await User.createUser(validUserData);

      expect(user.preferences).toBeDefined();
      expect(user.preferences.theme).toBe('system');
      expect(user.preferences.emailNotifications).toBe(true);
      expect(user.preferences.browserNotifications).toBe(false);
      expect(user.preferences.timezone).toBe('UTC');
      expect(user.preferences.language).toBe('en');
      expect(user.preferences.diceRollAnimations).toBe(true);
      expect(user.preferences.autoSaveEncounters).toBe(true);
    });

    it('should accept custom preferences', async () => {
      const userWithPreferences = await User.createUser({
        ...validUserData,
        preferences: {
          theme: 'dark',
          emailNotifications: false,
          browserNotifications: true,
          timezone: 'America/New_York',
          language: 'es',
          diceRollAnimations: false,
          autoSaveEncounters: false,
        },
      });

      expect(userWithPreferences.preferences.theme).toBe('dark');
      expect(userWithPreferences.preferences.emailNotifications).toBe(false);
      expect(userWithPreferences.preferences.browserNotifications).toBe(true);
      expect(userWithPreferences.preferences.timezone).toBe('America/New_York');
      expect(userWithPreferences.preferences.language).toBe('es');
      expect(userWithPreferences.preferences.diceRollAnimations).toBe(false);
      expect(userWithPreferences.preferences.autoSaveEncounters).toBe(false);
    });
  });

  describe('Static Methods', () => {
    it('should find user by email', async () => {
      const createdUser = await User.createUser(validUserData);
      const foundUser = await User.findByEmail(validUserData.email);

      expect(foundUser).toBeDefined();
      expect(foundUser?._id.toString()).toBe(createdUser._id.toString());
    });

    it('should find user by username', async () => {
      const createdUser = await User.createUser(validUserData);
      const foundUser = await User.findByUsername(validUserData.username);

      expect(foundUser).toBeDefined();
      expect(foundUser?._id.toString()).toBe(createdUser._id.toString());
    });

    it('should find user by reset token', async () => {
      const createdUser = await User.createUser(validUserData);
      const resetToken = await createdUser.generatePasswordResetToken();

      const foundUser = await User.findByResetToken(resetToken);

      expect(foundUser).toBeDefined();
      expect(foundUser?._id.toString()).toBe(createdUser._id.toString());
    });

    it('should find user by verification token', async () => {
      const createdUser = await User.createUser(validUserData);
      const verificationToken =
        await createdUser.generateEmailVerificationToken();

      const foundUser = await User.findByVerificationToken(verificationToken);

      expect(foundUser).toBeDefined();
      expect(foundUser?._id.toString()).toBe(createdUser._id.toString());
    });

    it('should validate user with correct credentials', async () => {
      await User.createUser(validUserData);

      const validatedUser = await User.validateUser(
        validUserData.email,
        validUserData.password
      );

      expect(validatedUser).toBeDefined();
      expect(validatedUser.email).toBe(validUserData.email);
      expect(validatedUser.lastLoginAt).toBeDefined();
    });

    it('should not validate user with incorrect password', async () => {
      await User.createUser(validUserData);

      await expect(
        User.validateUser(validUserData.email, 'WrongPassword123!')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should not validate non-existent user', async () => {
      await expect(
        User.validateUser('nonexistent@example.com', validUserData.password)
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('Instance Methods', () => {
    it('should compare password correctly', async () => {
      const user = await User.createUser(validUserData);

      const isMatch = await user.comparePassword(validUserData.password);
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('WrongPassword123!');
      expect(isNotMatch).toBe(false);
    });

    it('should generate password reset token', async () => {
      const user = await User.createUser(validUserData);

      const resetToken = await user.generatePasswordResetToken();
      expect(resetToken).toBeDefined();
      expect(user.passwordResetToken).toBeDefined();
      expect(user.passwordResetExpires).toBeDefined();

      // Reset token should be valid
      const foundUser = await User.findByResetToken(resetToken);
      expect(foundUser).toBeDefined();
    });

    it('should generate email verification token', async () => {
      const user = await User.createUser(validUserData);

      const verificationToken = await user.generateEmailVerificationToken();
      expect(verificationToken).toBeDefined();
      expect(user.emailVerificationToken).toBeDefined();

      // Verification token should be valid
      const foundUser = await User.findByVerificationToken(verificationToken);
      expect(foundUser).toBeDefined();
    });

    it('should update last login time', async () => {
      const user = await User.createUser(validUserData);
      expect(user.lastLoginAt).toBeUndefined();

      await user.updateLastLogin();
      expect(user.lastLoginAt).toBeDefined();
    });

    it('should check feature access based on subscription tier', async () => {
      const freeUser = await User.createUser(validUserData);

      // Free tier: 1 party, 3 encounters, 10 characters
      expect(freeUser.canAccessFeature('parties', 1)).toBe(true);
      expect(freeUser.canAccessFeature('parties', 2)).toBe(false);

      expect(freeUser.canAccessFeature('encounters', 3)).toBe(true);
      expect(freeUser.canAccessFeature('encounters', 4)).toBe(false);

      expect(freeUser.canAccessFeature('characters', 10)).toBe(true);
      expect(freeUser.canAccessFeature('characters', 11)).toBe(false);

      // Create a user with expert tier
      const expertUser = await User.createUser({
        ...validUserData,
        email: 'expert@example.com',
        username: 'expertuser',
        subscriptionTier: 'expert',
      });

      // Expert tier: 10 parties, 50 encounters, 200 characters
      expect(expertUser.canAccessFeature('parties', 10)).toBe(true);
      expect(expertUser.canAccessFeature('parties', 11)).toBe(false);

      expect(expertUser.canAccessFeature('encounters', 50)).toBe(true);
      expect(expertUser.canAccessFeature('encounters', 51)).toBe(false);

      expect(expertUser.canAccessFeature('characters', 200)).toBe(true);
      expect(expertUser.canAccessFeature('characters', 201)).toBe(false);
    });

    it('should convert to public JSON representation', async () => {
      const user = await User.createUser(validUserData);
      const publicUser = user.toPublicJSON();

      // Public representation should include these fields
      expect(publicUser.id).toBeDefined();
      expect(publicUser.email).toBe(user.email);
      expect(publicUser.username).toBe(user.username);
      expect(publicUser.firstName).toBe(user.firstName);
      expect(publicUser.lastName).toBe(user.lastName);
      expect(publicUser.role).toBe(user.role);
      expect(publicUser.subscriptionTier).toBe(user.subscriptionTier);
      expect(publicUser.isEmailVerified).toBe(user.isEmailVerified);
      expect(publicUser.preferences).toEqual(user.preferences);
      expect(publicUser.createdAt).toBeDefined();
      expect(publicUser.updatedAt).toBeDefined();

      // Sensitive fields should not be included
      expect((publicUser as any).passwordHash).toBeUndefined();
      expect((publicUser as any).emailVerificationToken).toBeUndefined();
      expect((publicUser as any).passwordResetToken).toBeUndefined();
      expect((publicUser as any).passwordResetExpires).toBeUndefined();
    });
  });
});
