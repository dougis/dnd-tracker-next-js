import { NextRequest } from 'next/server';
import { POST } from '../reset-password/route';
import { UserService } from '@/lib/services/UserService';

// Configure Jest to use our mocks
jest.mock('next/server');

// Mock the UserService
jest.mock('@/lib/services/UserService', () => ({
  UserService: {
    resetPassword: jest.fn(),
  },
}));

describe('POST /api/auth/reset-password', () => {
  const mockResetPasswordData = {
    token: 'valid-reset-token-123',
    password: 'NewPassword123!',
    confirmPassword: 'NewPassword123!',
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
    it('successfully resets password with valid token and passwords', async () => {
      // Mock successful password reset
      UserService.resetPassword = jest.fn().mockResolvedValue({
        success: true,
        data: { message: 'Password reset successfully' },
      });

      const request = createMockRequest(mockResetPasswordData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        message: 'Password reset successfully',
      });
      expect(UserService.resetPassword).toHaveBeenCalledWith(mockResetPasswordData);
    });
  });

  describe('Validation errors', () => {
    it('returns validation error for missing token', async () => {
      const invalidData = {
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

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
      expect(UserService.resetPassword).not.toHaveBeenCalled();
    });

    it('returns validation error for missing password', async () => {
      const invalidData = {
        token: 'valid-token',
        confirmPassword: 'NewPassword123!',
      };

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
            field: 'password',
            message: 'Required',
          }),
        ])
      );
      expect(UserService.resetPassword).not.toHaveBeenCalled();
    });

    it('returns validation error for missing confirmPassword', async () => {
      const invalidData = {
        token: 'valid-token',
        password: 'NewPassword123!',
      };

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
            field: 'confirmPassword',
            message: 'Required',
          }),
        ])
      );
      expect(UserService.resetPassword).not.toHaveBeenCalled();
    });

    it('returns validation error for password mismatch', async () => {
      const invalidData = {
        token: 'valid-token',
        password: 'NewPassword123!',
        confirmPassword: 'DifferentPassword123!',
      };

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
            field: 'confirmPassword',
            message: 'Passwords do not match',
          }),
        ])
      );
      expect(UserService.resetPassword).not.toHaveBeenCalled();
    });

    it('returns validation error for weak password', async () => {
      const invalidData = {
        token: 'valid-token',
        password: 'weak',
        confirmPassword: 'weak',
      };

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
            field: 'password',
            message: 'Password must be at least 8 characters long',
          }),
        ])
      );
      expect(UserService.resetPassword).not.toHaveBeenCalled();
    });

    it('returns validation error for empty token', async () => {
      const invalidData = {
        token: '',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Validation error');
      expect(responseData.errors).toBeDefined();
      expect(UserService.resetPassword).not.toHaveBeenCalled();
    });

    it('returns validation error for non-string token', async () => {
      const invalidData = {
        token: 123,
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Validation error');
      expect(responseData.errors).toBeDefined();
      expect(UserService.resetPassword).not.toHaveBeenCalled();
    });
  });

  describe('Service errors', () => {
    it('handles invalid or expired reset token error', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'Invalid or expired reset token',
          statusCode: 400,
        },
      };

      UserService.resetPassword = jest.fn().mockResolvedValue(mockError);

      const request = createMockRequest(mockResetPasswordData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        success: false,
        message: 'Invalid or expired reset token',
      });
      expect(UserService.resetPassword).toHaveBeenCalledWith(mockResetPasswordData);
    });

    it('handles user not found error', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'User not found',
          statusCode: 404,
        },
      };

      UserService.resetPassword = jest.fn().mockResolvedValue(mockError);

      const request = createMockRequest(mockResetPasswordData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData).toEqual({
        success: false,
        message: 'User not found',
      });
      expect(UserService.resetPassword).toHaveBeenCalledWith(mockResetPasswordData);
    });

    it('handles password policy violation error', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'Password does not meet security requirements',
          statusCode: 422,
        },
      };

      UserService.resetPassword = jest.fn().mockResolvedValue(mockError);

      const request = createMockRequest(mockResetPasswordData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(422);
      expect(responseData).toEqual({
        success: false,
        message: 'Password does not meet security requirements',
      });
      expect(UserService.resetPassword).toHaveBeenCalledWith(mockResetPasswordData);
    });

    it('handles database error', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'Database connection failed',
          statusCode: 500,
        },
      };

      UserService.resetPassword = jest.fn().mockResolvedValue(mockError);

      const request = createMockRequest(mockResetPasswordData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        success: false,
        message: 'Database connection failed',
      });
      expect(UserService.resetPassword).toHaveBeenCalledWith(mockResetPasswordData);
    });

    it('handles service error without status code', async () => {
      const mockError = {
        success: false,
        error: {
          message: 'Service error',
        },
      };

      UserService.resetPassword = jest.fn().mockResolvedValue(mockError);

      const request = createMockRequest(mockResetPasswordData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        success: false,
        message: 'Service error',
      });
      expect(UserService.resetPassword).toHaveBeenCalledWith(mockResetPasswordData);
    });

    it('handles service error without message', async () => {
      const mockError = {
        success: false,
        error: {
          statusCode: 500,
        },
      };

      UserService.resetPassword = jest.fn().mockResolvedValue(mockError);

      const request = createMockRequest(mockResetPasswordData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        success: false,
        message: 'Unknown error',
      });
      expect(UserService.resetPassword).toHaveBeenCalledWith(mockResetPasswordData);
    });
  });

  describe('Unexpected errors', () => {
    it('handles service method throwing an error', async () => {
      UserService.resetPassword = jest
        .fn()
        .mockRejectedValue(new Error('Network error'));

      const request = createMockRequest(mockResetPasswordData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        success: false,
        message: 'An unexpected error occurred',
      });
      expect(UserService.resetPassword).toHaveBeenCalledWith(mockResetPasswordData);
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
      expect(UserService.resetPassword).not.toHaveBeenCalled();
    });

    it('handles service returning null', async () => {
      UserService.resetPassword = jest.fn().mockResolvedValue(null);

      const request = createMockRequest(mockResetPasswordData);
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
      expect(UserService.resetPassword).not.toHaveBeenCalled();
    });

    it('handles undefined request body', async () => {
      const request = createMockRequest(undefined);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Validation error');
      expect(UserService.resetPassword).not.toHaveBeenCalled();
    });

    it('handles extra properties in request body', async () => {
      const dataWithExtra = {
        ...mockResetPasswordData,
        extraField: 'should be ignored',
        anotherField: 123,
      };

      UserService.resetPassword = jest.fn().mockResolvedValue({
        success: true,
        data: { message: 'Password reset successfully' },
      });

      const request = createMockRequest(dataWithExtra);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      // Should only pass validated data to service
      expect(UserService.resetPassword).toHaveBeenCalledWith(mockResetPasswordData);
    });

    it('handles very long token', async () => {
      const longTokenData = {
        ...mockResetPasswordData,
        token: 'a'.repeat(500),
      };

      UserService.resetPassword = jest.fn().mockResolvedValue({
        success: true,
        data: { message: 'Password reset successfully' },
      });

      const request = createMockRequest(longTokenData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(UserService.resetPassword).toHaveBeenCalledWith(longTokenData);
    });

    it('handles password with special characters', async () => {
      const specialPasswordData = {
        token: 'valid-token',
        password: 'P@ssw0rd!@#$%^&*()',
        confirmPassword: 'P@ssw0rd!@#$%^&*()',
      };

      UserService.resetPassword = jest.fn().mockResolvedValue({
        success: true,
        data: { message: 'Password reset successfully' },
      });

      const request = createMockRequest(specialPasswordData);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(UserService.resetPassword).toHaveBeenCalledWith(specialPasswordData);
    });
  });
});
