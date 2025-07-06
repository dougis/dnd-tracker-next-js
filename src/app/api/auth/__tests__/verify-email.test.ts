import { POST } from '../verify-email/route';
import {
  createMockAuthRequest,
  expectSuccessfulAuthResponse,
  expectValidationError,
  expectAuthError,
  expectServerError,
  setupUserServiceMock,
  runMissingFieldTest,
  runInvalidFormatTest,
  createValidVerificationData,
  createMockVerifiedUser,
} from './auth-test-helpers';
import { setupMockCleanup } from '../../__tests__/shared-api-helpers';

// Mock the UserService
jest.mock('@/lib/services/UserService', () => ({
  UserService: {
    verifyEmail: jest.fn(),
  },
}));

describe('POST /api/auth/verify-email', () => {
  const mockVerificationData = createValidVerificationData();
  const mockUser = createMockVerifiedUser();

  setupMockCleanup();

  describe('Success scenarios', () => {
    it('successfully verifies email with valid token', async () => {
      setupUserServiceMock('verifyEmail', {
        success: true,
        data: mockUser,
      });

      const request = createMockAuthRequest(mockVerificationData);
      const response = await POST(request);
      const data = await expectSuccessfulAuthResponse(response, 'Email verified successfully');

      expect(data.user).toEqual(mockUser);
      expect(require('@/lib/services/UserService').UserService.verifyEmail)
        .toHaveBeenCalledWith(mockVerificationData);
    });
  });

  describe('Validation errors', () => {
    it('returns validation error for missing token', async () => {
      await runMissingFieldTest(POST, mockVerificationData, 'token');
    });

    it('returns validation error for empty token', async () => {
      await runInvalidFormatTest(POST, mockVerificationData, 'token', '');
    });

    it('returns validation error for non-string token', async () => {
      await runInvalidFormatTest(POST, mockVerificationData, 'token', 123);
    });
  });

  describe('Service errors', () => {
    it('handles invalid verification token error', async () => {
      setupUserServiceMock('verifyEmail', {
        success: false,
        error: { message: 'Invalid or expired verification token', statusCode: 400 },
      });

      const request = createMockAuthRequest(mockVerificationData);
      const response = await POST(request);
      await expectAuthError(response, 400, 'Invalid or expired verification token');
    });

    it('handles user not found error', async () => {
      setupUserServiceMock('verifyEmail', {
        success: false,
        error: { message: 'User not found', statusCode: 404 },
      });

      const request = createMockAuthRequest(mockVerificationData);
      const response = await POST(request);
      await expectAuthError(response, 404, 'User not found');
    });

    it('handles already verified email error', async () => {
      setupUserServiceMock('verifyEmail', {
        success: false,
        error: { message: 'Email is already verified', statusCode: 409 },
      });

      const request = createMockAuthRequest(mockVerificationData);
      const response = await POST(request);
      await expectAuthError(response, 409, 'Email is already verified');
    });

    it('handles service error without status code', async () => {
      setupUserServiceMock('verifyEmail', {
        success: false,
        error: { message: 'Service error' },
      });

      const request = createMockAuthRequest(mockVerificationData);
      const response = await POST(request);
      await expectAuthError(response, 400, 'Service error');
    });

    it('handles service error without message', async () => {
      setupUserServiceMock('verifyEmail', {
        success: false,
        error: { statusCode: 500 },
      });

      const request = createMockAuthRequest(mockVerificationData);
      const response = await POST(request);
      await expectAuthError(response, 500, 'Unknown error');
    });
  });

  describe('Unexpected errors', () => {
    it('handles service method throwing an error', async () => {
      setupUserServiceMock('verifyEmail', new Error('Database connection failed'), true);

      const request = createMockAuthRequest(mockVerificationData);
      const response = await POST(request);
      await expectServerError(response);
    });

    it('handles malformed JSON request', async () => {
      const req = createMockAuthRequest({});
      (req.json as jest.Mock).mockRejectedValue(new Error('Invalid JSON'));

      const response = await POST(req);
      await expectServerError(response);
    });
  });

  describe('Edge cases', () => {
    it('handles null request body', async () => {
      const request = createMockAuthRequest(null);
      const response = await POST(request);
      await expectValidationError(response);
    });

    it('handles undefined request body', async () => {
      const request = createMockAuthRequest(undefined);
      const response = await POST(request);
      await expectValidationError(response);
    });

    it('handles extra properties in request body', async () => {
      const dataWithExtra = {
        ...mockVerificationData,
        extraField: 'should be ignored',
        anotherField: 123,
      };

      setupUserServiceMock('verifyEmail', {
        success: true,
        data: mockUser,
      });

      const request = createMockAuthRequest(dataWithExtra);
      const response = await POST(request);
      await expectSuccessfulAuthResponse(response);
      
      // Should only pass validated data to service
      expect(require('@/lib/services/UserService').UserService.verifyEmail)
        .toHaveBeenCalledWith(mockVerificationData);
    });
  });
});
