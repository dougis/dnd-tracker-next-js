import { NextRequest } from 'next/server';
import { POST } from '../reset-password-request/route';
import { UserService } from '@/lib/services/UserService';

// Configure Jest to use our mocks
jest.mock('next/server');

// Mock the UserService
jest.mock('@/lib/services/UserService', () => ({
  UserService: {
    requestPasswordReset: jest.fn(),
  },
}));

describe('POST /api/auth/reset-password-request', () => {
  const mockResetRequestData = {
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
    it('successfully requests password reset for valid email', async () => {
      // Mock successful password reset request
      UserService.requestPasswordReset = jest.fn().mockResolvedValue({
        success: true,
        data: { message: 'Reset email sent' },
      });

      const request = createMockRequest(mockResetRequestData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        message: 'Password reset email sent successfully',
      });
      expect(UserService.requestPasswordReset).toHaveBeenCalledWith(mockResetRequestData);
    });

    it('successfully handles request for non-existent email (security)', async () => {
      // For security, the service should return success even for non-existent emails
      UserService.requestPasswordReset = jest.fn().mockResolvedValue({
        success: true,
        data: { message: 'Reset email sent' },
      });

      const nonExistentEmail = { email: 'nonexistent@example.com' };
      const request = createMockRequest(nonExistentEmail);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        message: 'Password reset email sent successfully',
      });
      expect(UserService.requestPasswordReset).toHaveBeenCalledWith(nonExistentEmail);
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
      expect(UserService.requestPasswordReset).not.toHaveBeenCalled();
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
      expect(UserService.requestPasswordReset).not.toHaveBeenCalled();
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
      expect(UserService.requestPasswordReset).not.toHaveBeenCalled();
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
      expect(UserService.requestPasswordReset).not.toHaveBeenCalled();
    });

    it('returns validation error for email with invalid characters', async () => {
      const invalidData = { email: 'test@' };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Validation error');
      expect(responseData.errors).toBeDefined();
      expect(UserService.requestPasswordReset).not.toHaveBeenCalled();
    });
  });

  describe('Service errors', () => {
    it('handles rate limiting error', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'Too many password reset requests. Please try again later.',
          statusCode: 429,
        },
      };

      UserService.requestPasswordReset = jest.fn().mockResolvedValue(mockError);

      const request = createMockRequest(mockResetRequestData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(429);
      expect(responseData).toEqual({
        success: false,
        message: 'Too many password reset requests. Please try again later.',
      });
      expect(UserService.requestPasswordReset).toHaveBeenCalledWith(mockResetRequestData);
    });

    it('handles email service failure error', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'Failed to send email',
          statusCode: 503,
        },
      };

      UserService.requestPasswordReset = jest.fn().mockResolvedValue(mockError);

      const request = createMockRequest(mockResetRequestData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(503);
      expect(responseData).toEqual({
        success: false,
        message: 'Failed to send email',
      });
      expect(UserService.requestPasswordReset).toHaveBeenCalledWith(mockResetRequestData);
    });

    it('handles database error', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'Database connection failed',
          statusCode: 500,
        },
      };

      UserService.requestPasswordReset = jest.fn().mockResolvedValue(mockError);

      const request = createMockRequest(mockResetRequestData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        success: false,
        message: 'Database connection failed',
      });
      expect(UserService.requestPasswordReset).toHaveBeenCalledWith(mockResetRequestData);
    });

    it('handles service error without status code', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'Service error',
        },
      };

      UserService.requestPasswordReset = jest.fn().mockResolvedValue(mockError);

      const request = createMockRequest(mockResetRequestData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        success: false,
        message: 'Service error',
      });
      expect(UserService.requestPasswordReset).toHaveBeenCalledWith(mockResetRequestData);
    });

    it('handles service error without message', async () => {
      const mockError = {
        success: false,
        error: {
          statusCode: 500,
        },
      };

      UserService.requestPasswordReset = jest.fn().mockResolvedValue(mockError);

      const request = createMockRequest(mockResetRequestData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        success: false,
        message: 'Unknown error',
      });
      expect(UserService.requestPasswordReset).toHaveBeenCalledWith(mockResetRequestData);
    });
  });

  describe('Unexpected errors', () => {
    it('handles service method throwing an error', async () => {
      UserService.requestPasswordReset = jest
        .fn()
        .mockRejectedValue(new Error('Network error'));

      const request = createMockRequest(mockResetRequestData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        success: false,
        message: 'An unexpected error occurred',
      });
      expect(UserService.requestPasswordReset).toHaveBeenCalledWith(mockResetRequestData);
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
      expect(UserService.requestPasswordReset).not.toHaveBeenCalled();
    });

    it('handles service returning null', async () => {
      UserService.requestPasswordReset = jest.fn().mockResolvedValue(null);

      const request = createMockRequest(mockResetRequestData);
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
      expect(UserService.requestPasswordReset).not.toHaveBeenCalled();
    });

    it('handles undefined request body', async () => {
      const request = createMockRequest(undefined);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Validation error');
      expect(UserService.requestPasswordReset).not.toHaveBeenCalled();
    });

    it('handles extra properties in request body', async () => {
      const dataWithExtra = {
        ...mockResetRequestData,
        extraField: 'should be ignored',
        anotherField: 123,
      };

      UserService.requestPasswordReset = jest.fn().mockResolvedValue({
        success: true,
        data: { message: 'Reset email sent' },
      });

      const request = createMockRequest(dataWithExtra);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      // Should only pass validated data to service
      expect(UserService.requestPasswordReset).toHaveBeenCalledWith(mockResetRequestData);
    });

    it('handles very long email address', async () => {
      const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
      const dataWithLongEmail = { email: longEmail };

      UserService.requestPasswordReset = jest.fn().mockResolvedValue({
        success: true,
        data: { message: 'Reset email sent' },
      });

      const request = createMockRequest(dataWithLongEmail);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(UserService.requestPasswordReset).toHaveBeenCalledWith(dataWithLongEmail);
    });
  });
});
