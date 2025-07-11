import { UserServiceStats } from '../UserServiceStats';
import { convertLeansUsersToPublic } from '../UserServiceHelpers';
import { UserServiceResponseHelpers } from '../UserServiceResponseHelpers';
import User from '../../models/User';
import {
  UNIVERSAL_TEST_DATA,
  UniversalAssertions
} from './unified-test-patterns';

/**
 * UserServiceStats test helpers - simplified using unified patterns
 * Dramatically reduced by leveraging universal test patterns
 */

export const STATS_TEST_CONSTANTS = UNIVERSAL_TEST_DATA.constants;

export const createMockUser = (index: number = 1) => ({
  _id: index === 1 ? STATS_TEST_CONSTANTS.mockUserId : `${STATS_TEST_CONSTANTS.mockUserId.slice(0, -1)}${index}`,
  email: `user${index}@example.com`,
  username: `user${index}`,
  firstName: 'User',
  lastName: index === 1 ? 'One' : 'Two',
  role: index === 1 ? 'user' : 'admin',
  subscriptionTier: index === 1 ? 'free' : 'expert',
  isEmailVerified: index === 1,
  createdAt: new Date(`2024-01-0${index}`),
});

export const createMockPublicUser = (index: number = 1) => ({
  id: index === 1 ? STATS_TEST_CONSTANTS.mockUserId : `${STATS_TEST_CONSTANTS.mockUserId.slice(0, -1)}${index}`,
  email: `user${index}@example.com`,
  username: `user${index}`,
  firstName: 'User',
  lastName: index === 1 ? 'One' : 'Two',
  role: index === 1 ? 'user' : 'admin',
  subscriptionTier: index === 1 ? 'free' : 'expert',
  isEmailVerified: index === 1,
  lastLoginAt: `2024-01-0${index}T00:00:00.000Z`,
  createdAt: `2024-01-0${index}T00:00:00.000Z`,
  updatedAt: `2024-01-0${index}T00:00:00.000Z`,
  preferences: {
    theme: 'system' as const,
    emailNotifications: true,
    browserNotifications: false,
    timezone: 'UTC',
    language: 'en',
    diceRollAnimations: true,
    autoSaveEncounters: true,
  },
});

// Use shared mock utilities
export const createMockQueryChain = (mockUsers: any[] = []) => ({
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(mockUsers),
});

export const createMockSubscriptionStats = () => [
  { _id: 'free', count: 50 },
  { _id: 'expert', count: 30 },
  { _id: 'master', count: 10 },
];

/**
 * Stats test helpers - simplified through universal patterns
 */
export class StatsTestHelpers {
  static setupBasicMocks() {
    const MockedUser = jest.mocked(User);
    const mockConvertLeansUsersToPublic = jest.mocked(convertLeansUsersToPublic);
    const mockResponseHelpers = jest.mocked(UserServiceResponseHelpers);

    const mockUsers = [createMockUser(1), createMockUser(2)];
    const mockPublicUsers = [createMockPublicUser(1), createMockPublicUser(2)];

    // Use universal error patterns
    mockResponseHelpers.createSuccessResponse.mockImplementation((data) => ({
      success: true,
      data,
    }));
    mockResponseHelpers.handleCustomError.mockReturnValue({
      success: false,
      error: { message: 'Error', code: 'ERROR', statusCode: 500 },
    });

    mockConvertLeansUsersToPublic.mockReturnValue(mockPublicUsers);

    const mockQueryChain = createMockQueryChain(mockUsers);
    MockedUser.find = jest.fn().mockReturnValue(mockQueryChain);
    MockedUser.countDocuments = jest.fn().mockResolvedValue(10);
    MockedUser.aggregate = jest.fn().mockResolvedValue([]);

    return {
      MockedUser,
      mockConvertLeansUsersToPublic,
      mockResponseHelpers,
      mockUsers,
      mockPublicUsers,
      mockQueryChain,
    };
  }

  static setupGetUsersTest(MockedUser: any, customCount?: number, customUsers?: any[]) {
    const count = customCount ?? 10;
    const users = customUsers ?? [createMockUser(1), createMockUser(2)];
    const mockQueryChain = createMockQueryChain(users);

    MockedUser.find = jest.fn().mockReturnValue(mockQueryChain);
    MockedUser.countDocuments = jest.fn().mockResolvedValue(count);

    return { mockQueryChain, count, users };
  }

  static setupGetStatsTest(MockedUser: any) {
    const mockSubscriptionStats = createMockSubscriptionStats();

    MockedUser.countDocuments = jest.fn()
      .mockResolvedValueOnce(100) // totalUsers
      .mockResolvedValueOnce(80)  // verifiedUsers
      .mockResolvedValueOnce(60); // activeUsers

    MockedUser.aggregate = jest.fn().mockResolvedValue(mockSubscriptionStats);

    return { mockSubscriptionStats };
  }

  static getPrivateMethod(methodName: string) {
    const UserServiceStatsClass = UserServiceStats as any;
    return UserServiceStatsClass[methodName].bind(UserServiceStatsClass);
  }
}

/**
 * Stats assertion helpers - delegates to universal patterns where possible
 */
export class StatsAssertionHelpers {
  static expectSuccessResult = UniversalAssertions.expectStandardSuccess;

  static expectErrorResult(result: any, expectHandleCustomError?: any) {
    UniversalAssertions.expectStandardError(result);
    if (expectHandleCustomError) {
      expect(expectHandleCustomError).toHaveBeenCalled();
    }
  }

  static expectPaginationResult(result: any, page: number, limit: number, total: number) {
    expect(result.data?.pagination).toEqual({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  }

  static expectQueryChainCalls(mockQueryChain: any, skip: number, limit: number) {
    expect(mockQueryChain.skip).toHaveBeenCalledWith(skip);
    expect(mockQueryChain.limit).toHaveBeenCalledWith(limit);
  }

  static expectStatsResult(result: any) {
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
  }
}

/**
 * Stats test scenarios - leverages universal patterns for common operations
 */
export class StatsTestScenarios {
  static async testGetUsersSuccess(
    page: number = 1,
    limit: number = 20,
    filters?: any,
    setupMocks?: () => any
  ) {
    const mocks = setupMocks ? setupMocks() : StatsTestHelpers.setupBasicMocks();

    const result = await UserServiceStats.getUsers(page, limit, filters);

    StatsAssertionHelpers.expectSuccessResult(result);
    expect(mocks.MockedUser.find).toHaveBeenCalledWith(filters || {});

    return { result, mocks };
  }

  static async testGetUsersError(errorSetup: () => void, expectHandleCustomError: any) {
    errorSetup();

    const result = await UserServiceStats.getUsers();

    StatsAssertionHelpers.expectErrorResult(result, expectHandleCustomError);

    return result;
  }

  static async testGetStatsSuccess() {
    const mocks = StatsTestHelpers.setupBasicMocks();
    StatsTestHelpers.setupGetStatsTest(mocks.MockedUser);

    const result = await UserServiceStats.getUserStats();

    StatsAssertionHelpers.expectSuccessResult(result);
    StatsAssertionHelpers.expectStatsResult(result);

    return { result, mocks };
  }

  static async testGetStatsError(errorSetup: () => void, expectHandleCustomError: any) {
    errorSetup();

    const result = await UserServiceStats.getUserStats();

    StatsAssertionHelpers.expectErrorResult(result, expectHandleCustomError);

    return result;
  }
}