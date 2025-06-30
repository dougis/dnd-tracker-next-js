import {
  buildQuery,
  executeBasicQuery,
  executeFullQuery,
  executeUserQuery,
  formatPaginatedResult,
  QueryFilters,
} from '../UserServiceQueryHelpers';
import {
  createMockUsers,
  createPublicUser,
  testDatabaseError,
  expectPaginationValues,
  testEmptyArrayPagination,
  testZeroTotalWithLimit,
  setupFormatPaginatedResultTest,
  executeQueryExecutionTest,
  setupExecuteUserQueryTest,
} from './testUtils';
import { setupUserMocks } from './mockSetup';

// Mock the User model
jest.mock('../../models/User', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
}));

// Mock convertLeansUsersToPublic
jest.mock('../UserServiceHelpers', () => ({
  convertLeansUsersToPublic: jest.fn(),
}));

import { convertLeansUsersToPublic } from '../UserServiceHelpers';
const mockedConvertLeansUsersToPublic = jest.mocked(convertLeansUsersToPublic);

const { mockUser, mockSort, mockSkip, mockLimit, mockLean, resetMocks } = setupUserMocks();

describe('UserServiceQueryHelpers', () => {
  beforeEach(resetMocks);

  describe('buildQuery', () => {
    it('should return empty object when no filters provided', () => {
      const result = buildQuery();
      expect(result).toEqual({});
    });

    it('should return empty object when undefined filters provided', () => {
      const result = buildQuery(undefined);
      expect(result).toEqual({});
    });

    it('should return filters object when provided', () => {
      const filters: QueryFilters = {
        role: 'admin',
        subscriptionTier: 'expert',
        isEmailVerified: true,
      };

      const result = buildQuery(filters);
      expect(result).toEqual(filters);
    });

    it('should handle partial filters', () => {
      const filters: QueryFilters = {
        role: 'user',
      };

      const result = buildQuery(filters);
      expect(result).toEqual({ role: 'user' });
    });

    it('should handle empty filters object', () => {
      const result = buildQuery({});
      expect(result).toEqual({});
    });

    it('should preserve all filter values', () => {
      const filters: QueryFilters = {
        role: 'admin',
        subscriptionTier: 'guild',
        isEmailVerified: false,
      };

      const result = buildQuery(filters);
      expect(result).toEqual({
        role: 'admin',
        subscriptionTier: 'guild',
        isEmailVerified: false,
      });
    });
  });

  describe('executeBasicQuery', () => {
    it('should execute query and return results with total count', async () => {
      const query = { role: 'user' };
      const mockUsers = createMockUsers(2);

      mockUser.find.mockResolvedValue(mockUsers as any);
      mockUser.countDocuments.mockResolvedValue(2);

      const result = await executeBasicQuery(query);

      expect(mockUser.find).toHaveBeenCalledWith(query);
      expect(mockUser.countDocuments).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        users: mockUsers,
        total: 2,
      });
    });

    it('should handle null users result', async () => {
      const query = { role: 'admin' };

      mockUser.find.mockResolvedValue(null as any);
      mockUser.countDocuments.mockResolvedValue(0);

      const result = await executeBasicQuery(query);

      expect(result).toEqual({
        users: [],
        total: 0,
      });
    });

    it('should handle null total count', async () => {
      const query = { role: 'user' };
      const mockUsers = [createMockUsers(1)[0]];

      mockUser.find.mockResolvedValue(mockUsers as any);
      mockUser.countDocuments.mockResolvedValue(null as any);

      const result = await executeBasicQuery(query);

      expect(result).toEqual({
        users: mockUsers,
        total: 0,
      });
    });

    it('should handle empty query object', async () => {
      const query = {};
      const mockUsers = [createMockUsers(1)[0]];

      mockUser.find.mockResolvedValue(mockUsers as any);
      mockUser.countDocuments.mockResolvedValue(1);

      const result = await executeBasicQuery(query);

      expect(mockUser.find).toHaveBeenCalledWith({});
      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(1);
    });

    it('should handle database errors', async () => {
      const query = { role: 'user' };
      mockUser.find.mockRejectedValue(new Error('Database connection failed'));

      await testDatabaseError(
        () => executeBasicQuery(query),
        'Database connection failed'
      );
    });
  });

  describe('executeFullQuery', () => {
    it('should execute full query chain with pagination', async () => {
      await executeQueryExecutionTest(
        { role: 'user' }, 10, 5, executeFullQuery,
        mockUser, mockSort, mockSkip, mockLimit, mockLean,
        createMockUsers(1), 25
      );
    });

    it('should handle zero skip and limit', async () => {
      await executeQueryExecutionTest(
        { role: 'admin' }, 0, 0, executeFullQuery,
        mockUser, mockSort, mockSkip, mockLimit, mockLean,
        [], 0
      );
    });

    it('should handle empty query', async () => {
      await executeQueryExecutionTest(
        {}, 0, 10, executeFullQuery,
        mockUser, mockSort, mockSkip, mockLimit, mockLean,
        createMockUsers(2)
      );
    });

    it('should handle Promise.all execution', async () => {
      await executeQueryExecutionTest(
        { role: 'user' }, 5, 3, executeFullQuery,
        mockUser, mockSort, mockSkip, mockLimit, mockLean,
        createMockUsers(1), 10
      );
    });

    it('should handle database errors in query execution', async () => {
      mockLean.mockRejectedValue(new Error('Query execution failed'));

      await testDatabaseError(
        () => executeFullQuery({ role: 'user' }, 0, 10),
        'Query execution failed'
      );
    });

    it('should handle database errors in count operation', async () => {
      mockLean.mockResolvedValue([]);
      mockUser.countDocuments.mockRejectedValue(new Error('Count operation failed'));

      await testDatabaseError(
        () => executeFullQuery({ role: 'user' }, 0, 10),
        'Count operation failed'
      );
    });
  });

  describe('executeUserQuery', () => {
    it('should use executeBasicQuery when in test environment (mock without sort)', async () => {
      const mockUsers = [createMockUsers(1)[0]];
      const testSetup = setupExecuteUserQueryTest(
        'test', { role: 'user' }, 0, 10, mockUsers, 1, mockUser
      );

      const result = await testSetup.executeTest(executeUserQuery);
      expect(result).toEqual({ users: mockUsers, total: 1 });
    });

    it('should use executeFullQuery when in production environment', async () => {
      const mockUsers = createMockUsers(1);
      const testSetup = setupExecuteUserQueryTest(
        'production', { role: 'admin' }, 5, 15, mockUsers, 1,
        mockUser, mockSort, mockSkip, mockLimit, mockLean
      );

      await testSetup.executeTest(executeUserQuery);
    });

    it('should handle empty query in both environments', async () => {
      mockLean.mockResolvedValue([]);
      mockUser.countDocuments.mockResolvedValue(0);

      const result = await executeUserQuery({}, 0, 20);

      expect(result.users).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('formatPaginatedResult', () => {
    beforeEach(() => {
      mockedConvertLeansUsersToPublic.mockClear();
    });

    it('should format paginated result with converted users', () => {
      const testSetup = setupFormatPaginatedResultTest(25, 2, 10, 3, mockedConvertLeansUsersToPublic, 2);
      const result = testSetup.executeTest(formatPaginatedResult);

      expect(mockedConvertLeansUsersToPublic).toHaveBeenCalledWith(testSetup.users);
      expect(result.data).toEqual(testSetup.publicUsers);
    });

    it('should handle empty users array', () => {
      testEmptyArrayPagination(formatPaginatedResult, mockedConvertLeansUsersToPublic);
    });

    it('should calculate totalPages correctly for exact division', () => {
      const testSetup = setupFormatPaginatedResultTest(20, 2, 10, 2, mockedConvertLeansUsersToPublic);
      testSetup.executeTest(formatPaginatedResult);
    });

    it('should calculate totalPages correctly for partial pages', () => {
      const testSetup = setupFormatPaginatedResultTest(23, 3, 10, 3, mockedConvertLeansUsersToPublic);
      testSetup.executeTest(formatPaginatedResult);
    });

    it('should handle single user per page', () => {
      const testSetup = setupFormatPaginatedResultTest(5, 3, 1, 5, mockedConvertLeansUsersToPublic);
      testSetup.executeTest(formatPaginatedResult);
    });

    it('should handle zero total with non-zero limit', () => {
      testZeroTotalWithLimit(formatPaginatedResult, mockedConvertLeansUsersToPublic);
    });

    it('should handle large numbers', () => {
      const users = createMockUsers(1);
      const publicUsers = [createPublicUser({ _id: 'user1' })];
      const total = 999;
      const page = 50;
      const limit = 20;

      mockedConvertLeansUsersToPublic.mockReturnValue(publicUsers);

      const result = formatPaginatedResult(users, total, page, limit);

      expectPaginationValues(result.pagination, page, limit, total, 50);
    });

    it('should preserve exact pagination values', () => {
      const users = createMockUsers(1);
      const publicUsers = [createPublicUser({ _id: 'user1' })];
      const total = 100;
      const page = 7;
      const limit = 15;

      mockedConvertLeansUsersToPublic.mockReturnValue(publicUsers);

      const result = formatPaginatedResult(users, total, page, limit);

      expectPaginationValues(result.pagination, page, limit, total, 7);
    });
  });
});
