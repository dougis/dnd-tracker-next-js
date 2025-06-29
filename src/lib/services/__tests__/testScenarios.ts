import type { PublicUser } from '@/lib/validations/user';
import { createMockUsers, createUserWithObjectId } from './testDataFactories';
import { expectPaginationValues, expectQueryChainCalls, expectPaginatedResult } from './testAssertions';

/**
 * Common test scenario functions for UserService tests
 */

// Common test scenarios
export const testDatabaseError = async (
  testFunction: () => Promise<any>,
  expectedMessage: string = 'Database connection failed'
) => {
  await expect(testFunction()).rejects.toThrow(expectedMessage);
};

export const setupConflictTest = (mockUser: any, type: 'email' | 'username', value: string, conflictUserId?: string) => {
  const existingUser = type === 'email'
    ? createUserWithObjectId(conflictUserId || 'different-user-id', { email: value })
    : createUserWithObjectId(conflictUserId || 'different-user-id', { username: value });

  if (type === 'email') {
    mockUser.findByEmail.mockResolvedValue(existingUser);
    mockUser.findByUsername.mockResolvedValue(null);
  } else {
    mockUser.findByEmail.mockResolvedValue(null);
    mockUser.findByUsername.mockResolvedValue(existingUser);
  }

  return existingUser;
};

// Common test scenario functions
export const setupQueryTest = (mockUsers: any[], total: number = mockUsers.length) => ({
  mockUsers,
  total,
  setupMocks: (mockUser: any, mockLean: any) => {
    mockLean.mockResolvedValue(mockUsers);
    mockUser.countDocuments.mockResolvedValue(total);
  }
});

/**
 * Test helper for filtering null/undefined values in user arrays
 * @param filterType - 'null' or 'undefined'
 * @param convertFunction - The function to test
 */
export const testFilterInvalidUsers = (
  filterType: 'null' | 'undefined',
  convertFunction: (_users: any[]) => any[]
) => {
  const [user1, user2] = createMockUsers(2);
  const invalidValue = filterType === 'null' ? null : undefined;
  const users = [user1, invalidValue, user2];

  const result = convertFunction(users);

  expect(result).toHaveLength(2);
  expect(result[0].id).toBe('user1');
  expect(result[1].id).toBe('user2');
};

/**
 * Test helper for empty array scenarios in pagination
 * @param formatFunction - The function to test
 * @param mockConverter - Mock function for user conversion
 */
export const testEmptyArrayPagination = (
  formatFunction: (_users: any[], _total: number, _page: number, _limit: number) => any,
  mockConverter?: jest.Mock
) => {
  const users: any[] = [];
  const publicUsers: PublicUser[] = [];
  const total = 0;
  const page = 1;
  const limit = 10;

  if (mockConverter) {
    mockConverter.mockReturnValue(publicUsers);
  }

  const result = formatFunction(users, total, page, limit);

  if (result.data !== undefined) {
    expect(result.data).toEqual([]);
  }
  if (result.pagination) {
    expectPaginationValues(result.pagination, page, limit, total, 0);
  }
  return result;
};

/**
 * Test helper for zero total with non-zero limit scenarios
 * @param formatFunction - The function to test
 * @param mockConverter - Mock function for user conversion
 */
export const testZeroTotalWithLimit = (
  formatFunction: (_users: any[], _total: number, _page: number, _limit: number) => any,
  mockConverter?: jest.Mock
) => {
  const users: any[] = [];
  const publicUsers: PublicUser[] = [];
  const total = 0;
  const page = 1;
  const limit = 10;

  if (mockConverter) {
    mockConverter.mockReturnValue(publicUsers);
  }

  const result = formatFunction(users, total, page, limit);

  if (result.pagination) {
    expectPaginationValues(result.pagination, page, limit, total, 0);
  }
  return result;
};

/**
 * Common test setup for query execution tests
 * @param query - Query object
 * @param skip - Skip value
 * @param limit - Limit value
 * @param mockUsers - Mock users array
 * @param total - Total count
 */
export const setupQueryExecutionTest = (
  query: any,
  skip: number,
  limit: number,
  mockUsers: any[] = createMockUsers(1),
  total: number = mockUsers.length
) => {
  const testSetup = setupQueryTest(mockUsers, total);
  return {
    query,
    skip,
    limit,
    testSetup,
    expectations: {
      expectSuccess: (result: any, mockUser: any, mockSort: any, mockSkip: any, mockLimit: any, mockLean: any) => {
        expectQueryChainCalls(mockUser, mockSort, mockSkip, mockLimit, mockLean, query, skip, limit);
        expectPaginatedResult(result, testSetup.mockUsers, testSetup.total);
      }
    }
  };
};

export const setupDatabaseErrorTest = (
  mockObject: any,
  mockMethod: string,
  errorMessage: string = 'Database connection failed'
) => {
  mockObject[mockMethod].mockRejectedValue(new Error(errorMessage));

  return {
    testError: async (testFunction: () => Promise<any>) => {
      await testDatabaseError(testFunction, errorMessage);
    }
  };
};

export const executeQueryExecutionTest = async (
  _query: any,
  _skip: number,
  _limit: number,
  queryFunction: (_query: any, _skip: number, _limit: number) => Promise<any>,
  mockUser: any,
  mockSort: any,
  mockSkip: any,
  mockLimit: any,
  mockLean: any,
  mockUsers: any[] = createMockUsers(1),
  total: number = mockUsers.length
) => {
  const testData = setupQueryExecutionTest(_query, _skip, _limit, mockUsers, total);
  testData.testSetup.setupMocks(mockUser, mockLean);

  const result = await queryFunction(_query, _skip, _limit);

  testData.expectations.expectSuccess(result, mockUser, mockSort, mockSkip, mockLimit, mockLean);
  return result;
};

export const setupExecuteUserQueryTest = (
  environment: 'test' | 'production',
  query: any,
  skip: number,
  limit: number,
  mockUsers: any[],
  total: number,
  mockUser: any,
  mockSort?: any,
  mockSkip?: any,
  mockLimit?: any,
  mockLean?: any
) => {
  if (environment === 'test') {
    // Mock test environment - find returns function but no sort method
    mockUser.find.mockReturnValue((() => {}) as any);
    mockUser.find.mockResolvedValue(mockUsers as any);
    mockUser.countDocuments.mockResolvedValue(total);
  } else {
    // Mock production environment - find returns object with sort method
    mockUser.find.mockReturnValue({
      sort: mockSort,
    } as any);

    const testSetup = setupQueryTest(mockUsers, total);
    testSetup.setupMocks(mockUser, mockLean);
  }

  return {
    executeTest: async (executeFunction: any) => {
      const result = await executeFunction(query, skip, limit);

      if (environment === 'test') {
        expect(result).toEqual({
          users: mockUsers,
          total,
        });
      } else {
        expectQueryChainCalls(mockUser, mockSort, mockSkip, mockLimit, mockLean, query, skip, limit);
        expectPaginatedResult(result, mockUsers, total);
      }

      return result;
    }
  };
};
