import { POST } from '../reset-password/route';
import {
  createMockAuthRequest,
  expectSuccessfulAuthResponse,
  expectValidationError,
  expectAuthError,
  expectServerError,
  setupUserServiceMock,
  runMissingFieldTest,
  runInvalidFormatTest,
  createValidResetPasswordData,
} from './auth-test-helpers';
import { setupMockCleanup } from '../../__tests__/shared-api-helpers';

// Mock the UserService
jest.mock('@/lib/services/UserService', () => ({
  UserService: {
    resetPassword: jest.fn(),
  },
}));

describe('POST /api/auth/reset-password', () => {
  const mockResetPasswordData = createValidResetPasswordData();

  setupMockCleanup();

  describe('Success scenarios', () => {
    it('successfully resets password with valid token and passwords', async () => {
      setupUserServiceMock('resetPassword', {
        success: true,
        data: { message: 'Password reset successfully' },
      });

      const request = createMockAuthRequest(mockResetPasswordData);
      const response = await POST(request);
      await expectSuccessfulAuthResponse(response, 'Password reset successfully');

      expect(require('@/lib/services/UserService').UserService.resetPassword)
        .toHaveBeenCalledWith(mockResetPasswordData
      );
    });
  });

  describe('Validation errors', () => {
    it('returns validation error for missing token', async () => {
      await runMissingFieldTest(POST, mockResetPasswordData, 'token');
    });

    it('returns validation error for missing password', async () => {
      await runMissingFieldTest(POST, mockResetPasswordData, 'password');
    });

    it('returns validation error for missing confirmPassword', async () => {
      await runMissingFieldTest(POST, mockResetPasswordData, 'confirmPassword');
    });

    it('returns validation error for password mismatch', async () => {
      const invalidData = {
        ...mockResetPasswordData,
        confirmPassword: 'DifferentPassword123!',
      };

      const request = createMockAuthRequest(invalidData);
      const response = await POST(request);
      await expectValidationError(response);
    });

    it('returns validation error for weak password', async () => {
      const invalidData = {
        ...mockResetPasswordData,
        password: 'weak',
        confirmPassword: 'weak',
      };

      const request = createMockAuthRequest(invalidData);
      const response = await POST(request);
      await expectValidationError(response, 'password');
    });

    it('returns validation error for empty token', async () => {
      await runInvalidFormatTest(POST, mockResetPasswordData, 'token', '');
    });

    it('returns validation error for non-string token', async () => {
      await runInvalidFormatTest(POST, mockResetPasswordData, 'token', 123);
    });
  });

  describe('Service errors', () => {
    it('handles invalid or expired reset token error', async () => {
      setupUserServiceMock('resetPassword', {
        success: false,
        error: { message: 'Invalid or expired reset token', statusCode: 400 },
      });

      const request = createMockAuthRequest(mockResetPasswordData);
      const response = await POST(request);
      await expectAuthError(response, 400, 'Invalid or expired reset token');
    });

    it('handles user not found error', async () => {
      setupUserServiceMock('resetPassword', {
        success: false,
        error: { message: 'User not found', statusCode: 404 },
      });

      const request = createMockAuthRequest(mockResetPasswordData);
      const response = await POST(request);
      await expectAuthError(response, 404, 'User not found');
    });

    it('handles password policy violation error', async () => {
      setupUserServiceMock('resetPassword', {
        success: false,
        error: { message: 'Password does not meet security requirements', statusCode: 422 },
      });

      const request = createMockAuthRequest(mockResetPasswordData);
      const response = await POST(request);
      await expectAuthError(response, 422, 'Password does not meet security requirements');
    });

    it('handles database error', async () => {
      setupUserServiceMock('resetPassword', {
        success: false,
        error: { message: 'Database connection failed', statusCode: 500 },
      });

      const request = createMockAuthRequest(mockResetPasswordData);
      const response = await POST(request);
      await expectAuthError(response, 500, 'Database connection failed');
    });

    it('handles service error without status code', async () => {
      setupUserServiceMock('resetPassword', {
        success: false,
        error: { message: 'Service error' },
      });

      const request = createMockAuthRequest(mockResetPasswordData);
      const response = await POST(request);
      await expectAuthError(response, 400, 'Service error');
    });

    it('handles service error without message', async () => {
      setupUserServiceMock('resetPassword', {
        success: false,
        error: { statusCode: 500 },
      });

      const request = createMockAuthRequest(mockResetPasswordData);
      const response = await POST(request);
      await expectAuthError(response, 500, 'Unknown error');
    });
  });

  describe('Unexpected errors', () => {
    it('handles service method throwing an error', async () => {
      setupUserServiceMock('resetPassword', new Error('Network error'), true);

      const request = createMockAuthRequest(mockResetPasswordData);
      const response = await POST(request);
      await expectServerError(response);
    });

    it('handles malformed JSON request', async () => {
      const req = createMockAuthRequest({});
      (req.json as jest.Mock).mockRejectedValue(new Error('Invalid JSON'));

      const response = await POST(req);
      await expectServerError(response);
    });

    it('handles service returning null', async () => {
      setupUserServiceMock('resetPassword', null);

      const request = createMockAuthRequest(mockResetPasswordData);
      const response = await POST(request);
      await expectAuthError(response, 400, 'Unknown error');
    });
  });

  describe('Edge cases', () => {
    it('handles null request body', async () => {
      const request = createMockAuthRequest(null);
      const response = await POST(request);
      await expectValidationError(response);

      expect(require('@/lib/services/UserService').UserService.resetPassword).not.toHaveBeenCalled();
    });

    it('handles undefined request body', async () => {
      const request = createMockAuthRequest(undefined);
      const response = await POST(request);
      await expectValidationError(response);

      expect(require('@/lib/services/UserService').UserService.resetPassword).not.toHaveBeenCalled();
    });

    it('handles extra properties in request body', async () => {
      const dataWithExtra = {
        ...mockResetPasswordData,
        extraField: 'should be ignored',
        anotherField: 123,
      };

      setupUserServiceMock('resetPassword', {
        success: true,
        data: { message: 'Password reset successfully' },
      });

      const request = createMockAuthRequest(dataWithExtra);
      const response = await POST(request);
      await expectSuccessfulAuthResponse(response, 'Password reset successfully');

      // Should only pass validated data to service
      expect(require('@/lib/services/UserService').UserService.resetPassword).toHaveBeenCalledWith(
        mockResetPasswordData
      );
    });

    it('handles very long token', async () => {
      const longTokenData = {
        ...mockResetPasswordData,
        token: 'a'.repeat(500),
      };

      setupUserServiceMock('resetPassword', {
        success: true,
        data: { message: 'Password reset successfully' },
      });

      const request = createMockAuthRequest(longTokenData);
      const response = await POST(request);
      await expectSuccessfulAuthResponse(response, 'Password reset successfully');

      expect(require('@/lib/services/UserService').UserService.resetPassword).toHaveBeenCalledWith(longTokenData);
    });

    it('handles password with special characters', async () => {
      const specialPasswordData = {
        token: 'valid-token',
        password: 'P@ssw0rd!&*?$', // Only use allowed special characters: @$!%*?&
        confirmPassword: 'P@ssw0rd!&*?$',
      };

      setupUserServiceMock('resetPassword', {
        success: true,
        data: { message: 'Password reset successfully' },
      });

      const request = createMockAuthRequest(specialPasswordData);
      const response = await POST(request);
      await expectSuccessfulAuthResponse(response, 'Password reset successfully');

      expect(require('@/lib/services/UserService').UserService.resetPassword).toHaveBeenCalledWith(
        specialPasswordData
      );
    });
  });
});
