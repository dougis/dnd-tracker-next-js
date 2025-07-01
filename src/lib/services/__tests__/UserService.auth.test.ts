/**
 * UserService Authentication Operations Tests
 * Tests delegation to UserServiceAuth module
 */

import { UserService } from '../UserService';
import { UserServiceAuth } from '../UserServiceAuth';
import type {
  PublicUser,
} from '../../validations/user';
import {
  createMockPublicUser,
  createMockUserRegistration,
  createMockUserLogin,
  createMockChangePassword,
  createMockPasswordResetRequest,
  createMockPasswordReset,
  createMockEmailVerification,
  createSuccessResult,
  createUserAlreadyExistsError,
  createInvalidCredentialsError,
  createInvalidTokenError,
  createUserNotFoundError,
  setupMockClearance,
  expectDelegationCall,
  TEST_EMAIL,
} from './UserService.test-helpers';

// Mock UserServiceAuth
jest.mock('../UserServiceAuth');

const mockUserServiceAuth = UserServiceAuth as jest.Mocked<typeof UserServiceAuth>;

describe('UserService Authentication Operations', () => {
  setupMockClearance();

  describe('createUser', () => {
    it('should delegate to UserServiceAuth.createUser', async () => {
      const userData = createMockUserRegistration();
      const mockUser = createMockPublicUser({ isEmailVerified: false });
      const expectedResult = createSuccessResult(mockUser);

      mockUserServiceAuth.createUser.mockResolvedValue(expectedResult);

      const result = await UserService.createUser(userData);

      expectDelegationCall(
        mockUserServiceAuth.createUser,
        [userData],
        expectedResult,
        result
      );
    });

    it('should handle errors from UserServiceAuth.createUser', async () => {
      const userData = createMockUserRegistration();
      const expectedError = createUserAlreadyExistsError<PublicUser>();

      mockUserServiceAuth.createUser.mockResolvedValue(expectedError);

      const result = await UserService.createUser(userData);

      expectDelegationCall(
        mockUserServiceAuth.createUser,
        [userData],
        expectedError,
        result
      );
    });
  });

  describe('authenticateUser', () => {
    it('should delegate to UserServiceAuth.authenticateUser', async () => {
      const loginData = createMockUserLogin();
      const mockUser = createMockPublicUser();
      const expectedResult = createSuccessResult({
        user: mockUser,
        requiresVerification: false,
      });

      mockUserServiceAuth.authenticateUser.mockResolvedValue(expectedResult);

      const result = await UserService.authenticateUser(loginData);

      expectDelegationCall(
        mockUserServiceAuth.authenticateUser,
        [loginData],
        expectedResult,
        result
      );
    });

    it('should handle authentication failures', async () => {
      const loginData = createMockUserLogin({ password: 'wrongpassword' });
      const expectedError = createInvalidCredentialsError<{ user: PublicUser; requiresVerification: boolean }>();

      mockUserServiceAuth.authenticateUser.mockResolvedValue(expectedError);

      const result = await UserService.authenticateUser(loginData);

      expectDelegationCall(
        mockUserServiceAuth.authenticateUser,
        [loginData],
        expectedError,
        result
      );
    });
  });

  describe('changePassword', () => {
    it('should delegate to UserServiceAuth.changePassword', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const passwordData = createMockChangePassword();
      const expectedResult = createSuccessResult<void>(undefined);

      mockUserServiceAuth.changePassword.mockResolvedValue(expectedResult);

      const result = await UserService.changePassword(userId, passwordData);

      expectDelegationCall(
        mockUserServiceAuth.changePassword,
        [userId, passwordData],
        expectedResult,
        result
      );
    });

    it('should handle password change failures', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const passwordData = createMockChangePassword({ currentPassword: 'wrongpassword' });
      const expectedError = createInvalidCredentialsError<void>();
      expectedError.error!.message = 'Current password is incorrect';
      expectedError.error!.field = 'currentPassword';

      mockUserServiceAuth.changePassword.mockResolvedValue(expectedError);

      const result = await UserService.changePassword(userId, passwordData);

      expectDelegationCall(
        mockUserServiceAuth.changePassword,
        [userId, passwordData],
        expectedError,
        result
      );
    });
  });

  describe('requestPasswordReset', () => {
    it('should delegate to UserServiceAuth.requestPasswordReset', async () => {
      const resetData = createMockPasswordResetRequest();
      const expectedResult = createSuccessResult({ token: 'reset-token-123' });

      mockUserServiceAuth.requestPasswordReset.mockResolvedValue(expectedResult);

      const result = await UserService.requestPasswordReset(resetData);

      expectDelegationCall(
        mockUserServiceAuth.requestPasswordReset,
        [resetData],
        expectedResult,
        result
      );
    });

    it('should handle password reset request for non-existent user', async () => {
      const resetData = createMockPasswordResetRequest({ email: 'nonexistent@example.com' });
      const expectedResult = createSuccessResult({ token: 'dummy-token' });

      mockUserServiceAuth.requestPasswordReset.mockResolvedValue(expectedResult);

      const result = await UserService.requestPasswordReset(resetData);

      expectDelegationCall(
        mockUserServiceAuth.requestPasswordReset,
        [resetData],
        expectedResult,
        result
      );
    });
  });

  describe('resetPassword', () => {
    it('should delegate to UserServiceAuth.resetPassword', async () => {
      const resetData = createMockPasswordReset();
      const expectedResult = createSuccessResult<void>(undefined);

      mockUserServiceAuth.resetPassword.mockResolvedValue(expectedResult);

      const result = await UserService.resetPassword(resetData);

      expectDelegationCall(
        mockUserServiceAuth.resetPassword,
        [resetData],
        expectedResult,
        result
      );
    });

    it('should handle invalid reset token', async () => {
      const resetData = createMockPasswordReset({ token: 'invalid-token' });
      const expectedError = createInvalidTokenError<void>();
      expectedError.error!.message = 'Invalid or expired reset token';

      mockUserServiceAuth.resetPassword.mockResolvedValue(expectedError);

      const result = await UserService.resetPassword(resetData);

      expectDelegationCall(
        mockUserServiceAuth.resetPassword,
        [resetData],
        expectedError,
        result
      );
    });
  });

  describe('verifyEmail', () => {
    it('should delegate to UserServiceAuth.verifyEmail', async () => {
      const verificationData = createMockEmailVerification();
      const mockUser = createMockPublicUser({ isEmailVerified: true });
      const expectedResult = createSuccessResult(mockUser);

      mockUserServiceAuth.verifyEmail.mockResolvedValue(expectedResult);

      const result = await UserService.verifyEmail(verificationData);

      expectDelegationCall(
        mockUserServiceAuth.verifyEmail,
        [verificationData],
        expectedResult,
        result
      );
    });

    it('should handle invalid verification token', async () => {
      const verificationData = createMockEmailVerification({ token: 'invalid-token' });
      const expectedError = createInvalidTokenError<PublicUser>();
      expectedError.error!.message = 'Invalid or expired verification token';

      mockUserServiceAuth.verifyEmail.mockResolvedValue(expectedError);

      const result = await UserService.verifyEmail(verificationData);

      expectDelegationCall(
        mockUserServiceAuth.verifyEmail,
        [verificationData],
        expectedError,
        result
      );
    });
  });

  describe('resendVerificationEmail', () => {
    it('should delegate to UserServiceAuth.resendVerificationEmail', async () => {
      const email = TEST_EMAIL;
      const expectedResult = createSuccessResult<void>(undefined);

      mockUserServiceAuth.resendVerificationEmail.mockResolvedValue(expectedResult);

      const result = await UserService.resendVerificationEmail(email);

      expectDelegationCall(
        mockUserServiceAuth.resendVerificationEmail,
        [email],
        expectedResult,
        result
      );
    });

    it('should handle resend verification for non-existent user', async () => {
      const email = 'nonexistent@example.com';
      const expectedError = createUserNotFoundError<void>();
      expectedError.error!.field = 'email';

      mockUserServiceAuth.resendVerificationEmail.mockResolvedValue(expectedError);

      const result = await UserService.resendVerificationEmail(email);

      expectDelegationCall(
        mockUserServiceAuth.resendVerificationEmail,
        [email],
        expectedError,
        result
      );
    });
  });
});