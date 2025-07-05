import { NextRequest } from 'next/server';
import { PATCH, GET } from '../route';
import { UserService } from '@/lib/services/UserService';
import { auth } from '@/lib/auth';

// Mock dependencies
jest.mock('@/lib/services/UserService');
jest.mock('@/lib/auth');

const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('/api/users/[id]/profile', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockSession = {
    user: {
      id: mockUserId,
      email: 'test@example.com',
    },
  };

  const mockParams = Promise.resolve({ id: mockUserId });

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue(mockSession as any);
  });

  describe('PATCH /api/users/[id]/profile', () => {
    it('should update user profile successfully', async () => {
      const mockUpdatedUser = {
        id: mockUserId,
        email: 'test@example.com',
        displayName: 'John Doe',
        timezone: 'America/New_York',
        dndEdition: 'Pathfinder 2e',
        experienceLevel: 'experienced' as const,
        primaryRole: 'dm' as const,
      };

      mockUserService.updateUserProfile.mockResolvedValue({
        success: true,
        data: mockUpdatedUser,
      });

      const requestBody = {
        displayName: 'John Doe',
        timezone: 'America/New_York',
        dndEdition: 'Pathfinder 2e',
        experienceLevel: 'experienced',
        primaryRole: 'dm',
      };

      const request = {
        json: jest.fn().mockResolvedValue(requestBody),
        method: 'PATCH',
        headers: new Headers({
          'content-type': 'application/json',
        }),
      } as unknown as NextRequest;

      const response = await PATCH(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: 'Profile updated successfully',
        user: mockUpdatedUser,
      });

      expect(mockUserService.updateUserProfile).toHaveBeenCalledWith(
        mockUserId,
        requestBody
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = {
        json: jest.fn().mockResolvedValue({ displayName: 'Test' }),
        method: 'PATCH',
        headers: new Headers({
          'content-type': 'application/json',
        }),
      } as unknown as NextRequest;

      const response = await PATCH(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        success: false,
        message: 'Authentication required',
      });

      expect(mockUserService.updateUserProfile).not.toHaveBeenCalled();
    });

    it('should return 403 when user tries to update another user\'s profile', async () => {
      const otherUserId = '507f1f77bcf86cd799439012';
      const otherParams = Promise.resolve({ id: otherUserId });

      const request = {
        json: jest.fn().mockResolvedValue({ displayName: 'Test' }),
        method: 'PATCH',
        headers: new Headers({
          'content-type': 'application/json',
        }),
      } as unknown as NextRequest;

      const response = await PATCH(request, { params: otherParams });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({
        success: false,
        message: 'You can only update your own profile',
      });

      expect(mockUserService.updateUserProfile).not.toHaveBeenCalled();
    });

    it('should return 400 for validation errors', async () => {
      const request = {
        json: jest.fn().mockResolvedValue({
          displayName: '', // Invalid - empty string
          experienceLevel: 'invalid', // Invalid enum value
        }),
        method: 'PATCH',
        headers: new Headers({
          'content-type': 'application/json',
        }),
      } as unknown as NextRequest;

      const response = await PATCH(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Validation error');
      expect(Array.isArray(data.errors)).toBe(true);

      expect(mockUserService.updateUserProfile).not.toHaveBeenCalled();
    });

    it('should handle UserService errors', async () => {
      mockUserService.updateUserProfile.mockResolvedValue({
        success: false,
        error: {
          message: 'User not found',
          statusCode: 404,
        },
      });

      const request = {
        json: jest.fn().mockResolvedValue({ displayName: 'Test' }),
        method: 'PATCH',
        headers: new Headers({
          'content-type': 'application/json',
        }),
      } as unknown as NextRequest;

      const response = await PATCH(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        success: false,
        message: 'User not found',
        errors: [{ field: '', message: 'User not found' }],
      });
    });
  });

  describe('GET /api/users/[id]/profile', () => {
    it('should get user profile successfully', async () => {
      const mockUser = {
        id: mockUserId,
        email: 'test@example.com',
        displayName: 'John Doe',
        timezone: 'America/New_York',
        dndEdition: 'Pathfinder 2e',
        experienceLevel: 'experienced' as const,
        primaryRole: 'dm' as const,
      };

      mockUserService.getUserById.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const request = {
        method: 'GET',
        headers: new Headers(),
      } as unknown as NextRequest;

      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        user: mockUser,
      });

      expect(mockUserService.getUserById).toHaveBeenCalledWith(mockUserId);
    });

    it('should return 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = {
        method: 'GET',
        headers: new Headers(),
      } as unknown as NextRequest;

      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        success: false,
        message: 'Authentication required',
      });

      expect(mockUserService.getUserById).not.toHaveBeenCalled();
    });

    it('should return 403 when user tries to view another user\'s profile', async () => {
      const otherUserId = '507f1f77bcf86cd799439012';
      const otherParams = Promise.resolve({ id: otherUserId });

      const request = {
        method: 'GET',
        headers: new Headers(),
      } as unknown as NextRequest;

      const response = await GET(request, { params: otherParams });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({
        success: false,
        message: 'You can only view your own profile',
      });

      expect(mockUserService.getUserById).not.toHaveBeenCalled();
    });

    it('should return 404 when user is not found', async () => {
      mockUserService.getUserById.mockResolvedValue({
        success: false,
        error: {
          message: 'User not found',
          statusCode: 404,
        },
      });

      const request = {
        method: 'GET',
        headers: new Headers(),
      } as unknown as NextRequest;

      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        success: false,
        message: 'User not found',
      });
    });
  });
});