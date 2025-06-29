import { NextRequest } from 'next/server';
import { POST } from '../verify-email/route';
import { UserService } from '@/lib/services/UserService';

// Configure Jest to use our mocks
jest.mock('next/server');

// Mock the UserService
jest.mock('@/lib/services/UserService', () => ({
  UserService: {
    verifyEmail: jest.fn(),
  },
}));

describe('POST /api/auth/verify-email', () => {
  const mockVerificationData = {
    token: 'valid-verification-token-123',
  };

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'john.doe@example.com',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    subscriptionTier: 'free',
    isEmailVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
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
    it('successfully verifies email with valid token', async () => {
      // Mock successful verification
      UserService.verifyEmail = jest.fn().mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const request = createMockRequest(mockVerificationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        message: 'Email verified successfully',
        user: mockUser,
      });
      expect(UserService.verifyEmail).toHaveBeenCalledWith(mockVerificationData);
    });
  });

  describe('Validation errors', () => {
    it('returns validation error for missing token', async () => {
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
            field: 'token',
            message: 'Required',
          }),
        ])
      );
      expect(UserService.verifyEmail).not.toHaveBeenCalled();
    });

    it('returns validation error for empty token', async () => {
      const invalidData = { token: '' };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Validation error');
      expect(responseData.errors).toBeDefined();
      expect(UserService.verifyEmail).not.toHaveBeenCalled();
    });

    it('returns validation error for non-string token', async () => {
      const invalidData = { token: 123 };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Validation error');
      expect(responseData.errors).toBeDefined();
      expect(UserService.verifyEmail).not.toHaveBeenCalled();
    });
  });

  describe('Service errors', () => {
    it('handles invalid verification token error', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'Invalid or expired verification token',
          statusCode: 400,
        },
      };

      UserService.verifyEmail = jest.fn().mockResolvedValue(mockError);

      const request = createMockRequest(mockVerificationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        success: false,
        message: 'Invalid or expired verification token',
      });
      expect(UserService.verifyEmail).toHaveBeenCalledWith(mockVerificationData);
    });

    it('handles user not found error', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'User not found',
          statusCode: 404,
        },
      };

      UserService.verifyEmail = jest.fn().mockResolvedValue(mockError);

      const request = createMockRequest(mockVerificationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData).toEqual({
        success: false,
        message: 'User not found',
      });
      expect(UserService.verifyEmail).toHaveBeenCalledWith(mockVerificationData);
    });

    it('handles already verified email error', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'Email is already verified',
          statusCode: 409,
        },
      };

      UserService.verifyEmail = jest.fn().mockResolvedValue(mockError);

      const request = createMockRequest(mockVerificationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(409);
      expect(responseData).toEqual({
        success: false,
        message: 'Email is already verified',
      });
      expect(UserService.verifyEmail).toHaveBeenCalledWith(mockVerificationData);
    });

    it('handles service error without status code', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'Service error',
        },
      };

      UserService.verifyEmail = jest.fn().mockResolvedValue(mockError);

      const request = createMockRequest(mockVerificationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        success: false,
        message: 'Service error',
      });
      expect(UserService.verifyEmail).toHaveBeenCalledWith(mockVerificationData);
    });

    it('handles service error without message', async () => {
      const mockError = {
        success: false,
        error: {
          statusCode: 500,
        },
      };

      UserService.verifyEmail = jest.fn().mockResolvedValue(mockError);

      const request = createMockRequest(mockVerificationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        success: false,
        message: 'Unknown error',
      });
      expect(UserService.verifyEmail).toHaveBeenCalledWith(mockVerificationData);
    });
  });

  describe('Unexpected errors', () => {
    it('handles service method throwing an error', async () => {
      UserService.verifyEmail = jest
        .fn()
        .mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest(mockVerificationData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        success: false,
        message: 'An unexpected error occurred',
      });
      expect(UserService.verifyEmail).toHaveBeenCalledWith(mockVerificationData);
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
      expect(UserService.verifyEmail).not.toHaveBeenCalled();
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
      expect(UserService.verifyEmail).not.toHaveBeenCalled();
    });

    it('handles undefined request body', async () => {
      const request = createMockRequest(undefined);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Validation error');
      expect(UserService.verifyEmail).not.toHaveBeenCalled();
    });

    it('handles extra properties in request body', async () => {
      const dataWithExtra = {
        ...mockVerificationData,
        extraField: 'should be ignored',
        anotherField: 123,
      };

      UserService.verifyEmail = jest.fn().mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const request = createMockRequest(dataWithExtra);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      // Should only pass validated data to service
      expect(UserService.verifyEmail).toHaveBeenCalledWith(mockVerificationData);
    });
  });
});
