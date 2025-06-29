import {
  buildQuery,
  executeBasicQuery,
  executeFullQuery,
  executeUserQuery,
  formatPaginatedResult,
  QueryFilters,
} from '../UserServiceQueryHelpers';
import type { PublicUser } from '@/lib/validations/user';

// Mock the User model
jest.mock('../../models/User', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
}));

// Mock convertLeansUsersToPublic
jest.mock('../UserServiceHelpers', () => ({
  convertLeansUsersToPublic: jest.fn(),
}));

// Import mocked dependencies
import User from '../../models/User';
import { convertLeansUsersToPublic } from '../UserServiceHelpers';

const mockUser = User as jest.Mocked<typeof User>;
const mockedConvertLeansUsersToPublic = jest.mocked(convertLeansUsersToPublic);

// Mock the query chain methods
const mockSort = jest.fn();
const mockSkip = jest.fn();
const mockLimit = jest.fn();
const mockLean = jest.fn();

describe('UserServiceQueryHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock chain
    mockUser.find.mockReturnValue({
      sort: mockSort,
    } as any);
    mockSort.mockReturnValue({
      skip: mockSkip,
    } as any);
    mockSkip.mockReturnValue({
      limit: mockLimit,
    } as any);
    mockLimit.mockReturnValue({
      lean: mockLean,
    } as any);
    mockLean.mockResolvedValue([]);
  });

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
      const mockUsers = [
        { _id: 'user1', email: 'user1@example.com' },
        { _id: 'user2', email: 'user2@example.com' },
      ];

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
      const mockUsers = [{ _id: 'user1' }];

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
      const mockUsers = [{ _id: 'user1' }];

      mockUser.find.mockResolvedValue(mockUsers as any);
      mockUser.countDocuments.mockResolvedValue(1);

      const result = await executeBasicQuery(query);

      expect(mockUser.find).toHaveBeenCalledWith({});
      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(1);
    });

    it('should handle database errors', async () => {
      const query = { role: 'user' };
      const dbError = new Error('Database connection failed');

      mockUser.find.mockRejectedValue(dbError);

      await expect(executeBasicQuery(query)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('executeFullQuery', () => {
    it('should execute full query chain with pagination', async () => {
      const query = { role: 'user' };
      const skip = 10;
      const limit = 5;
      const mockUsers = [{ _id: 'user1' }];
      const mockTotal = 25;

      mockLean.mockResolvedValue(mockUsers);
      mockUser.countDocuments.mockResolvedValue(mockTotal);

      const result = await executeFullQuery(query, skip, limit);

      expect(mockUser.find).toHaveBeenCalledWith(query);
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockSkip).toHaveBeenCalledWith(skip);
      expect(mockLimit).toHaveBeenCalledWith(limit);
      expect(mockLean).toHaveBeenCalled();
      expect(mockUser.countDocuments).toHaveBeenCalledWith(query);

      expect(result).toEqual({
        users: mockUsers,
        total: mockTotal,
      });
    });

    it('should handle zero skip and limit', async () => {
      const query = { role: 'admin' };
      const skip = 0;
      const limit = 0;
      const mockUsers: any[] = [];

      mockLean.mockResolvedValue(mockUsers);
      mockUser.countDocuments.mockResolvedValue(0);

      const result = await executeFullQuery(query, skip, limit);

      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(0);
      expect(result.users).toEqual([]);
    });

    it('should handle empty query', async () => {
      const query = {};
      const skip = 0;
      const limit = 10;
      const mockUsers = [{ _id: 'user1' }, { _id: 'user2' }];

      mockLean.mockResolvedValue(mockUsers);
      mockUser.countDocuments.mockResolvedValue(2);

      const result = await executeFullQuery(query, skip, limit);

      expect(mockUser.find).toHaveBeenCalledWith({});
      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(2);
    });

    it('should handle Promise.all execution', async () => {
      const query = { role: 'user' };
      const skip = 5;
      const limit = 3;

      // Mock both promises resolve
      mockLean.mockResolvedValue([{ _id: 'user1' }]);
      mockUser.countDocuments.mockResolvedValue(10);

      const result = await executeFullQuery(query, skip, limit);

      expect(result.users).toEqual([{ _id: 'user1' }]);
      expect(result.total).toBe(10);
    });

    it('should handle database errors in query execution', async () => {
      const query = { role: 'user' };
      const dbError = new Error('Query execution failed');

      mockLean.mockRejectedValue(dbError);

      await expect(executeFullQuery(query, 0, 10)).rejects.toThrow(
        'Query execution failed'
      );
    });

    it('should handle database errors in count operation', async () => {
      const query = { role: 'user' };
      const dbError = new Error('Count operation failed');

      mockLean.mockResolvedValue([]);
      mockUser.countDocuments.mockRejectedValue(dbError);

      await expect(executeFullQuery(query, 0, 10)).rejects.toThrow(
        'Count operation failed'
      );
    });
  });

  describe('executeUserQuery', () => {
    it('should use executeBasicQuery when in test environment (mock without sort)', async () => {
      const query = { role: 'user' };
      const skip = 0;
      const limit = 10;

      // Mock test environment - find returns function but no sort method
      mockUser.find.mockReturnValue((() => {}) as any);
      mockUser.find.mockResolvedValue([{ _id: 'user1' }] as any);
      mockUser.countDocuments.mockResolvedValue(1);

      const result = await executeUserQuery(query, skip, limit);

      expect(result).toEqual({
        users: [{ _id: 'user1' }],
        total: 1,
      });
    });

    it('should use executeFullQuery when in production environment', async () => {
      const query = { role: 'admin' };
      const skip = 5;
      const limit = 15;
      const mockUsers = [{ _id: 'admin1' }];

      // Mock production environment - find returns object with sort method
      mockUser.find.mockReturnValue({
        sort: mockSort,
      } as any);

      mockLean.mockResolvedValue(mockUsers);
      mockUser.countDocuments.mockResolvedValue(1);

      const result = await executeUserQuery(query, skip, limit);

      expect(mockUser.find).toHaveBeenCalledWith(query);
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockSkip).toHaveBeenCalledWith(skip);
      expect(mockLimit).toHaveBeenCalledWith(limit);
      expect(result).toEqual({
        users: mockUsers,
        total: 1,
      });
    });

    it('should handle empty query in both environments', async () => {
      const query = {};
      const skip = 0;
      const limit = 20;

      mockLean.mockResolvedValue([]);
      mockUser.countDocuments.mockResolvedValue(0);

      const result = await executeUserQuery(query, skip, limit);

      expect(result.users).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('formatPaginatedResult', () => {
    beforeEach(() => {
      mockedConvertLeansUsersToPublic.mockClear();
    });

    it('should format paginated result with converted users', () => {
      const users = [
        { _id: 'user1', email: 'user1@example.com' },
        { _id: 'user2', email: 'user2@example.com' },
      ];
      const publicUsers: PublicUser[] = [
        { id: 'user1', email: 'user1@example.com' } as PublicUser,
        { id: 'user2', email: 'user2@example.com' } as PublicUser,
      ];
      const total = 25;
      const page = 2;
      const limit = 10;

      mockedConvertLeansUsersToPublic.mockReturnValue(publicUsers);

      const result = formatPaginatedResult(users, total, page, limit);

      expect(mockedConvertLeansUsersToPublic).toHaveBeenCalledWith(users);
      expect(result).toEqual({
        data: publicUsers,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3, // Math.ceil(25/10) = 3
        },
      });
    });

    it('should handle empty users array', () => {
      const users: any[] = [];
      const publicUsers: PublicUser[] = [];
      const total = 0;
      const page = 1;
      const limit = 10;

      mockedConvertLeansUsersToPublic.mockReturnValue(publicUsers);

      const result = formatPaginatedResult(users, total, page, limit);

      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });

    it('should calculate totalPages correctly for exact division', () => {
      const users = [{ _id: 'user1' }];
      const publicUsers = [{ id: 'user1' }] as PublicUser[];
      const total = 20;
      const page = 2;
      const limit = 10;

      mockedConvertLeansUsersToPublic.mockReturnValue(publicUsers);

      const result = formatPaginatedResult(users, total, page, limit);

      expect(result.pagination.totalPages).toBe(2); // 20/10 = 2
    });

    it('should calculate totalPages correctly for partial pages', () => {
      const users = [{ _id: 'user1' }];
      const publicUsers = [{ id: 'user1' }] as PublicUser[];
      const total = 23;
      const page = 3;
      const limit = 10;

      mockedConvertLeansUsersToPublic.mockReturnValue(publicUsers);

      const result = formatPaginatedResult(users, total, page, limit);

      expect(result.pagination.totalPages).toBe(3); // Math.ceil(23/10) = 3
    });

    it('should handle single user per page', () => {
      const users = [{ _id: 'user1' }];
      const publicUsers = [{ id: 'user1' }] as PublicUser[];
      const total = 5;
      const page = 3;
      const limit = 1;

      mockedConvertLeansUsersToPublic.mockReturnValue(publicUsers);

      const result = formatPaginatedResult(users, total, page, limit);

      expect(result.pagination.totalPages).toBe(5); // 5/1 = 5
    });

    it('should handle zero total with non-zero limit', () => {
      const users: any[] = [];
      const publicUsers: PublicUser[] = [];
      const total = 0;
      const page = 1;
      const limit = 10;

      mockedConvertLeansUsersToPublic.mockReturnValue(publicUsers);

      const result = formatPaginatedResult(users, total, page, limit);

      expect(result.pagination.totalPages).toBe(0);
    });

    it('should handle large numbers', () => {
      const users = [{ _id: 'user1' }];
      const publicUsers = [{ id: 'user1' }] as PublicUser[];
      const total = 999;
      const page = 50;
      const limit = 20;

      mockedConvertLeansUsersToPublic.mockReturnValue(publicUsers);

      const result = formatPaginatedResult(users, total, page, limit);

      expect(result.pagination.totalPages).toBe(50); // Math.ceil(999/20) = 50
    });

    it('should preserve exact pagination values', () => {
      const users = [{ _id: 'user1' }];
      const publicUsers = [{ id: 'user1' }] as PublicUser[];
      const total = 100;
      const page = 7;
      const limit = 15;

      mockedConvertLeansUsersToPublic.mockReturnValue(publicUsers);

      const result = formatPaginatedResult(users, total, page, limit);

      expect(result.pagination).toEqual({
        page: 7,
        limit: 15,
        total: 100,
        totalPages: 7, // Math.ceil(100/15) = 7
      });
    });
  });
});
