import { NextRequest } from 'next/server';
import { POST } from '../resend-verification/route';
import { UserService } from '@/lib/services/UserService';

// Configure Jest to use our mocks
jest.mock('next/server');

// Mock the UserService
jest.mock('@/lib/services/UserService', () => ({
  UserService: {
    resendVerificationEmail: jest.fn(),
  },
}));

describe('POST /api/auth/resend-verification', () => {
  const mockResendVerificationData = {
    email: 'john.doe@example.com',
  };

  const createMockRequest = (body: any) => {
    const req = new NextRequest('https://example.com');
    (req.json as jest.Mock).mockResolvedValue(body);
    return req;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success scenarios', () => {
    it('successfully resends verification email for valid email', async () => {
      // Mock successful resend verification email
      UserService.resendVerificationEmail = jest.fn().mockResolvedValue({
        success: true,
        data: { message: 'Verification email resent' },
      });

      const request = createMockRequest(mockResendVerificationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        message: 'Verification email resent successfully',
      });
      expect(UserService.resendVerificationEmail).toHaveBeenCalledWith(
        mockResendVerificationData.email
      );
    });
  });

  describe('Validation errors', () => {
    it('returns validation error for missing email', async () => {
      const invalidData = {};

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Validation error');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: 'Required',
          }),
        ])
      );
      expect(UserService.resendVerificationEmail).not.toHaveBeenCalled();
    });

    it('returns validation error for invalid email format', async () => {
      const invalidData = { email: 'invalid-email-format' };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Validation error');
      expect(responseData.errors).toBeDefined();
      expect(responseData.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: expect.stringContaining('email'),
          }),
        ])
      );
      expect(UserService.resendVerificationEmail).not.toHaveBeenCalled();
    });

    it('returns validation error for empty email', async () => {
      const invalidData = { email: '' };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Validation error');
      expect(responseData.errors).toBeDefined();
      expect(UserService.resendVerificationEmail).not.toHaveBeenCalled();
    });

    it('returns validation error for non-string email', async () => {
      const invalidData = { email: 123 };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Validation error');
      expect(responseData.errors).toBeDefined();
      expect(UserService.resendVerificationEmail).not.toHaveBeenCalled();
    });

    it('returns validation error for email with invalid domain', async () => {
      const invalidData = { email: 'test@invalid' };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Validation error');
      expect(responseData.errors).toBeDefined();
      expect(UserService.resendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  describe('Service errors', () => {
    it('handles user not found error', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'User not found',
          statusCode: 404,
        },
      };

      UserService.resendVerificationEmail = jest
        .fn()
        .mockResolvedValue(mockError);

      const request = createMockRequest(mockResendVerificationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData).toEqual({
        success: false,
        message: 'User not found',
      });
      expect(UserService.resendVerificationEmail).toHaveBeenCalledWith(
        mockResendVerificationData.email
      );
    });

    it('handles already verified email error', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'Email is already verified',
          statusCode: 409,
        },
      };

      UserService.resendVerificationEmail = jest
        .fn()
        .mockResolvedValue(mockError);

      const request = createMockRequest(mockResendVerificationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(409);
      expect(responseData).toEqual({
        success: false,
        message: 'Email is already verified',
      });
      expect(UserService.resendVerificationEmail).toHaveBeenCalledWith(
        mockResendVerificationData.email
      );
    });

    it('handles rate limiting error', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'Too many verification emails sent. Please try again later.',
          statusCode: 429,
        },
      };

      UserService.resendVerificationEmail = jest
        .fn()
        .mockResolvedValue(mockError);

      const request = createMockRequest(mockResendVerificationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(429);
      expect(responseData).toEqual({
        success: false,
        message: 'Too many verification emails sent. Please try again later.',
      });
      expect(UserService.resendVerificationEmail).toHaveBeenCalledWith(
        mockResendVerificationData.email
      );
    });

    it('handles email service failure error', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'Failed to send verification email',
          statusCode: 503,
        },
      };

      UserService.resendVerificationEmail = jest
        .fn()
        .mockResolvedValue(mockError);

      const request = createMockRequest(mockResendVerificationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(503);
      expect(responseData).toEqual({
        success: false,
        message: 'Failed to send verification email',
      });
      expect(UserService.resendVerificationEmail).toHaveBeenCalledWith(
        mockResendVerificationData.email
      );
    });

    it('handles database error', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'Database connection failed',
          statusCode: 500,
        },
      };

      UserService.resendVerificationEmail = jest
        .fn()
        .mockResolvedValue(mockError);

      const request = createMockRequest(mockResendVerificationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        success: false,
        message: 'Database connection failed',
      });
      expect(UserService.resendVerificationEmail).toHaveBeenCalledWith(
        mockResendVerificationData.email
      );
    });

    it('handles service error without status code', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'Service error',
        },
      };

      UserService.resendVerificationEmail = jest
        .fn()
        .mockResolvedValue(mockError);

      const request = createMockRequest(mockResendVerificationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        success: false,
        message: 'Service error',
      });
      expect(UserService.resendVerificationEmail).toHaveBeenCalledWith(
        mockResendVerificationData.email
      );
    });

    it('handles service error without message', async () => {
      const mockError = {
        success: false,
        error: {
          statusCode: 500,
        },
      };

      UserService.resendVerificationEmail = jest
        .fn()
        .mockResolvedValue(mockError);

      const request = createMockRequest(mockResendVerificationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        success: false,
        message: 'Unknown error',
      });
      expect(UserService.resendVerificationEmail).toHaveBeenCalledWith(
        mockResendVerificationData.email
      );
    });
  });

  describe('Unexpected errors', () => {
    it('handles service method throwing an error', async () => {
      UserService.resendVerificationEmail = jest
        .fn()
        .mockRejectedValue(new Error('Network error'));

      const request = createMockRequest(mockResendVerificationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        success: false,
        message: 'An unexpected error occurred',
      });
      expect(UserService.resendVerificationEmail).toHaveBeenCalledWith(
        mockResendVerificationData.email
      );
    });

    it('handles malformed JSON request', async () => {
      const req = new NextRequest('https://example.com');
      (req.json as jest.Mock).mockRejectedValue(new Error('Invalid JSON'));

      const response = await POST(req);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        success: false,
        message: 'An unexpected error occurred',
      });
      expect(UserService.resendVerificationEmail).not.toHaveBeenCalled();
    });

    it('handles service returning null', async () => {
      UserService.resendVerificationEmail = jest.fn().mockResolvedValue(null);

      const request = createMockRequest(mockResendVerificationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        success: false,
        message: 'An unexpected error occurred',
      });
    });

    it('handles service returning undefined', async () => {
      UserService.resendVerificationEmail = jest
        .fn()
        .mockResolvedValue(undefined);

      const request = createMockRequest(mockResendVerificationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        success: false,
        message: 'An unexpected error occurred',
      });
    });
  });

  describe('Edge cases', () => {
    it('handles null request body', async () => {
      const request = createMockRequest(null);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Validation error');
      expect(UserService.resendVerificationEmail).not.toHaveBeenCalled();
    });

    it('handles undefined request body', async () => {
      const request = createMockRequest(undefined);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Validation error');
      expect(UserService.resendVerificationEmail).not.toHaveBeenCalled();
    });

    it('handles extra properties in request body', async () => {
      const dataWithExtra = {
        ...mockResendVerificationData,
        extraField: 'should be ignored',
        anotherField: 123,
      };

      UserService.resendVerificationEmail = jest.fn().mockResolvedValue({
        success: true,
        data: { message: 'Verification email resent' },
      });

      const request = createMockRequest(dataWithExtra);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      // Should only pass the email to service (getUserByEmailSchema extracts only email)
      expect(UserService.resendVerificationEmail).toHaveBeenCalledWith(
        mockResendVerificationData.email
      );
    });

    it('handles very long email address', async () => {
      const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
      const dataWithLongEmail = { email: longEmail };

      UserService.resendVerificationEmail = jest.fn().mockResolvedValue({
        success: true,
        data: { message: 'Verification email resent' },
      });

      const request = createMockRequest(dataWithLongEmail);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(UserService.resendVerificationEmail).toHaveBeenCalledWith(
        longEmail
      );
    });

    it('handles email with unicode characters as validation error', async () => {
      const unicodeEmail = 'tëst@ëxämplë.com';
      const dataWithUnicodeEmail = { email: unicodeEmail };

      const request = createMockRequest(dataWithUnicodeEmail);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Validation error');
      expect(UserService.resendVerificationEmail).not.toHaveBeenCalled();
    });

    it('handles email with plus addressing', async () => {
      const plusEmail = 'test+tag@example.com';
      const dataWithPlusEmail = { email: plusEmail };

      UserService.resendVerificationEmail = jest.fn().mockResolvedValue({
        success: true,
        data: { message: 'Verification email resent' },
      });

      const request = createMockRequest(dataWithPlusEmail);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(UserService.resendVerificationEmail).toHaveBeenCalledWith(
        plusEmail
      );
    });
  });
});
