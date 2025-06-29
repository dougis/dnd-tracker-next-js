import { UserServiceAuth } from '../UserServiceAuth';
import User from '../../models/User';
import { checkUserExists } from '../UserServiceHelpers';
import {
  UserAlreadyExistsError,
  InvalidCredentialsError,
  UserServiceError,
  TokenInvalidError,
} from '../UserServiceErrors';

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../UserServiceHelpers');
jest.mock('../UserServiceValidation');
jest.mock('../UserServiceDatabase');
jest.mock('../UserServiceLookup');

const MockedUser = jest.mocked(User);
const mockCheckUserExists = jest.mocked(checkUserExists);

describe('UserServiceAuth - Comprehensive Tests', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockEmail = 'test@example.com';
  const mockUsername = 'testuser';
  const mockPassword = 'Password123!';
  
  const mockUserInstance = {
    _id: mockUserId,
    email: mockEmail,
    username: mockUsername,
    firstName: 'Test',
    lastName: 'User',
    passwordHash: 'hashedPassword',
    role: 'user',
    subscriptionTier: 'free',
    isEmailVerified: false,
    generateEmailVerificationToken: jest.fn(),
    generatePasswordResetToken: jest.fn().mockResolvedValue('reset-token'),
    comparePassword: jest.fn(),
    updateLastLogin: jest.fn(),
    save: jest.fn(),
    toPublicJSON: jest.fn().mockReturnValue({
      _id: mockUserId,
      email: mockEmail,
      username: mockUsername,
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      subscriptionTier: 'free',
      isEmailVerified: false,
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock UserServiceValidation
    const mockValidation = {
      validateAndParseRegistration: jest.fn().mockReturnValue({
        email: mockEmail,
        username: mockUsername,
        firstName: 'Test',
        lastName: 'User',
        password: mockPassword,
      }),
      validateAndParseLogin: jest.fn().mockReturnValue({
        email: mockEmail,
        password: mockPassword,
      }),
      validateAndParsePasswordChange: jest.fn().mockReturnValue({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      }),
      validateAndParsePasswordResetRequest: jest.fn().mockReturnValue({
        email: mockEmail,
      }),
      validateAndParsePasswordReset: jest.fn().mockReturnValue({
        token: 'reset-token',
        password: 'NewPassword123!',
      }),
      validateAndParseEmailVerification: jest.fn().mockReturnValue({
        token: 'verification-token',
      }),
    };
    require('../UserServiceValidation').UserServiceValidation = mockValidation;

    // Mock UserServiceDatabase
    const mockDatabase = {
      generateAndSaveEmailToken: jest.fn(),
      generateAndSaveResetToken: jest.fn().mockResolvedValue('reset-token'),
      updateLastLogin: jest.fn(),
      updatePasswordAndClearTokens: jest.fn(),
      markEmailVerified: jest.fn(),
    };
    require('../UserServiceDatabase').UserServiceDatabase = mockDatabase;

    // Mock UserServiceLookup
    const mockLookup = {
      findUserByIdOrThrow: jest.fn().mockResolvedValue(mockUserInstance),
      findUserByEmailNullable: jest.fn(),
      findUserByResetTokenOrThrow: jest.fn().mockResolvedValue(mockUserInstance),
      findUserByVerificationTokenOrThrow: jest.fn().mockResolvedValue(mockUserInstance),
      findUserByEmailOrThrow: jest.fn().mockResolvedValue(mockUserInstance),
    };
    require('../UserServiceLookup').UserServiceLookup = mockLookup;

    // Mock UserServiceResponseHelpers
    const mockResponseHelpers = {
      createSuccessResponse: jest.fn().mockImplementation((data) => ({ success: true, data })),
      createErrorResponse: jest.fn().mockImplementation((error) => ({ success: false, error })),
      createSecurityResponse: jest.fn().mockImplementation((token) => ({ success: true, data: { token } })),
      safeToPublicJSON: jest.fn().mockReturnValue({
        _id: mockUserId,
        email: mockEmail,
        username: mockUsername,
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        subscriptionTier: 'free',
        isEmailVerified: false,
      }),
      handleCustomError: jest.fn().mockReturnValue({ success: false, error: { message: 'Error', code: 'ERROR', statusCode: 500 } }),
    };
    require('../UserServiceResponseHelpers').UserServiceResponseHelpers = mockResponseHelpers;
  });

  describe('createUser', () => {
    const validUserData = {
      email: mockEmail,
      username: mockUsername,
      firstName: 'Test',
      lastName: 'User',
      password: mockPassword,
      confirmPassword: mockPassword,
      agreeToTerms: true,
      subscribeToNewsletter: false,
    };

    it('should successfully create a new user', async () => {
      // Setup mocks
      mockCheckUserExists.mockResolvedValue(undefined);
      MockedUser.mockImplementation(() => mockUserInstance as any);

      const result = await UserServiceAuth.createUser(validUserData);

      expect(result.success).toBe(true);
      expect(MockedUser).toHaveBeenCalledWith({
        email: mockEmail,
        username: mockUsername,
        firstName: 'Test',
        lastName: 'User',
        passwordHash: mockPassword,
        role: 'user',
        subscriptionTier: 'free',
        isEmailVerified: false,
      });
      expect(mockUserInstance.generateEmailVerificationToken).toHaveBeenCalled();
    });

    it('should handle user already exists error', async () => {
      mockCheckUserExists.mockRejectedValue(new UserAlreadyExistsError('email', mockEmail));

      const result = await UserServiceAuth.createUser(validUserData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_ALREADY_EXISTS');
    });

    it('should handle validation errors', async () => {
      const mockValidation = require('../UserServiceValidation').UserServiceValidation;
      mockValidation.validateAndParseRegistration.mockImplementation(() => {
        throw new Error('validation failed');
      });

      const result = await UserServiceAuth.createUser(validUserData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_ALREADY_EXISTS'); // Fallback behavior
    });
  });

  describe('authenticateUser', () => {
    const loginData = {
      email: mockEmail,
      password: mockPassword,
      rememberMe: false,
    };

    it('should successfully authenticate user with valid credentials', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserByEmailNullable.mockResolvedValue(mockUserInstance);
      mockUserInstance.comparePassword.mockResolvedValue(true);

      const result = await UserServiceAuth.authenticateUser(loginData);

      expect(result.success).toBe(true);
      expect(result.data?.user).toBeDefined();
      expect(result.data?.requiresVerification).toBe(true);
      expect(mockUserInstance.comparePassword).toHaveBeenCalledWith(mockPassword);
    });

    it('should return error for non-existent user', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserByEmailNullable.mockResolvedValue(null);

      const result = await UserServiceAuth.authenticateUser(loginData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return error for invalid password', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserByEmailNullable.mockResolvedValue(mockUserInstance);
      mockUserInstance.comparePassword.mockResolvedValue(false);

      const result = await UserServiceAuth.authenticateUser(loginData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
    });

    it('should not require verification for verified users', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      const verifiedUser = { ...mockUserInstance, isEmailVerified: true };
      mockLookup.findUserByEmailNullable.mockResolvedValue(verifiedUser);
      verifiedUser.comparePassword.mockResolvedValue(true);

      const result = await UserServiceAuth.authenticateUser(loginData);

      expect(result.success).toBe(true);
      expect(result.data?.requiresVerification).toBe(false);
    });
  });

  describe('changePassword', () => {
    const passwordData = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmNewPassword: 'NewPassword123!',
    };

    it('should successfully change password', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserByIdOrThrow.mockResolvedValue(mockUserInstance);
      mockUserInstance.comparePassword.mockResolvedValue(true);

      const result = await UserServiceAuth.changePassword(mockUserId, passwordData);

      expect(result.success).toBe(true);
      expect(mockUserInstance.comparePassword).toHaveBeenCalledWith('OldPassword123!');
    });

    it('should return error for user not found', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserByIdOrThrow.mockRejectedValue(new Error('User not found'));

      const result = await UserServiceAuth.changePassword(mockUserId, passwordData);

      expect(result.success).toBe(false);
    });

    it('should return error for incorrect current password', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserByIdOrThrow.mockResolvedValue(mockUserInstance);
      mockUserInstance.comparePassword.mockResolvedValue(false);

      const result = await UserServiceAuth.changePassword(mockUserId, passwordData);

      expect(result.success).toBe(false);
    });
  });

  describe('requestPasswordReset', () => {
    const resetData = { email: mockEmail };

    it('should generate reset token for existing user', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserByEmailNullable.mockResolvedValue(mockUserInstance);
      const mockDatabase = require('../UserServiceDatabase').UserServiceDatabase;
      mockDatabase.generateAndSaveResetToken.mockResolvedValue('reset-token');

      const result = await UserServiceAuth.requestPasswordReset(resetData);

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('reset-token');
    });

    it('should return dummy token for non-existent user (security)', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserByEmailNullable.mockResolvedValue(null);

      const result = await UserServiceAuth.requestPasswordReset(resetData);

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('dummy-token');
    });
  });

  describe('resetPassword', () => {
    const resetData = {
      token: 'reset-token',
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };

    it('should successfully reset password with valid token', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserByResetTokenOrThrow.mockResolvedValue(mockUserInstance);

      const result = await UserServiceAuth.resetPassword(resetData);

      expect(result.success).toBe(true);
    });

    it('should return error for invalid token', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserByResetTokenOrThrow.mockRejectedValue(new TokenInvalidError('Password reset'));

      const result = await UserServiceAuth.resetPassword(resetData);

      expect(result.success).toBe(false);
    });
  });

  describe('verifyEmail', () => {
    const verificationData = { token: 'verification-token' };

    it('should successfully verify email with valid token', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserByVerificationTokenOrThrow.mockResolvedValue(mockUserInstance);

      const result = await UserServiceAuth.verifyEmail(verificationData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should return error for invalid verification token', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserByVerificationTokenOrThrow.mockRejectedValue(new TokenInvalidError('Email verification'));

      const result = await UserServiceAuth.verifyEmail(verificationData);

      expect(result.success).toBe(false);
    });
  });

  describe('resendVerificationEmail', () => {
    it('should successfully resend verification email', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserByEmailOrThrow.mockResolvedValue(mockUserInstance);

      const result = await UserServiceAuth.resendVerificationEmail(mockEmail);

      expect(result.success).toBe(true);
    });

    it('should return error if email already verified', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      const verifiedUser = { ...mockUserInstance, isEmailVerified: true };
      mockLookup.findUserByEmailOrThrow.mockResolvedValue(verifiedUser);

      const result = await UserServiceAuth.resendVerificationEmail(mockEmail);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('EMAIL_ALREADY_VERIFIED');
    });

    it('should return error for non-existent user', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserByEmailOrThrow.mockRejectedValue(new Error('User not found'));

      const result = await UserServiceAuth.resendVerificationEmail(mockEmail);

      expect(result.success).toBe(false);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle database connection errors', async () => {
      mockCheckUserExists.mockRejectedValue(new Error('Database connection failed'));

      const result = await UserServiceAuth.createUser({
        email: mockEmail,
        username: mockUsername,
        firstName: 'Test',
        lastName: 'User',
        password: mockPassword,
        confirmPassword: mockPassword,
        agreeToTerms: true,
        subscribeToNewsletter: false,
      });

      expect(result.success).toBe(false);
    });

    it('should handle undefined user data gracefully', async () => {
      const result = await UserServiceAuth.createUser(undefined as any);
      expect(result.success).toBe(false);
    });

    it('should handle malformed token errors', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserByResetTokenOrThrow.mockRejectedValue(new Error('Malformed token'));

      const result = await UserServiceAuth.resetPassword({
        token: 'malformed-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });

      expect(result.success).toBe(false);
    });
  });
});