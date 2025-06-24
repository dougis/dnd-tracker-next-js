import '../__test-helpers__/test-setup';
import { UserService } from '../UserService';
import { mockUser, mockUserData } from '../__test-helpers__/test-setup';

describe('UserService CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should successfully retrieve user by ID', async () => {
      const mockFoundUser = {
        ...mockUserData,
        toPublicJSON: jest.fn().mockReturnValue({
          _id: mockUserData._id,
          email: mockUserData.email,
          username: mockUserData.username,
        }),
      };

      mockUser.findById.mockResolvedValue(mockFoundUser as any);

      const result = await UserService.getUserById('507f1f77bcf86cd799439011');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockUser.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should return error for non-existent user', async () => {
      mockUser.findById.mockResolvedValue(null);

      const result = await UserService.getUserById('507f1f77bcf86cd799439011');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
      expect(result.error?.statusCode).toBe(404);
    });
  });

  describe('updateUserProfile', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      preferences: {
        theme: 'dark' as const,
      },
    };

    it('should successfully update user profile', async () => {
      const mockUpdateUser = {
        ...mockUserData,
        save: jest.fn().mockResolvedValue(true),
        toPublicJSON: jest.fn().mockReturnValue({
          ...mockUserData,
          firstName: 'Updated',
          lastName: 'Name',
        }),
      };

      mockUser.findById.mockResolvedValue(mockUpdateUser as any);

      const result = await UserService.updateUserProfile('507f1f77bcf86cd799439011', updateData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockUpdateUser.save).toHaveBeenCalled();
    });

    it('should return error for non-existent user', async () => {
      mockUser.findById.mockResolvedValue(null);

      const result = await UserService.updateUserProfile('507f1f77bcf86cd799439011', updateData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
      expect(result.error?.statusCode).toBe(404);
    });

    it('should check for email conflicts', async () => {
      const updateWithEmail = {
        email: 'newemail@example.com',
      };

      const mockCurrentUser = {
        ...mockUserData,
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        email: 'old@example.com',
      };

      const mockConflictUser = {
        ...mockUserData,
        _id: { toString: () => '507f1f77bcf86cd799439012' },
        email: 'newemail@example.com',
      };

      mockUser.findById.mockResolvedValue(mockCurrentUser as any);
      mockUser.findByEmail.mockResolvedValue(mockConflictUser as any);

      const result = await UserService.updateUserProfile('507f1f77bcf86cd799439011', updateWithEmail);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_ALREADY_EXISTS');
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete user', async () => {
      mockUser.findById.mockResolvedValue(mockUserData as any);
      mockUser.findByIdAndDelete.mockResolvedValue(mockUserData as any);

      const result = await UserService.deleteUser('507f1f77bcf86cd799439011');

      expect(result.success).toBe(true);
      expect(mockUser.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should return error for non-existent user', async () => {
      mockUser.findById.mockResolvedValue(null);

      const result = await UserService.deleteUser('507f1f77bcf86cd799439011');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('getUsers', () => {
    it('should return paginated list of users', async () => {
      const mockUsers = [
        { ...mockUserData, _id: '1' },
        { ...mockUserData, _id: '2' },
      ];

      mockUser.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(mockUsers),
            }),
          }),
        }),
      } as any);

      mockUser.countDocuments.mockResolvedValue(10);

      const result = await UserService.getUsers(1, 2);

      expect(result.success).toBe(true);
      expect(result.data?.data).toHaveLength(2);
      expect(result.data?.pagination.total).toBe(10);
      expect(result.data?.pagination.totalPages).toBe(5);
    });

    it('should apply filters correctly', async () => {
      mockUser.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as any);

      mockUser.countDocuments.mockResolvedValue(0);

      await UserService.getUsers(1, 10, {
        role: 'admin',
        isEmailVerified: true,
      });

      expect(mockUser.find).toHaveBeenCalledWith({
        role: 'admin',
        isEmailVerified: true,
      });
    });
  });

  describe('updateSubscription', () => {
    it('should successfully update user subscription', async () => {
      const mockSubUser = {
        ...mockUserData,
        save: jest.fn().mockResolvedValue(true),
        toPublicJSON: jest.fn().mockReturnValue({
          ...mockUserData,
          subscriptionTier: 'expert',
        }),
      };

      mockUser.findById.mockResolvedValue(mockSubUser as any);

      const result = await UserService.updateSubscription('507f1f77bcf86cd799439011', 'expert');

      expect(result.success).toBe(true);
      expect(mockSubUser.save).toHaveBeenCalled();
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const mockStats = [
        { _id: 'free', count: 100 },
        { _id: 'expert', count: 25 },
        { _id: 'guild', count: 5 },
      ];

      mockUser.countDocuments
        .mockResolvedValueOnce(130) // total users
        .mockResolvedValueOnce(95) // verified users
        .mockResolvedValueOnce(45); // active users

      mockUser.aggregate.mockResolvedValue(mockStats);

      const result = await UserService.getUserStats();

      expect(result.success).toBe(true);
      expect(result.data?.totalUsers).toBe(130);
      expect(result.data?.verifiedUsers).toBe(95);
      expect(result.data?.activeUsers).toBe(45);
      expect(result.data?.subscriptionBreakdown.free).toBe(100);
      expect(result.data?.subscriptionBreakdown.expert).toBe(25);
      expect(result.data?.subscriptionBreakdown.guild).toBe(5);
    });
  });
});