import {
  UserService,
  UserServiceError,
  UserNotFoundError,
  UserAlreadyExistsError,
  InvalidCredentialsError,
  TokenExpiredError,
  TokenInvalidError,
} from '../UserService';

/**
 * Tests for UserService business logic
 *
 * These tests focus on the service layer functionality without requiring
 * a full MongoDB connection. Uses mocking for database operations.
 */

// Mock the User model
jest.mock('../../models/User', () => ({
  User: jest.fn().mockImplementation(() => ({
    generateEmailVerificationToken: jest.fn(),
    save: jest.fn(),
    toPublicJSON: jest.fn(),
  })),
}));

// Add static methods to the mocked User constructor
const MockedUser = jest.mocked(require('../../models/User').User);
MockedUser.findByEmail = jest.fn();
MockedUser.findByUsername = jest.fn();
MockedUser.findById = jest.fn();
MockedUser.findByResetToken = jest.fn();
MockedUser.findByVerificationToken = jest.fn();
MockedUser.find = jest.fn();
MockedUser.countDocuments = jest.fn();
MockedUser.aggregate = jest.fn();
MockedUser.findByIdAndDelete = jest.fn();

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Type the mocked functions
const mockUser = MockedUser;

// Mock user data
const mockUserData = {
  _id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  passwordHash: '$2b$12$hashedPassword',
  role: 'user' as const,
  subscriptionTier: 'free' as const,
  preferences: {
    theme: 'system' as const,
    emailNotifications: true,
    browserNotifications: false,
    timezone: 'UTC',
    language: 'en',
    diceRollAnimations: true,
    autoSaveEncounters: true,
  },
  isEmailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  comparePassword: jest.fn(),
  generatePasswordResetToken: jest.fn(),
  generateEmailVerificationToken: jest.fn(),
  updateLastLogin: jest.fn(),
  save: jest.fn(),
  toPublicJSON: jest.fn(),
};

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Error Classes', () => {
    it('should create UserServiceError with correct properties', () => {
      const error = new UserServiceError('Test message', 'TEST_CODE', 400);

      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('UserServiceError');
    });

    it('should create UserNotFoundError with correct properties', () => {
      const error = new UserNotFoundError('user123');

      expect(error.message).toBe('User not found: user123');
      expect(error.code).toBe('USER_NOT_FOUND');
      expect(error.statusCode).toBe(404);
    });

    it('should create UserAlreadyExistsError with correct properties', () => {
      const error = new UserAlreadyExistsError('email', 'test@example.com');

      expect(error.message).toBe(
        'User already exists with email: test@example.com'
      );
      expect(error.code).toBe('USER_ALREADY_EXISTS');
      expect(error.statusCode).toBe(409);
    });

    it('should create InvalidCredentialsError with correct properties', () => {
      const error = new InvalidCredentialsError();

      expect(error.message).toBe('Invalid email or password');
      expect(error.code).toBe('INVALID_CREDENTIALS');
      expect(error.statusCode).toBe(401);
    });

    it('should create TokenExpiredError with correct properties', () => {
      const error = new TokenExpiredError('password reset');

      expect(error.message).toBe('password reset token has expired');
      expect(error.code).toBe('TOKEN_EXPIRED');
      expect(error.statusCode).toBe(410);
    });

    it('should create TokenInvalidError with correct properties', () => {
      const error = new TokenInvalidError('email verification');

      expect(error.message).toBe('Invalid email verification token');
      expect(error.code).toBe('TOKEN_INVALID');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('createUser', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      agreeToTerms: true,
      subscribeToNewsletter: false,
    };

    it('should successfully create a new user', async () => {
      mockUser.findByEmail.mockResolvedValue(null);
      mockUser.findByUsername.mockResolvedValue(null);

      const mockNewUser = {
        ...mockUserData,
        generateEmailVerificationToken: jest
          .fn()
          .mockReturnValue('verification-token'),
        save: jest.fn().mockResolvedValue(true),
        toPublicJSON: jest.fn().mockReturnValue({
          _id: mockUserData._id,
          email: mockUserData.email,
          username: mockUserData.username,
          firstName: mockUserData.firstName,
          lastName: mockUserData.lastName,
          role: mockUserData.role,
          subscriptionTier: mockUserData.subscriptionTier,
        }),
      };

      // Mock the User constructor to return our mock user
      mockUser.mockImplementation(() => mockNewUser as any);

      const result = await UserService.createUser(validUserData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.email).toBe(validUserData.email);
      expect(mockUser.findByEmail).toHaveBeenCalledWith(validUserData.email);
      expect(mockUser.findByUsername).toHaveBeenCalledWith(
        validUserData.username
      );
    });

    it('should return error if user with email already exists', async () => {
      mockUser.findByEmail.mockResolvedValue(mockUserData as any);

      const result = await UserService.createUser(validUserData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_ALREADY_EXISTS');
      expect(result.error?.statusCode).toBe(409);
    });

    it('should return error if user with username already exists', async () => {
      mockUser.findByEmail.mockResolvedValue(null);
      mockUser.findByUsername.mockResolvedValue(mockUserData as any);

      const result = await UserService.createUser(validUserData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_ALREADY_EXISTS');
      expect(result.error?.statusCode).toBe(409);
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
        confirmPassword: '456',
        username: '',
        firstName: '',
        lastName: '',
        agreeToTerms: false,
      };

      const result = await UserService.createUser(invalidData as any);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('authenticateUser', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'Password123!',
      rememberMe: false,
    };

    it('should successfully authenticate valid credentials', async () => {
      const mockAuthUser = {
        ...mockUserData,
        comparePassword: jest.fn().mockResolvedValue(true),
        updateLastLogin: jest.fn().mockResolvedValue(true),
        toPublicJSON: jest.fn().mockReturnValue({
          _id: mockUserData._id,
          email: mockUserData.email,
          username: mockUserData.username,
          isEmailVerified: false,
        }),
      };

      mockUser.findByEmail.mockResolvedValue(mockAuthUser as any);

      const result = await UserService.authenticateUser(validLoginData);

      expect(result.success).toBe(true);
      expect(result.data?.user).toBeDefined();
      expect(result.data?.requiresVerification).toBe(true);
      expect(mockAuthUser.comparePassword).toHaveBeenCalledWith(
        validLoginData.password
      );
      expect(mockAuthUser.updateLastLogin).toHaveBeenCalled();
    });

    it('should return error for non-existent user', async () => {
      mockUser.findByEmail.mockResolvedValue(null);

      const result = await UserService.authenticateUser(validLoginData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
      expect(result.error?.statusCode).toBe(401);
    });

    it('should return error for invalid password', async () => {
      const mockAuthUser = {
        ...mockUserData,
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      mockUser.findByEmail.mockResolvedValue(mockAuthUser as any);

      const result = await UserService.authenticateUser(validLoginData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
      expect(result.error?.statusCode).toBe(401);
    });
  });

  describe('getUserById', () => {
    it('should successfully retrieve user by ID', async () => {
      const mockFoundUser = {
        ...mockUserData,
        toPublicJSON: jest.fn().mockReturnValue({
          _id: mockUserData._id,
          email: mockUserData.email,
          username: mockUserData.username,
        }),
      };

      mockUser.findById.mockResolvedValue(mockFoundUser as any);

      const result = await UserService.getUserById('507f1f77bcf86cd799439011');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockUser.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011'
      );
    });

    it('should return error for non-existent user', async () => {
      mockUser.findById.mockResolvedValue(null);

      const result = await UserService.getUserById('507f1f77bcf86cd799439011');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
      expect(result.error?.statusCode).toBe(404);
    });
  });

  describe('updateUserProfile', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      preferences: {
        theme: 'dark' as const,
      },
    };

    it('should successfully update user profile', async () => {
      const mockUpdateUser = {
        ...mockUserData,
        save: jest.fn().mockResolvedValue(true),
        toPublicJSON: jest.fn().mockReturnValue({
          ...mockUserData,
          firstName: 'Updated',
          lastName: 'Name',
        }),
      };

      mockUser.findById.mockResolvedValue(mockUpdateUser as any);

      const result = await UserService.updateUserProfile(
        '507f1f77bcf86cd799439011',
        updateData
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockUpdateUser.save).toHaveBeenCalled();
    });

    it('should return error for non-existent user', async () => {
      mockUser.findById.mockResolvedValue(null);

      const result = await UserService.updateUserProfile(
        '507f1f77bcf86cd799439011',
        updateData
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
      expect(result.error?.statusCode).toBe(404);
    });

    it('should check for email conflicts', async () => {
      const updateWithEmail = {
        email: 'newemail@example.com',
      };

      const mockCurrentUser = {
        ...mockUserData,
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        email: 'old@example.com',
      };

      const mockConflictUser = {
        ...mockUserData,
        _id: { toString: () => '507f1f77bcf86cd799439012' },
        email: 'newemail@example.com',
      };

      mockUser.findById.mockResolvedValue(mockCurrentUser as any);
      mockUser.findByEmail.mockResolvedValue(mockConflictUser as any);

      const result = await UserService.updateUserProfile(
        '507f1f77bcf86cd799439011',
        updateWithEmail
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_ALREADY_EXISTS');
    });
  });

  describe('changePassword', () => {
    const passwordData = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmNewPassword: 'NewPassword123!',
    };

    it('should successfully change password', async () => {
      const mockPasswordUser = {
        ...mockUserData,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      };

      mockUser.findById.mockResolvedValue(mockPasswordUser as any);

      const result = await UserService.changePassword(
        '507f1f77bcf86cd799439011',
        passwordData
      );

      expect(result.success).toBe(true);
      expect(mockPasswordUser.comparePassword).toHaveBeenCalledWith(
        'OldPassword123!'
      );
      expect(mockPasswordUser.save).toHaveBeenCalled();
    });

    it('should return error for incorrect current password', async () => {
      const mockPasswordUser = {
        ...mockUserData,
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      mockUser.findById.mockResolvedValue(mockPasswordUser as any);

      const result = await UserService.changePassword(
        '507f1f77bcf86cd799439011',
        passwordData
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CURRENT_PASSWORD');
    });
  });

  describe('requestPasswordReset', () => {
    it('should generate reset token for existing user', async () => {
      const mockResetUser = {
        ...mockUserData,
        generatePasswordResetToken: jest
          .fn()
          .mockReturnValue('reset-token-123'),
        save: jest.fn().mockResolvedValue(true),
      };

      mockUser.findByEmail.mockResolvedValue(mockResetUser as any);

      const result = await UserService.requestPasswordReset({
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('reset-token-123');
      expect(mockResetUser.generatePasswordResetToken).toHaveBeenCalled();
    });

    it('should return success even for non-existent user (security)', async () => {
      mockUser.findByEmail.mockResolvedValue(null);

      const result = await UserService.requestPasswordReset({
        email: 'nonexistent@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('dummy-token');
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid token', async () => {
      const mockResetUser = {
        ...mockUserData,
        save: jest.fn().mockResolvedValue(true),
      };

      mockUser.findByResetToken.mockResolvedValue(mockResetUser as any);

      const result = await UserService.resetPassword({
        token: 'valid-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });

      expect(result.success).toBe(true);
      expect(mockUser.findByResetToken).toHaveBeenCalledWith('valid-token');
      expect(mockResetUser.save).toHaveBeenCalled();
    });

    it('should return error for invalid token', async () => {
      mockUser.findByResetToken.mockResolvedValue(null);

      const result = await UserService.resetPassword({
        token: 'invalid-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('TOKEN_INVALID');
    });
  });

  describe('verifyEmail', () => {
    it('should successfully verify email with valid token', async () => {
      const mockVerifyUser = {
        ...mockUserData,
        save: jest.fn().mockResolvedValue(true),
        toPublicJSON: jest.fn().mockReturnValue({
          ...mockUserData,
          isEmailVerified: true,
        }),
      };

      mockUser.findByVerificationToken.mockResolvedValue(mockVerifyUser as any);

      const result = await UserService.verifyEmail({
        token: 'valid-verification-token',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockUser.findByVerificationToken).toHaveBeenCalledWith(
        'valid-verification-token'
      );
      expect(mockVerifyUser.save).toHaveBeenCalled();
    });

    it('should return error for invalid verification token', async () => {
      mockUser.findByVerificationToken.mockResolvedValue(null);

      const result = await UserService.verifyEmail({ token: 'invalid-token' });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('TOKEN_INVALID');
    });
  });

  describe('getUsers', () => {
    it('should return paginated list of users', async () => {
      const mockUsers = [
        { ...mockUserData, _id: '1' },
        { ...mockUserData, _id: '2' },
      ];

      mockUser.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(mockUsers),
            }),
          }),
        }),
      } as any);

      mockUser.countDocuments.mockResolvedValue(10);

      const result = await UserService.getUsers(1, 2);

      expect(result.success).toBe(true);
      expect(result.data?.data).toHaveLength(2);
      expect(result.data?.pagination.total).toBe(10);
      expect(result.data?.pagination.totalPages).toBe(5);
    });

    it('should apply filters correctly', async () => {
      mockUser.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as any);

      mockUser.countDocuments.mockResolvedValue(0);

      await UserService.getUsers(1, 10, {
        role: 'admin',
        isEmailVerified: true,
      });

      expect(mockUser.find).toHaveBeenCalledWith({
        role: 'admin',
        isEmailVerified: true,
      });
    });
  });

  describe('updateSubscription', () => {
    it('should successfully update user subscription', async () => {
      const mockSubUser = {
        ...mockUserData,
        save: jest.fn().mockResolvedValue(true),
        toPublicJSON: jest.fn().mockReturnValue({
          ...mockUserData,
          subscriptionTier: 'expert',
        }),
      };

      mockUser.findById.mockResolvedValue(mockSubUser as any);

      const result = await UserService.updateSubscription(
        '507f1f77bcf86cd799439011',
        'expert'
      );

      expect(result.success).toBe(true);
      expect(mockSubUser.save).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete user', async () => {
      mockUser.findById.mockResolvedValue(mockUserData as any);
      mockUser.findByIdAndDelete.mockResolvedValue(mockUserData as any);

      const result = await UserService.deleteUser('507f1f77bcf86cd799439011');

      expect(result.success).toBe(true);
      expect(mockUser.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011'
      );
    });

    it('should return error for non-existent user', async () => {
      mockUser.findById.mockResolvedValue(null);

      const result = await UserService.deleteUser('507f1f77bcf86cd799439011');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const mockStats = [
        { _id: 'free', count: 100 },
        { _id: 'expert', count: 25 },
        { _id: 'guild', count: 5 },
      ];

      mockUser.countDocuments
        .mockResolvedValueOnce(130) // total users
        .mockResolvedValueOnce(95) // verified users
        .mockResolvedValueOnce(45); // active users

      mockUser.aggregate.mockResolvedValue(mockStats);

      const result = await UserService.getUserStats();

      expect(result.success).toBe(true);
      expect(result.data?.totalUsers).toBe(130);
      expect(result.data?.verifiedUsers).toBe(95);
      expect(result.data?.activeUsers).toBe(45);
      expect(result.data?.subscriptionBreakdown.free).toBe(100);
      expect(result.data?.subscriptionBreakdown.expert).toBe(25);
      expect(result.data?.subscriptionBreakdown.guild).toBe(5);
    });
  });
});
