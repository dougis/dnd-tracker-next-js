import { UserServiceStats } from '../UserServiceStats';
import User from '../../models/User';
import { convertLeansUsersToPublic } from '../UserServiceHelpers';

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../UserServiceHelpers');
jest.mock('../UserServiceResponseHelpers');

const MockedUser = jest.mocked(User);
const mockConvertLeansUsersToPublic = jest.mocked(convertLeansUsersToPublic);

describe('UserServiceStats - Comprehensive Tests', () => {
  const mockUsers = [
    {
      _id: '507f1f77bcf86cd799439011',
      email: 'user1@example.com',
      username: 'user1',
      firstName: 'User',
      lastName: 'One',
      role: 'user',
      subscriptionTier: 'free',
      isEmailVerified: true,
      createdAt: new Date('2024-01-01'),
    },
    {
      _id: '507f1f77bcf86cd799439012',
      email: 'user2@example.com',
      username: 'user2',
      firstName: 'User',
      lastName: 'Two',
      role: 'admin',
      subscriptionTier: 'expert',
      isEmailVerified: false,
      createdAt: new Date('2024-01-02'),
    },
  ];

  const mockPublicUsers = [
    {
      _id: '507f1f77bcf86cd799439011',
      email: 'user1@example.com',
      username: 'user1',
      firstName: 'User',
      lastName: 'One',
      role: 'user',
      subscriptionTier: 'free',
      isEmailVerified: true,
    },
    {
      _id: '507f1f77bcf86cd799439012',
      email: 'user2@example.com',
      username: 'user2',
      firstName: 'User',
      lastName: 'Two',
      role: 'admin',
      subscriptionTier: 'expert',
      isEmailVerified: false,
    },
  ];

  const mockQueryChain = {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(mockUsers),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock UserServiceResponseHelpers
    const mockResponseHelpers = {
      createSuccessResponse: jest.fn().mockImplementation((data) => ({ success: true, data })),
      createErrorResponse: jest.fn().mockImplementation((error) => ({ success: false, error })),
      handleCustomError: jest.fn().mockReturnValue({
        success: false,
        error: { message: 'Error', code: 'ERROR', statusCode: 500 }
      }),
    };
    require('../UserServiceResponseHelpers').UserServiceResponseHelpers = mockResponseHelpers;

    // Mock convertLeansUsersToPublic
    mockConvertLeansUsersToPublic.mockReturnValue(mockPublicUsers);

    // Setup default User model mocks for production environment
    MockedUser.find.mockReturnValue(mockQueryChain as any);
    MockedUser.countDocuments.mockResolvedValue(10);
  });

  describe('getUsers', () => {
    it('should successfully retrieve paginated users with default parameters', async () => {
      const result = await UserServiceStats.getUsers();

      expect(result.success).toBe(true);
      expect(result.data?.data).toEqual(mockPublicUsers);
      expect(result.data?.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 10,
        totalPages: 1,
      });
      expect(MockedUser.find).toHaveBeenCalledWith({});
    });

    it('should successfully retrieve paginated users with custom parameters', async () => {
      const result = await UserServiceStats.getUsers(2, 5, { role: 'admin' });

      expect(result.success).toBe(true);
      expect(mockQueryChain.skip).toHaveBeenCalledWith(5); // (page 2 - 1) * limit 5
      expect(mockQueryChain.limit).toHaveBeenCalledWith(5);
      expect(MockedUser.find).toHaveBeenCalledWith({ role: 'admin' });
    });

    it('should handle filters correctly', async () => {
      const filters = {
        role: 'user',
        subscriptionTier: 'expert',
        isEmailVerified: true,
      };

      await UserServiceStats.getUsers(1, 20, filters);

      expect(MockedUser.find).toHaveBeenCalledWith(filters);
    });

    it('should handle empty filters', async () => {
      await UserServiceStats.getUsers(1, 20, undefined);

      expect(MockedUser.find).toHaveBeenCalledWith({});
    });

    it('should calculate pagination correctly for multiple pages', async () => {
      MockedUser.countDocuments.mockResolvedValue(50);

      const result = await UserServiceStats.getUsers(3, 10);

      expect(result.data?.pagination).toEqual({
        page: 3,
        limit: 10,
        total: 50,
        totalPages: 5,
      });
      expect(mockQueryChain.skip).toHaveBeenCalledWith(20); // (page 3 - 1) * limit 10
    });

    it('should handle test environment with basic mock', async () => {
      // Mock for test environment - no chaining methods
      const basicMock = jest.fn().mockResolvedValue(mockUsers);
      basicMock.sort = undefined; // Simulate test environment
      MockedUser.find.mockReturnValue(basicMock as any);

      const result = await UserServiceStats.getUsers();

      expect(result.success).toBe(true);
      expect(result.data?.data).toEqual(mockPublicUsers);
    });

    it('should handle database errors', async () => {
      MockedUser.find.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const result = await UserServiceStats.getUsers();

      expect(result.success).toBe(false);
    });

    it('should handle zero results', async () => {
      mockQueryChain.lean.mockResolvedValue([]);
      MockedUser.countDocuments.mockResolvedValue(0);

      const result = await UserServiceStats.getUsers();

      expect(result.success).toBe(true);
      expect(result.data?.data).toEqual(mockPublicUsers); // convertLeansUsersToPublic still called
      expect(result.data?.pagination.total).toBe(0);
      expect(result.data?.pagination.totalPages).toBe(0);
    });

    it('should handle pagination edge case where total is not divisible by limit', async () => {
      MockedUser.countDocuments.mockResolvedValue(23);

      const result = await UserServiceStats.getUsers(1, 10);

      expect(result.data?.pagination.totalPages).toBe(3); // Math.ceil(23/10)
    });
  });

  describe('getUserStats', () => {
    const mockSubscriptionStats = [
      { _id: 'free', count: 50 },
      { _id: 'expert', count: 30 },
      { _id: 'master', count: 10 },
    ];

    beforeEach(() => {
      // Mock countDocuments for different queries
      MockedUser.countDocuments
        .mockResolvedValueOnce(100) // totalUsers
        .mockResolvedValueOnce(80)  // verifiedUsers
        .mockResolvedValueOnce(60); // activeUsers

      // Mock aggregate for subscription breakdown
      MockedUser.aggregate.mockResolvedValue(mockSubscriptionStats);
    });

    it('should successfully retrieve user statistics', async () => {
      const result = await UserServiceStats.getUserStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalUsers: 100,
        verifiedUsers: 80,
        activeUsers: 60,
        subscriptionBreakdown: {
          free: 50,
          seasoned: 0,
          expert: 30,
          master: 10,
          guild: 0,
        },
      });
    });

    it('should verify correct database queries are made', async () => {
      await UserServiceStats.getUserStats();

      expect(MockedUser.countDocuments).toHaveBeenCalledTimes(3);
      expect(MockedUser.countDocuments).toHaveBeenNthCalledWith(1);
      expect(MockedUser.countDocuments).toHaveBeenNthCalledWith(2, { isEmailVerified: true });
      expect(MockedUser.countDocuments).toHaveBeenNthCalledWith(3, {
        lastLoginAt: {
          $gte: expect.any(Date),
        },
      });
      expect(MockedUser.aggregate).toHaveBeenCalledWith([
        {
          $group: {
            _id: '$subscriptionTier',
            count: { $sum: 1 },
          },
        },
      ]);
    });

    it('should handle empty subscription statistics', async () => {
      MockedUser.aggregate.mockResolvedValue([]);

      const result = await UserServiceStats.getUserStats();

      expect(result.success).toBe(true);
      expect(result.data?.subscriptionBreakdown).toEqual({
        free: 0,
        seasoned: 0,
        expert: 0,
        master: 0,
        guild: 0,
      });
    });

    it('should handle partial subscription data', async () => {
      MockedUser.aggregate.mockResolvedValue([
        { _id: 'free', count: 100 },
        { _id: 'guild', count: 5 },
      ]);

      const result = await UserServiceStats.getUserStats();

      expect(result.data?.subscriptionBreakdown).toEqual({
        free: 100,
        seasoned: 0,
        expert: 0,
        master: 0,
        guild: 5,
      });
    });

    it('should handle database errors in statistics retrieval', async () => {
      MockedUser.countDocuments.mockRejectedValue(new Error('Database error'));

      const result = await UserServiceStats.getUserStats();

      expect(result.success).toBe(false);
    });

    it('should handle aggregate errors', async () => {
      MockedUser.aggregate.mockRejectedValue(new Error('Aggregation failed'));

      const result = await UserServiceStats.getUserStats();

      expect(result.success).toBe(false);
    });

    it('should calculate active users date correctly', async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      await UserServiceStats.getUserStats();

      expect(MockedUser.countDocuments).toHaveBeenCalledWith({
        lastLoginAt: {
          $gte: expect.any(Date),
        },
      });

      // Verify the date is approximately 30 days ago (within 1 minute tolerance)
      const actualDate = MockedUser.countDocuments.mock.calls[2][0].lastLoginAt.$gte;
      const timeDiff = Math.abs(actualDate.getTime() - thirtyDaysAgo.getTime());
      expect(timeDiff).toBeLessThan(60000); // Less than 1 minute difference
    });
  });

  describe('Private method behavior', () => {
    it('should build query correctly with filters', () => {
      const filters = { role: 'admin', subscriptionTier: 'expert' };

      // Access private method through reflection for testing
      const UserServiceStatsClass = UserServiceStats as any;
      const query = UserServiceStatsClass.buildQuery(filters);

      expect(query).toEqual(filters);
    });

    it('should build empty query without filters', () => {
      // Access private method through reflection for testing
      const UserServiceStatsClass = UserServiceStats as any;
      const query = UserServiceStatsClass.buildQuery();

      expect(query).toEqual({});
    });

    it('should format paginated result correctly', () => {
      // Access private method through reflection for testing
      const UserServiceStatsClass = UserServiceStats as any;
      const result = UserServiceStatsClass.formatPaginatedResult(mockUsers, 25, 2, 10);

      expect(result).toEqual({
        data: mockPublicUsers,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      });
      expect(mockConvertLeansUsersToPublic).toHaveBeenCalledWith(mockUsers);
    });

    it('should detect test environment correctly', async () => {
      // Create a mock that looks like a basic test mock
      const basicTestMock = jest.fn().mockResolvedValue(mockUsers);
      MockedUser.find.mockReturnValue(basicTestMock as any);

      // Access private method through reflection for testing
      const UserServiceStatsClass = UserServiceStats as any;
      const result = await UserServiceStatsClass.executeUserQuery({}, 0, 10);

      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(10); // From the countDocuments mock
    });

    it('should handle production environment correctly', async () => {
      // Ensure we have full query chain
      MockedUser.find.mockReturnValue(mockQueryChain as any);

      // Access private method through reflection for testing
      const UserServiceStatsClass = UserServiceStats as any;
      const result = await UserServiceStatsClass.executeFullQuery({}, 5, 10);

      expect(mockQueryChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockQueryChain.skip).toHaveBeenCalledWith(5);
      expect(mockQueryChain.limit).toHaveBeenCalledWith(10);
      expect(mockQueryChain.lean).toHaveBeenCalled();
      expect(result.users).toEqual(mockUsers);
    });
  });

  describe('Edge cases', () => {
    it('should handle negative page numbers', async () => {
      const result = await UserServiceStats.getUsers(-1, 10);

      expect(mockQueryChain.skip).toHaveBeenCalledWith(-20); // (-1 - 1) * 10
      expect(result.success).toBe(true);
    });

    it('should handle zero limit', async () => {
      const result = await UserServiceStats.getUsers(1, 0);

      expect(mockQueryChain.limit).toHaveBeenCalledWith(0);
      expect(result.success).toBe(true);
    });

    it('should handle very large page numbers', async () => {
      const result = await UserServiceStats.getUsers(1000, 10);

      expect(mockQueryChain.skip).toHaveBeenCalledWith(9990); // (1000 - 1) * 10
      expect(result.success).toBe(true);
    });

    it('should handle null user data from database', async () => {
      mockQueryChain.lean.mockResolvedValue(null);

      const result = await UserServiceStats.getUsers();

      expect(result.success).toBe(false);
    });

    it('should handle Promise.all rejection in getUserStats', async () => {
      MockedUser.countDocuments
        .mockResolvedValueOnce(100)
        .mockRejectedValueOnce(new Error('Query failed'));

      const result = await UserServiceStats.getUserStats();

      expect(result.success).toBe(false);
    });
  });
});
