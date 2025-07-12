import { NextRequest } from 'next/server';
import { DELETE } from '../route';
import { UserService } from '@/lib/services/UserService';
import { auth } from '@/lib/auth';

// Mock dependencies
jest.mock('@/lib/services/UserService');
jest.mock('@/lib/auth');

const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('DELETE /api/users/[id]/profile', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockRequest = new NextRequest('http://localhost:3000/api/users/507f1f77bcf86cd799439011/profile');

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com' },
      expires: '2024-12-31',
    });
  });

  describe('Successful deletion', () => {
    it('should delete user account successfully', async () => {
      mockUserService.deleteUser.mockResolvedValue({
        success: true,
        data: undefined,
      });

      const params = Promise.resolve({ id: mockUserId });
      const response = await DELETE(mockRequest, { params });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        message: 'Account deleted successfully',
      });
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('Authentication validation', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const params = Promise.resolve({ id: mockUserId });
      const response = await DELETE(mockRequest, { params });
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData).toEqual({
        success: false,
        message: 'Authentication required',
      });
      expect(mockUserService.deleteUser).not.toHaveBeenCalled();
    });

    it('should return 403 when user tries to delete different account', async () => {
      const differentUserId = '507f1f77bcf86cd799439012';
      mockAuth.mockResolvedValue({
        user: { id: differentUserId, email: 'other@example.com' },
        expires: '2024-12-31',
      });

      const params = Promise.resolve({ id: mockUserId });
      const response = await DELETE(mockRequest, { params });
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData).toEqual({
        success: false,
        message: 'You can only access your own profile',
      });
      expect(mockUserService.deleteUser).not.toHaveBeenCalled();
    });
  });

  describe('Service errors', () => {
    it('should handle user not found error', async () => {
      mockUserService.deleteUser.mockResolvedValue({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });

      const params = Promise.resolve({ id: mockUserId });
      const response = await DELETE(mockRequest, { params });
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData).toEqual({
        success: false,
        message: 'User not found',
      });
    });

    it('should handle deletion failure', async () => {
      mockUserService.deleteUser.mockResolvedValue({
        success: false,
        error: 'USER_DELETION_FAILED',
        message: 'Failed to delete user',
      });

      const params = Promise.resolve({ id: mockUserId });
      const response = await DELETE(mockRequest, { params });
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        success: false,
        message: 'Account deletion failed',
      });
    });

    it('should handle unexpected errors', async () => {
      mockUserService.deleteUser.mockRejectedValue(new Error('Database connection failed'));

      const params = Promise.resolve({ id: mockUserId });
      const response = await DELETE(mockRequest, { params });
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        success: false,
        message: 'Internal server error',
      });
    });
  });

});