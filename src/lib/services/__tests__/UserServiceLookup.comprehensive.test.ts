import { UserServiceLookup } from '../UserServiceLookup';
import User from '../../models/User';
import {
  UserNotFoundError,
  TokenInvalidError,
} from '../UserServiceErrors';

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../UserServiceResponseHelpers');

const MockedUser = jest.mocked(User);

describe('UserServiceLookup - Comprehensive Tests', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockEmail = 'test@example.com';
  const mockToken = 'test-token-123';
  
  const mockUserInstance = {
    _id: mockUserId,
    email: mockEmail,
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    subscriptionTier: 'free',
    isEmailVerified: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock UserServiceResponseHelpers
    const mockResponseHelpers = {
      createSuccessResponse: jest.fn().mockImplementation((data) => ({ success: true, data })),
      createErrorResponse: jest.fn().mockImplementation((error) => ({ 
        success: false, 
        error: { message: error.message, code: error.code, statusCode: error.statusCode } 
      })),
    };
    require('../UserServiceResponseHelpers').UserServiceResponseHelpers = mockResponseHelpers;
  });

  describe('findUserOrError', () => {
    it('should return success response when user is found', async () => {
      MockedUser.findById.mockResolvedValue(mockUserInstance as any);

      const result = await UserServiceLookup.findUserOrError(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUserInstance);
      expect(MockedUser.findById).toHaveBeenCalledWith(mockUserId);
    });

    it('should return error response when user is not found', async () => {
      MockedUser.findById.mockResolvedValue(null);

      const result = await UserServiceLookup.findUserOrError(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
      expect(result.error?.statusCode).toBe(404);
    });

    it('should handle database errors', async () => {
      MockedUser.findById.mockRejectedValue(new Error('Database connection failed'));

      await expect(UserServiceLookup.findUserOrError(mockUserId)).rejects.toThrow('Database connection failed');
    });

    it('should handle empty user ID', async () => {
      MockedUser.findById.mockResolvedValue(null);

      const result = await UserServiceLookup.findUserOrError('');

      expect(result.success).toBe(false);
      expect(MockedUser.findById).toHaveBeenCalledWith('');
    });

    it('should handle invalid user ID format', async () => {
      MockedUser.findById.mockRejectedValue(new Error('Invalid ObjectId'));

      await expect(UserServiceLookup.findUserOrError('invalid-id')).rejects.toThrow('Invalid ObjectId');
    });
  });

  describe('findUserByIdOrThrow', () => {
    it('should return user when found', async () => {
      MockedUser.findById.mockResolvedValue(mockUserInstance as any);

      const result = await UserServiceLookup.findUserByIdOrThrow(mockUserId);

      expect(result).toEqual(mockUserInstance);
      expect(MockedUser.findById).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw UserNotFoundError when user is not found', async () => {
      MockedUser.findById.mockResolvedValue(null);

      await expect(UserServiceLookup.findUserByIdOrThrow(mockUserId)).rejects.toThrow(UserNotFoundError);
      await expect(UserServiceLookup.findUserByIdOrThrow(mockUserId)).rejects.toThrow(`User not found: ${mockUserId}`);
    });

    it('should handle database errors', async () => {
      MockedUser.findById.mockRejectedValue(new Error('Database error'));

      await expect(UserServiceLookup.findUserByIdOrThrow(mockUserId)).rejects.toThrow('Database error');
    });

    it('should handle null user ID', async () => {
      MockedUser.findById.mockResolvedValue(null);

      await expect(UserServiceLookup.findUserByIdOrThrow(null as any)).rejects.toThrow(UserNotFoundError);
    });

    it('should handle undefined user ID', async () => {
      MockedUser.findById.mockResolvedValue(null);

      await expect(UserServiceLookup.findUserByIdOrThrow(undefined as any)).rejects.toThrow(UserNotFoundError);
    });
  });

  describe('findUserByEmailOrThrow', () => {
    it('should return user when found by email', async () => {
      MockedUser.findByEmail.mockResolvedValue(mockUserInstance as any);

      const result = await UserServiceLookup.findUserByEmailOrThrow(mockEmail);

      expect(result).toEqual(mockUserInstance);
      expect(MockedUser.findByEmail).toHaveBeenCalledWith(mockEmail);
    });

    it('should throw UserNotFoundError when user is not found', async () => {
      MockedUser.findByEmail.mockResolvedValue(null);

      await expect(UserServiceLookup.findUserByEmailOrThrow(mockEmail)).rejects.toThrow(UserNotFoundError);
      await expect(UserServiceLookup.findUserByEmailOrThrow(mockEmail)).rejects.toThrow(`User not found: ${mockEmail}`);
    });

    it('should handle database errors', async () => {
      MockedUser.findByEmail.mockRejectedValue(new Error('Database connection lost'));

      await expect(UserServiceLookup.findUserByEmailOrThrow(mockEmail)).rejects.toThrow('Database connection lost');
    });

    it('should handle empty email', async () => {
      MockedUser.findByEmail.mockResolvedValue(null);

      await expect(UserServiceLookup.findUserByEmailOrThrow('')).rejects.toThrow(UserNotFoundError);
    });

    it('should handle invalid email format', async () => {
      MockedUser.findByEmail.mockResolvedValue(null);

      await expect(UserServiceLookup.findUserByEmailOrThrow('invalid-email')).rejects.toThrow(UserNotFoundError);
    });

    it('should handle case sensitivity in email', async () => {
      MockedUser.findByEmail.mockResolvedValue(mockUserInstance as any);

      const result = await UserServiceLookup.findUserByEmailOrThrow('TEST@EXAMPLE.COM');

      expect(result).toEqual(mockUserInstance);
      expect(MockedUser.findByEmail).toHaveBeenCalledWith('TEST@EXAMPLE.COM');
    });
  });

  describe('findUserByEmailNullable', () => {
    it('should return user when found by email', async () => {
      MockedUser.findByEmail.mockResolvedValue(mockUserInstance as any);

      const result = await UserServiceLookup.findUserByEmailNullable(mockEmail);

      expect(result).toEqual(mockUserInstance);
      expect(MockedUser.findByEmail).toHaveBeenCalledWith(mockEmail);
    });

    it('should return null when user is not found', async () => {
      MockedUser.findByEmail.mockResolvedValue(null);

      const result = await UserServiceLookup.findUserByEmailNullable(mockEmail);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      MockedUser.findByEmail.mockRejectedValue(new Error('Database timeout'));

      await expect(UserServiceLookup.findUserByEmailNullable(mockEmail)).rejects.toThrow('Database timeout');
    });

    it('should handle empty email gracefully', async () => {
      MockedUser.findByEmail.mockResolvedValue(null);

      const result = await UserServiceLookup.findUserByEmailNullable('');

      expect(result).toBeNull();
      expect(MockedUser.findByEmail).toHaveBeenCalledWith('');
    });

    it('should handle undefined return from database', async () => {
      MockedUser.findByEmail.mockResolvedValue(undefined as any);

      const result = await UserServiceLookup.findUserByEmailNullable(mockEmail);

      expect(result).toBeUndefined();
    });
  });

  describe('findUserByResetTokenOrThrow', () => {
    it('should return user when found by reset token', async () => {
      MockedUser.findByResetToken.mockResolvedValue(mockUserInstance as any);

      const result = await UserServiceLookup.findUserByResetTokenOrThrow(mockToken);

      expect(result).toEqual(mockUserInstance);
      expect(MockedUser.findByResetToken).toHaveBeenCalledWith(mockToken);
    });

    it('should throw TokenInvalidError when user is not found', async () => {
      MockedUser.findByResetToken.mockResolvedValue(null);

      await expect(UserServiceLookup.findUserByResetTokenOrThrow(mockToken)).rejects.toThrow(TokenInvalidError);
      await expect(UserServiceLookup.findUserByResetTokenOrThrow(mockToken)).rejects.toThrow('Password reset token is invalid or expired');
    });

    it('should handle database errors', async () => {
      MockedUser.findByResetToken.mockRejectedValue(new Error('Connection failed'));

      await expect(UserServiceLookup.findUserByResetTokenOrThrow(mockToken)).rejects.toThrow('Connection failed');
    });

    it('should handle empty token', async () => {
      MockedUser.findByResetToken.mockResolvedValue(null);

      await expect(UserServiceLookup.findUserByResetTokenOrThrow('')).rejects.toThrow(TokenInvalidError);
    });

    it('should handle expired token scenario', async () => {
      MockedUser.findByResetToken.mockResolvedValue(null);

      await expect(UserServiceLookup.findUserByResetTokenOrThrow('expired-token')).rejects.toThrow(TokenInvalidError);
    });

    it('should handle malformed token', async () => {
      MockedUser.findByResetToken.mockRejectedValue(new Error('Invalid token format'));

      await expect(UserServiceLookup.findUserByResetTokenOrThrow('malformed-token')).rejects.toThrow('Invalid token format');
    });
  });

  describe('findUserByVerificationTokenOrThrow', () => {
    it('should return user when found by verification token', async () => {
      MockedUser.findByVerificationToken.mockResolvedValue(mockUserInstance as any);

      const result = await UserServiceLookup.findUserByVerificationTokenOrThrow(mockToken);

      expect(result).toEqual(mockUserInstance);
      expect(MockedUser.findByVerificationToken).toHaveBeenCalledWith(mockToken);
    });

    it('should throw TokenInvalidError when user is not found', async () => {
      MockedUser.findByVerificationToken.mockResolvedValue(null);

      await expect(UserServiceLookup.findUserByVerificationTokenOrThrow(mockToken)).rejects.toThrow(TokenInvalidError);
      await expect(UserServiceLookup.findUserByVerificationTokenOrThrow(mockToken)).rejects.toThrow('Email verification token is invalid or expired');
    });

    it('should handle database errors', async () => {
      MockedUser.findByVerificationToken.mockRejectedValue(new Error('Query failed'));

      await expect(UserServiceLookup.findUserByVerificationTokenOrThrow(mockToken)).rejects.toThrow('Query failed');
    });

    it('should handle empty verification token', async () => {
      MockedUser.findByVerificationToken.mockResolvedValue(null);

      await expect(UserServiceLookup.findUserByVerificationTokenOrThrow('')).rejects.toThrow(TokenInvalidError);
    });

    it('should handle null token', async () => {
      MockedUser.findByVerificationToken.mockResolvedValue(null);

      await expect(UserServiceLookup.findUserByVerificationTokenOrThrow(null as any)).rejects.toThrow(TokenInvalidError);
    });

    it('should handle undefined token', async () => {
      MockedUser.findByVerificationToken.mockResolvedValue(null);

      await expect(UserServiceLookup.findUserByVerificationTokenOrThrow(undefined as any)).rejects.toThrow(TokenInvalidError);
    });
  });

  describe('userExists', () => {
    it('should return true when user exists', async () => {
      MockedUser.findById.mockResolvedValue(mockUserInstance as any);

      const result = await UserServiceLookup.userExists(mockUserId);

      expect(result).toBe(true);
      expect(MockedUser.findById).toHaveBeenCalledWith(mockUserId);
    });

    it('should return false when user does not exist', async () => {
      MockedUser.findById.mockResolvedValue(null);

      const result = await UserServiceLookup.userExists(mockUserId);

      expect(result).toBe(false);
    });

    it('should re-throw non-UserNotFoundError errors', async () => {
      MockedUser.findById.mockRejectedValue(new Error('Database connection failed'));

      await expect(UserServiceLookup.userExists(mockUserId)).rejects.toThrow('Database connection failed');
    });

    it('should handle empty user ID', async () => {
      MockedUser.findById.mockResolvedValue(null);

      const result = await UserServiceLookup.userExists('');

      expect(result).toBe(false);
    });

    it('should handle invalid user ID format', async () => {
      MockedUser.findById.mockRejectedValue(new Error('Invalid ObjectId'));

      await expect(UserServiceLookup.userExists('invalid-id')).rejects.toThrow('Invalid ObjectId');
    });

    it('should handle timeout errors', async () => {
      MockedUser.findById.mockRejectedValue(new Error('Query timeout'));

      await expect(UserServiceLookup.userExists(mockUserId)).rejects.toThrow('Query timeout');
    });
  });

  describe('emailExists', () => {
    it('should return true when email exists', async () => {
      MockedUser.findByEmail.mockResolvedValue(mockUserInstance as any);

      const result = await UserServiceLookup.emailExists(mockEmail);

      expect(result).toBe(true);
      expect(MockedUser.findByEmail).toHaveBeenCalledWith(mockEmail);
    });

    it('should return false when email does not exist', async () => {
      MockedUser.findByEmail.mockResolvedValue(null);

      const result = await UserServiceLookup.emailExists(mockEmail);

      expect(result).toBe(false);
    });

    it('should re-throw non-UserNotFoundError errors', async () => {
      MockedUser.findByEmail.mockRejectedValue(new Error('Database error'));

      await expect(UserServiceLookup.emailExists(mockEmail)).rejects.toThrow('Database error');
    });

    it('should handle empty email', async () => {
      MockedUser.findByEmail.mockResolvedValue(null);

      const result = await UserServiceLookup.emailExists('');

      expect(result).toBe(false);
    });

    it('should handle invalid email format', async () => {
      MockedUser.findByEmail.mockResolvedValue(null);

      const result = await UserServiceLookup.emailExists('invalid-email');

      expect(result).toBe(false);
    });

    it('should handle case sensitivity', async () => {
      MockedUser.findByEmail.mockResolvedValue(mockUserInstance as any);

      const result = await UserServiceLookup.emailExists('TEST@EXAMPLE.COM');

      expect(result).toBe(true);
      expect(MockedUser.findByEmail).toHaveBeenCalledWith('TEST@EXAMPLE.COM');
    });

    it('should handle connection timeouts', async () => {
      MockedUser.findByEmail.mockRejectedValue(new Error('Connection timeout'));

      await expect(UserServiceLookup.emailExists(mockEmail)).rejects.toThrow('Connection timeout');
    });
  });

  describe('Error handling integration', () => {
    it('should properly distinguish between UserNotFoundError and other errors in userExists', async () => {
      // First test UserNotFoundError
      MockedUser.findById.mockRejectedValue(new UserNotFoundError(mockUserId));

      const result1 = await UserServiceLookup.userExists(mockUserId);
      expect(result1).toBe(false);

      // Then test other error
      MockedUser.findById.mockRejectedValue(new Error('Network error'));

      await expect(UserServiceLookup.userExists(mockUserId)).rejects.toThrow('Network error');
    });

    it('should properly distinguish between UserNotFoundError and other errors in emailExists', async () => {
      // First test UserNotFoundError
      MockedUser.findByEmail.mockRejectedValue(new UserNotFoundError(mockEmail));

      const result1 = await UserServiceLookup.emailExists(mockEmail);
      expect(result1).toBe(false);

      // Then test other error
      MockedUser.findByEmail.mockRejectedValue(new Error('Authentication failed'));

      await expect(UserServiceLookup.emailExists(mockEmail)).rejects.toThrow('Authentication failed');
    });
  });

  describe('Performance and edge cases', () => {
    it('should handle very long user IDs', async () => {
      const longId = 'a'.repeat(1000);
      MockedUser.findById.mockResolvedValue(null);

      const result = await UserServiceLookup.findUserOrError(longId);

      expect(result.success).toBe(false);
      expect(MockedUser.findById).toHaveBeenCalledWith(longId);
    });

    it('should handle very long emails', async () => {
      const longEmail = `${'a'.repeat(100)}@${'b'.repeat(100)}.com`;
      MockedUser.findByEmail.mockResolvedValue(null);

      const result = await UserServiceLookup.emailExists(longEmail);

      expect(result).toBe(false);
      expect(MockedUser.findByEmail).toHaveBeenCalledWith(longEmail);
    });

    it('should handle very long tokens', async () => {
      const longToken = 'x'.repeat(10000);
      MockedUser.findByResetToken.mockResolvedValue(null);

      await expect(UserServiceLookup.findUserByResetTokenOrThrow(longToken)).rejects.toThrow(TokenInvalidError);
      expect(MockedUser.findByResetToken).toHaveBeenCalledWith(longToken);
    });

    it('should handle special characters in inputs', async () => {
      const specialEmail = 'test+special@example.com';
      MockedUser.findByEmail.mockResolvedValue(mockUserInstance as any);

      const result = await UserServiceLookup.findUserByEmailNullable(specialEmail);

      expect(result).toEqual(mockUserInstance);
      expect(MockedUser.findByEmail).toHaveBeenCalledWith(specialEmail);
    });

    it('should handle Unicode characters in inputs', async () => {
      const unicodeEmail = 'tëst@éxample.com';
      MockedUser.findByEmail.mockResolvedValue(null);

      const result = await UserServiceLookup.emailExists(unicodeEmail);

      expect(result).toBe(false);
      expect(MockedUser.findByEmail).toHaveBeenCalledWith(unicodeEmail);
    });
  });

  describe('Concurrent operations', () => {
    it('should handle multiple concurrent user lookups', async () => {
      MockedUser.findById.mockResolvedValue(mockUserInstance as any);

      const promises = Array.from({ length: 10 }, (_, i) => 
        UserServiceLookup.findUserByIdOrThrow(`${mockUserId}-${i}`)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toEqual(mockUserInstance);
      });
      expect(MockedUser.findById).toHaveBeenCalledTimes(10);
    });

    it('should handle mixed success and failure scenarios', async () => {
      MockedUser.findById
        .mockResolvedValueOnce(mockUserInstance as any)
        .mockResolvedValueOnce(null)
        .mockRejectedValueOnce(new Error('Database error'));

      const [success, notFound, error] = await Promise.allSettled([
        UserServiceLookup.findUserOrError('success-id'),
        UserServiceLookup.findUserOrError('not-found-id'),
        UserServiceLookup.findUserOrError('error-id'),
      ]);

      expect(success.status).toBe('fulfilled');
      expect((success as any).value.success).toBe(true);

      expect(notFound.status).toBe('fulfilled');
      expect((notFound as any).value.success).toBe(false);

      expect(error.status).toBe('rejected');
      expect((error as any).reason.message).toBe('Database error');
    });
  });
});