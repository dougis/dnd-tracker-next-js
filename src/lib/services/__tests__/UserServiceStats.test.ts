import '../__test-helpers__/test-setup';
import { UserServiceStats } from '../UserServiceStats';
import {
  StatsTestHelpers,
  StatsAssertionHelpers,
  StatsTestScenarios,
  createMockQueryChain,
  createMockUser,
  createMockPublicUser,
} from './UserServiceStats.test-helpers';

// Mock dependencies
jest.mock('../UserServiceHelpers');
jest.mock('../UserServiceResponseHelpers');

describe('UserServiceStats', () => {
  let mocks: ReturnType<typeof StatsTestHelpers.setupBasicMocks>;

  beforeEach(() => {
    jest.clearAllMocks();
    mocks = StatsTestHelpers.setupBasicMocks();
  });

  describe('getUsers', () => {
    it('should successfully retrieve paginated users with default parameters', async () => {
      const { result } = await StatsTestScenarios.testGetUsersSuccess();

      StatsAssertionHelpers.expectPaginationResult(result, 1, 20, 10);
    });

    it('should successfully retrieve paginated users with custom parameters', async () => {
      const { result, mocks: testMocks } = await StatsTestScenarios.testGetUsersSuccess(
        2, 5, { role: 'admin' },
        () => {
          const setupMocks = StatsTestHelpers.setupBasicMocks();
          const { mockQueryChain } = StatsTestHelpers.setupGetUsersTest(setupMocks.MockedUser);
          return { ...setupMocks, mockQueryChain };
        }
      );

      StatsAssertionHelpers.expectQueryChainCalls(testMocks.mockQueryChain, 5, 5);
    });

    it('should handle filters correctly', async () => {
      const filters = { role: 'user', subscriptionTier: 'expert', isEmailVerified: true };
      await StatsTestScenarios.testGetUsersSuccess(1, 20, filters);
    });

    it('should handle empty filters', async () => {
      await StatsTestScenarios.testGetUsersSuccess(1, 20, undefined);
    });

    it('should calculate pagination correctly for multiple pages', async () => {
      StatsTestHelpers.setupGetUsersTest(mocks.MockedUser, 50);

      const result = await UserServiceStats.getUsers(3, 10);

      StatsAssertionHelpers.expectPaginationResult(result, 3, 10, 50);
    });

    it('should handle test environment with basic mock', async () => {
      const mockUsers = [createMockUser(1), createMockUser(2)];
      const basicMock = jest.fn().mockResolvedValue(mockUsers);
      mocks.MockedUser.find = basicMock as any;

      const result = await UserServiceStats.getUsers();

      StatsAssertionHelpers.expectSuccessResult(result);
      expect(result.data?.data).toEqual(mocks.mockPublicUsers);
    });

    it('should handle database errors', async () => {
      await StatsTestScenarios.testGetUsersError(
        () => {
          mocks.MockedUser.find = jest.fn().mockImplementation(() => {
            throw new Error('Database connection failed');
          });
        },
        mocks.mockResponseHelpers.handleCustomError
      );
    });

    it('should handle zero results', async () => {
      const { mockQueryChain } = StatsTestHelpers.setupGetUsersTest(mocks.MockedUser, 0, []);
      mockQueryChain.lean.mockResolvedValue([]);

      const result = await UserServiceStats.getUsers();

      StatsAssertionHelpers.expectSuccessResult(result);
      StatsAssertionHelpers.expectPaginationResult(result, 1, 20, 0);
    });

    describe('edge cases', () => {
      const edgeCaseTests = [
        { name: 'negative page numbers', page: -1, limit: 10, expectedSkip: -20 },
        { name: 'zero limit', page: 1, limit: 0, expectedSkip: 0 },
        { name: 'very large page numbers', page: 1000, limit: 10, expectedSkip: 9990 },
      ];

      edgeCaseTests.forEach(({ name, page, limit, expectedSkip }) => {
        it(`should handle ${name}`, async () => {
          const { mockQueryChain } = StatsTestHelpers.setupGetUsersTest(mocks.MockedUser);

          const result = await UserServiceStats.getUsers(page, limit);

          expect(mockQueryChain.skip).toHaveBeenCalledWith(expectedSkip);
          StatsAssertionHelpers.expectSuccessResult(result);
        });
      });

      it('should handle pagination edge case where total is not divisible by limit', async () => {
        StatsTestHelpers.setupGetUsersTest(mocks.MockedUser, 23);

        const result = await UserServiceStats.getUsers(1, 10);

        expect(result.data?.pagination.totalPages).toBe(3);
      });
    });
  });

  describe('getUserStats', () => {
    beforeEach(() => {
      StatsTestHelpers.setupGetStatsTest(mocks.MockedUser);
    });

    it('should successfully retrieve user statistics', async () => {
      const { result } = await StatsTestScenarios.testGetStatsSuccess();
      // Additional assertions handled by testGetStatsSuccess
    });

    it('should verify correct database queries are made', async () => {
      await UserServiceStats.getUserStats();

      expect(mocks.MockedUser.countDocuments).toHaveBeenCalledTimes(3);
      expect(mocks.MockedUser.countDocuments).toHaveBeenNthCalledWith(1);
      expect(mocks.MockedUser.countDocuments).toHaveBeenNthCalledWith(2, { isEmailVerified: true });
      expect(mocks.MockedUser.countDocuments).toHaveBeenNthCalledWith(3, {
        lastLoginAt: { $gte: expect.any(Date) },
      });
      expect(mocks.MockedUser.aggregate).toHaveBeenCalledWith([
        { $group: { _id: '$subscriptionTier', count: { $sum: 1 } } },
      ]);
    });

    it('should handle empty subscription statistics', async () => {
      mocks.MockedUser.aggregate = jest.fn().mockResolvedValue([]);

      const result = await UserServiceStats.getUserStats();

      StatsAssertionHelpers.expectSuccessResult(result);
      expect(result.data?.subscriptionBreakdown).toEqual({
        free: 0, seasoned: 0, expert: 0, master: 0, guild: 0,
      });
    });

    it('should handle partial subscription data', async () => {
      mocks.MockedUser.aggregate = jest.fn().mockResolvedValue([
        { _id: 'free', count: 100 },
        { _id: 'guild', count: 5 },
      ]);

      const result = await UserServiceStats.getUserStats();

      expect(result.data?.subscriptionBreakdown).toEqual({
        free: 100, seasoned: 0, expert: 0, master: 0, guild: 5,
      });
    });

    it('should calculate active users date correctly', async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      await UserServiceStats.getUserStats();

      const actualDate = (mocks.MockedUser.countDocuments as jest.Mock).mock.calls[2][0].lastLoginAt.$gte;
      const timeDiff = Math.abs(actualDate.getTime() - thirtyDaysAgo.getTime());
      expect(timeDiff).toBeLessThan(60000);
    });

    describe('error handling', () => {
      const errorTests = [
        {
          name: 'database errors in statistics retrieval',
          setup: () => {
            mocks.MockedUser.countDocuments = jest.fn().mockRejectedValue(new Error('Database error'));
          },
        },
        {
          name: 'aggregate errors',
          setup: () => {
            mocks.MockedUser.aggregate = jest.fn().mockRejectedValue(new Error('Aggregation failed'));
          },
        },
        {
          name: 'Promise.all rejection',
          setup: () => {
            mocks.MockedUser.countDocuments = jest.fn()
              .mockResolvedValueOnce(100)
              .mockRejectedValueOnce(new Error('Query failed'));
          },
        },
      ];

      errorTests.forEach(({ name, setup }) => {
        it(`should handle ${name}`, async () => {
          await StatsTestScenarios.testGetStatsError(setup, mocks.mockResponseHelpers.handleCustomError);
        });
      });
    });
  });

  describe('Private method behavior', () => {
    const privateMethodTests = [
      {
        name: 'build query correctly with filters',
        method: 'buildQuery',
        args: [{ role: 'admin', subscriptionTier: 'expert' }],
        expected: { role: 'admin', subscriptionTier: 'expert' },
      },
      {
        name: 'build empty query without filters',
        method: 'buildQuery',
        args: [],
        expected: {},
      },
    ];

    privateMethodTests.forEach(({ name, method, args, expected }) => {
      it(`should ${name}`, () => {
        const privateMethod = StatsTestHelpers.getPrivateMethod(method);
        const result = privateMethod(...args);
        expect(result).toEqual(expected);
      });
    });

    it('should format paginated result correctly', () => {
      const mockUsers = [createMockUser(1), createMockUser(2)];
      const mockPublicUsers = [createMockPublicUser(1), createMockPublicUser(2)];
      const formatMethod = StatsTestHelpers.getPrivateMethod('formatPaginatedResult');

      const result = formatMethod(mockUsers, 25, 2, 10);

      expect(result).toEqual({
        data: mockPublicUsers,
        pagination: { page: 2, limit: 10, total: 25, totalPages: 3 },
      });
      expect(mocks.mockConvertLeansUsersToPublic).toHaveBeenCalledWith(mockUsers);
    });

    it('should detect test environment correctly', async () => {
      const mockUsers = [createMockUser(1), createMockUser(2)];
      const basicTestMock = jest.fn().mockResolvedValue(mockUsers);
      mocks.MockedUser.find = basicTestMock as any;

      const executeUserQuery = StatsTestHelpers.getPrivateMethod('executeUserQuery');
      const result = await executeUserQuery({}, 0, 10);

      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(10);
    });

    it('should handle production environment correctly', async () => {
      const mockUsers = [createMockUser(1), createMockUser(2)];
      const mockQueryChain = createMockQueryChain(mockUsers);
      mocks.MockedUser.find = jest.fn().mockReturnValue(mockQueryChain);

      const executeFullQuery = StatsTestHelpers.getPrivateMethod('executeFullQuery');
      const result = await executeFullQuery({}, 5, 10);

      expect(mockQueryChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      StatsAssertionHelpers.expectQueryChainCalls(mockQueryChain, 5, 10);
      expect(mockQueryChain.lean).toHaveBeenCalled();
      expect(result.users).toEqual(mockUsers);
    });

    it('should handle null/undefined database responses in basic query', async () => {
      const basicMock = jest.fn().mockResolvedValue(null);
      mocks.MockedUser.find = basicMock as any;
      mocks.MockedUser.countDocuments = jest.fn().mockResolvedValue(null);

      const executeBasicQuery = StatsTestHelpers.getPrivateMethod('executeBasicQuery');
      const result = await executeBasicQuery({});

      expect(result.users).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});