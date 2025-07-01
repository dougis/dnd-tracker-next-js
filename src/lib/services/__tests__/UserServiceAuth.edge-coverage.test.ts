import '../__test-helpers__/test-setup';
import { UserServiceAuth } from '../UserServiceAuth';
import User from '../../models/User';
import { mockUser, mockUserData } from '../__test-helpers__/test-setup';
import { createMockUser } from './testUtils';
import { UserAlreadyExistsError, InvalidCredentialsError, UserServiceError } from '../UserServiceErrors';

/**
 * Edge case tests specifically targeting uncovered lines to reach 80% coverage
 * Focus on error paths, edge cases, and exception handling
 */
describe('UserServiceAuth - Edge Coverage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser - Edge Cases', () => {
    const validUserData = {
      email: 'edge@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      username: 'edgeuser',
      firstName: 'Edge',
      lastName: 'User',
      agreeToTerms: true,
      subscribeToNewsletter: false,
    };

    it('should handle UserAlreadyExistsError specifically', async () => {
      // Mock checkUserExists to throw UserAlreadyExistsError
      const mockError = new UserAlreadyExistsError('email', 'edge@example.com');
      
      jest.doMock('../UserServiceHelpers', () => ({
        checkUserExists: jest.fn().mockRejectedValue(mockError),
      }));

      const result = await UserServiceAuth.createUser(validUserData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_ALREADY_EXISTS');
      expect(result.error?.statusCode).toBe(409);
    });

    it('should handle validation errors in creation', async () => {
      // Mock validation to throw an error
      jest.doMock('../UserServiceValidation', () => ({
        validateAndParseRegistration: jest.fn().mockImplementation(() => {
          throw new Error('Validation failed');
        }),
      }));

      const result = await UserServiceAuth.createUser(validUserData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_ALREADY_EXISTS'); // Fallback
      expect(result.error?.statusCode).toBe(409);
    });

    it('should handle successful user creation with all database operations', async () => {
      // Mock all dependencies for success path
      jest.doMock('../UserServiceHelpers', () => ({
        checkUserExists: jest.fn().mockResolvedValue(undefined),
      }));

      const mockSavedUser = {
        ...mockUserData,
        email: validUserData.email,
        username: validUserData.username,
        firstName: validUserData.firstName,
        lastName: validUserData.lastName,
        toPublicJSON: jest.fn().mockReturnValue({
          id: mockUserData._id,
          email: validUserData.email,
          username: validUserData.username,
          firstName: validUserData.firstName,
          lastName: validUserData.lastName,
          role: 'user',
          subscriptionTier: 'free',
          isEmailVerified: false,
        }),
      };

      (User as any).mockImplementation(() => mockSavedUser);

      // Mock UserServiceDatabase.generateAndSaveEmailToken
      jest.doMock('../UserServiceDatabase', () => ({
        generateAndSaveEmailToken: jest.fn().mockResolvedValue(undefined),
      }));

      // Mock UserServiceResponseHelpers
      jest.doMock('../UserServiceResponseHelpers', () => ({
        createSuccessResponse: jest.fn().mockReturnValue({
          success: true,
          data: mockSavedUser.toPublicJSON(),
        }),
        safeToPublicJSON: jest.fn().mockReturnValue(mockSavedUser.toPublicJSON()),
      }));

      const result = await UserServiceAuth.createUser(validUserData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('authenticateUser - Edge Cases', () => {
    const validLoginData = {
      email: 'auth@example.com',
      password: 'TestPassword123!',
      rememberMe: false,
    };

    it('should handle successful authentication with all database operations', async () => {
      const mockAuthUser = {
        ...createMockUser({
          email: 'auth@example.com',
          isEmailVerified: true,
        }),
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      // Mock UserServiceLookup.findUserByEmailNullable
      jest.doMock('../UserServiceLookup', () => ({
        findUserByEmailNullable: jest.fn().mockResolvedValue(mockAuthUser),
      }));

      // Mock UserServiceDatabase.updateLastLogin
      jest.doMock('../UserServiceDatabase', () => ({
        updateLastLogin: jest.fn().mockResolvedValue(undefined),
      }));

      // Mock UserServiceResponseHelpers
      jest.doMock('../UserServiceResponseHelpers', () => ({
        createSuccessResponse: jest.fn().mockReturnValue({
          success: true,
          data: {
            user: mockAuthUser,
            requiresVerification: false,
          },
        }),
        safeToPublicJSON: jest.fn().mockReturnValue(mockAuthUser),
      }));

      const result = await UserServiceAuth.authenticateUser(validLoginData);

      expect(result.success).toBe(true);
      expect(result.data?.user).toBeDefined();
      expect(result.data?.requiresVerification).toBe(false);
    });

    it('should handle InvalidCredentialsError specifically', async () => {
      // Mock to throw InvalidCredentialsError
      jest.doMock('../UserServiceLookup', () => ({
        findUserByEmailNullable: jest.fn().mockResolvedValue(null),
      }));

      jest.doMock('../UserServiceResponseHelpers', () => ({
        createErrorResponse: jest.fn().mockReturnValue({
          success: false,
          error: {
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
            statusCode: 401,
          },
        }),
      }));

      const result = await UserServiceAuth.authenticateUser(validLoginData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
      expect(result.error?.statusCode).toBe(401);
    });

    it('should handle fallback error path for unknown errors', async () => {
      // Mock to throw unknown error
      jest.doMock('../UserServiceValidation', () => ({
        validateAndParseLogin: jest.fn().mockImplementation(() => {
          throw new Error('Unknown validation error');
        }),
      }));

      const result = await UserServiceAuth.authenticateUser(validLoginData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
      expect(result.error?.statusCode).toBe(401);
    });
  });

  describe('changePassword - Edge Cases', () => {
    const userId = 'test-user-id';
    const validPasswordData = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword456!',
      confirmNewPassword: 'NewPassword456!',
    };

    it('should handle successful password change with all operations', async () => {
      const mockUser = {
        ...createMockUser({ _id: userId }),
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      // Mock UserServiceLookup.findUserByIdOrThrow
      jest.doMock('../UserServiceLookup', () => ({
        findUserByIdOrThrow: jest.fn().mockResolvedValue(mockUser),
      }));

      // Mock UserServiceDatabase.updatePasswordAndClearTokens
      jest.doMock('../UserServiceDatabase', () => ({
        updatePasswordAndClearTokens: jest.fn().mockResolvedValue(undefined),
      }));

      // Mock UserServiceResponseHelpers.createSuccessResponse
      jest.doMock('../UserServiceResponseHelpers', () => ({
        createSuccessResponse: jest.fn().mockReturnValue({
          success: true,
          data: undefined,
        }),
      }));

      const result = await UserServiceAuth.changePassword(userId, validPasswordData);

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it('should handle UserServiceError for incorrect current password', async () => {
      const mockUser = {
        ...createMockUser({ _id: userId }),
        comparePassword: jest.fn().mockResolvedValue(false), // Wrong password
      };

      jest.doMock('../UserServiceLookup', () => ({
        findUserByIdOrThrow: jest.fn().mockResolvedValue(mockUser),
      }));

      jest.doMock('../UserServiceResponseHelpers', () => ({
        createErrorResponse: jest.fn().mockReturnValue({
          success: false,
          error: {
            message: 'Current password is incorrect',
            code: 'INVALID_CURRENT_PASSWORD',
            statusCode: 400,
          },
        }),
      }));

      const result = await UserServiceAuth.changePassword(userId, validPasswordData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CURRENT_PASSWORD');
      expect(result.error?.statusCode).toBe(400);
    });

    it('should handle general errors with handleCustomError', async () => {
      // Mock to throw a general error
      jest.doMock('../UserServiceValidation', () => ({
        validateAndParsePasswordChange: jest.fn().mockImplementation(() => {
          throw new Error('General error');
        }),
      }));

      jest.doMock('../UserServiceResponseHelpers', () => ({
        handleCustomError: jest.fn().mockReturnValue({
          success: false,
          error: {
            message: 'Failed to change password',
            code: 'PASSWORD_CHANGE_FAILED',
            statusCode: 400,
          },
        }),
      }));

      const result = await UserServiceAuth.changePassword(userId, validPasswordData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('PASSWORD_CHANGE_FAILED');
    });
  });

  describe('requestPasswordReset - Edge Cases', () => {
    const validResetData = {
      email: 'reset@example.com',
    };

    it('should handle successful reset token generation', async () => {
      const mockUser = createMockUser({ email: 'reset@example.com' });

      jest.doMock('../UserServiceLookup', () => ({
        findUserByEmailNullable: jest.fn().mockResolvedValue(mockUser),
      }));

      jest.doMock('../UserServiceDatabase', () => ({
        generateAndSaveResetToken: jest.fn().mockResolvedValue('reset-token-123'),
      }));

      jest.doMock('../UserServiceResponseHelpers', () => ({
        createSecurityResponse: jest.fn().mockReturnValue({
          success: true,
          data: { token: 'reset-token-123' },
        }),
      }));

      const result = await UserServiceAuth.requestPasswordReset(validResetData);

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('reset-token-123');
    });

    it('should handle security response for non-existent user', async () => {
      jest.doMock('../UserServiceLookup', () => ({
        findUserByEmailNullable: jest.fn().mockResolvedValue(null),
      }));

      jest.doMock('../UserServiceResponseHelpers', () => ({
        createSecurityResponse: jest.fn().mockReturnValue({
          success: true,
          data: { token: 'dummy-token' },
        }),
      }));

      const result = await UserServiceAuth.requestPasswordReset(validResetData);

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('dummy-token');
    });

    it('should handle general errors with handleCustomError', async () => {
      jest.doMock('../UserServiceValidation', () => ({
        validateAndParsePasswordResetRequest: jest.fn().mockImplementation(() => {
          throw new Error('Validation error');
        }),
      }));

      jest.doMock('../UserServiceResponseHelpers', () => ({
        handleCustomError: jest.fn().mockReturnValue({
          success: false,
          error: {
            message: 'Failed to process password reset request',
            code: 'PASSWORD_RESET_REQUEST_FAILED',
            statusCode: 400,
          },
        }),
      }));

      const result = await UserServiceAuth.requestPasswordReset(validResetData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('PASSWORD_RESET_REQUEST_FAILED');
    });
  });

  describe('resetPassword - Edge Cases', () => {
    const validResetData = {
      token: 'valid-reset-token',
      password: 'NewSecurePassword123!',
      confirmPassword: 'NewSecurePassword123!',
    };

    it('should handle successful password reset', async () => {
      const mockUser = createMockUser({ email: 'reset@example.com' });

      jest.doMock('../UserServiceLookup', () => ({
        findUserByResetTokenOrThrow: jest.fn().mockResolvedValue(mockUser),
      }));

      jest.doMock('../UserServiceDatabase', () => ({
        updatePasswordAndClearTokens: jest.fn().mockResolvedValue(undefined),
      }));

      jest.doMock('../UserServiceResponseHelpers', () => ({
        createSuccessResponse: jest.fn().mockReturnValue({
          success: true,
          data: undefined,
        }),
      }));

      const result = await UserServiceAuth.resetPassword(validResetData);

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it('should handle UserServiceError in reset', async () => {
      const mockError = new UserServiceError('Invalid token', 'INVALID_RESET_TOKEN', 400);

      jest.doMock('../UserServiceValidation', () => ({
        validateAndParsePasswordReset: jest.fn().mockImplementation(() => {
          throw mockError;
        }),
      }));

      jest.doMock('../UserServiceResponseHelpers', () => ({
        createErrorResponse: jest.fn().mockReturnValue({
          success: false,
          error: {
            message: 'Invalid token',
            code: 'INVALID_RESET_TOKEN',
            statusCode: 400,
          },
        }),
      }));

      const result = await UserServiceAuth.resetPassword(validResetData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_RESET_TOKEN');
    });

    it('should handle general errors with handleCustomError', async () => {
      jest.doMock('../UserServiceValidation', () => ({
        validateAndParsePasswordReset: jest.fn().mockImplementation(() => {
          throw new Error('General error');
        }),
      }));

      jest.doMock('../UserServiceResponseHelpers', () => ({
        handleCustomError: jest.fn().mockReturnValue({
          success: false,
          error: {
            message: 'Failed to reset password',
            code: 'PASSWORD_RESET_FAILED',
            statusCode: 400,
          },
        }),
      }));

      const result = await UserServiceAuth.resetPassword(validResetData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('PASSWORD_RESET_FAILED');
    });
  });

  describe('verifyEmail - Edge Cases', () => {
    const validVerificationData = {
      token: 'valid-verification-token',
    };

    it('should handle successful email verification', async () => {
      const mockUser = createMockUser({ 
        email: 'verify@example.com',
        isEmailVerified: false,
      });

      jest.doMock('../UserServiceLookup', () => ({
        findUserByVerificationTokenOrThrow: jest.fn().mockResolvedValue(mockUser),
      }));

      jest.doMock('../UserServiceDatabase', () => ({
        markEmailVerified: jest.fn().mockResolvedValue(undefined),
      }));

      jest.doMock('../UserServiceResponseHelpers', () => ({
        createSuccessResponse: jest.fn().mockReturnValue({
          success: true,
          data: mockUser,
        }),
        safeToPublicJSON: jest.fn().mockReturnValue(mockUser),
      }));

      const result = await UserServiceAuth.verifyEmail(validVerificationData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle UserServiceError in verification', async () => {
      const mockError = new UserServiceError('Invalid verification token', 'INVALID_VERIFICATION_TOKEN', 400);

      jest.doMock('../UserServiceValidation', () => ({
        validateAndParseEmailVerification: jest.fn().mockImplementation(() => {
          throw mockError;
        }),
      }));

      jest.doMock('../UserServiceResponseHelpers', () => ({
        createErrorResponse: jest.fn().mockReturnValue({
          success: false,
          error: {
            message: 'Invalid verification token',
            code: 'INVALID_VERIFICATION_TOKEN',
            statusCode: 400,
          },
        }),
      }));

      const result = await UserServiceAuth.verifyEmail(validVerificationData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_VERIFICATION_TOKEN');
    });

    it('should handle general errors with handleCustomError', async () => {
      jest.doMock('../UserServiceValidation', () => ({
        validateAndParseEmailVerification: jest.fn().mockImplementation(() => {
          throw new Error('General verification error');
        }),
      }));

      jest.doMock('../UserServiceResponseHelpers', () => ({
        handleCustomError: jest.fn().mockReturnValue({
          success: false,
          error: {
            message: 'Failed to verify email',
            code: 'EMAIL_VERIFICATION_FAILED',
            statusCode: 400,
          },
        }),
      }));

      const result = await UserServiceAuth.verifyEmail(validVerificationData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('EMAIL_VERIFICATION_FAILED');
    });
  });

  describe('resendVerificationEmail - Edge Cases', () => {
    it('should handle successful resend for unverified user', async () => {
      const mockUser = createMockUser({ 
        email: 'resend@example.com',
        isEmailVerified: false,
      });

      jest.doMock('../UserServiceLookup', () => ({
        findUserByEmailOrThrow: jest.fn().mockResolvedValue(mockUser),
      }));

      jest.doMock('../UserServiceDatabase', () => ({
        generateAndSaveEmailToken: jest.fn().mockResolvedValue(undefined),
      }));

      jest.doMock('../UserServiceResponseHelpers', () => ({
        createSuccessResponse: jest.fn().mockReturnValue({
          success: true,
          data: undefined,
        }),
      }));

      const result = await UserServiceAuth.resendVerificationEmail('resend@example.com');

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it('should handle already verified email error', async () => {
      const mockUser = createMockUser({ 
        email: 'verified@example.com',
        isEmailVerified: true,
      });

      jest.doMock('../UserServiceLookup', () => ({
        findUserByEmailOrThrow: jest.fn().mockResolvedValue(mockUser),
      }));

      const result = await UserServiceAuth.resendVerificationEmail('verified@example.com');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('EMAIL_ALREADY_VERIFIED');
      expect(result.error?.statusCode).toBe(400);
    });

    it('should handle UserServiceError in resend', async () => {
      const mockError = new UserServiceError('User not found', 'USER_NOT_FOUND', 404);

      jest.doMock('../UserServiceLookup', () => ({
        findUserByEmailOrThrow: jest.fn().mockRejectedValue(mockError),
      }));

      jest.doMock('../UserServiceResponseHelpers', () => ({
        createErrorResponse: jest.fn().mockReturnValue({
          success: false,
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND',
            statusCode: 404,
          },
        }),
      }));

      const result = await UserServiceAuth.resendVerificationEmail('nonexistent@example.com');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });

    it('should handle general errors with handleCustomError', async () => {
      jest.doMock('../UserServiceLookup', () => ({
        findUserByEmailOrThrow: jest.fn().mockRejectedValue(new Error('Database error')),
      }));

      jest.doMock('../UserServiceResponseHelpers', () => ({
        handleCustomError: jest.fn().mockReturnValue({
          success: false,
          error: {
            message: 'Failed to resend verification email',
            code: 'VERIFICATION_EMAIL_FAILED',
            statusCode: 400,
          },
        }),
      }));

      const result = await UserServiceAuth.resendVerificationEmail('error@example.com');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VERIFICATION_EMAIL_FAILED');
    });
  });
});