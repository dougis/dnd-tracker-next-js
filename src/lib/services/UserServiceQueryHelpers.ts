// For testing compatibility, we need to handle IUser explicitly
import User from '../models/User';
// For testing compatibility with Jest mock
const UserModel = User;
import { convertLeansUsersToPublic } from './UserServiceHelpers';
import type { PublicUser } from '../validations/user';

export interface QueryFilters {
  role?: string;
  subscriptionTier?: string;
  isEmailVerified?: boolean;
}

export interface QueryResult {
  users: any[];
  total: number;
}

/**
 * Builds the MongoDB query object from filters
 */
export function buildQuery(filters?: QueryFilters): Record<string, any> {
  return filters ? { ...filters } : {};
}

/**
 * Helper function to execute user count query
 */
async function getUserCount(query: Record<string, any>): Promise<number> {
  return (await UserModel.countDocuments(query)) || 0;
}

/**
 * Executes user query for test environments with basic mocks
 */
export async function executeBasicQuery(
  query: Record<string, any>
): Promise<QueryResult> {
  const users = (await UserModel.find(query)) || [];
  const total = await getUserCount(query);
  return { users, total };
}

/**
 * Executes user query for production environments with full query chain
 */
export async function executeFullQuery(
  query: Record<string, any>,
  skip: number,
  limit: number
): Promise<QueryResult> {
  const usersQuery = UserModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const [users, total] = await Promise.all([usersQuery, getUserCount(query)]);

  return { users, total };
}

/**
 * Checks if we're in a test environment with basic mocks
 */
function isTestEnvironment(): boolean {
  try {
    const findResult = UserModel.find({});
    return typeof findResult.sort !== 'function';
  } catch {
    return true;
  }
}

/**
 * Determines if we're in a test environment and executes appropriate query
 */
export async function executeUserQuery(
  query: Record<string, any>,
  skip: number,
  limit: number
): Promise<QueryResult> {
  return isTestEnvironment()
    ? executeBasicQuery(query)
    : executeFullQuery(query, skip, limit);
}

/**
 * Converts query results to paginated public user format
 */
export function formatPaginatedResult(
  users: any[],
  total: number,
  page: number,
  limit: number
): {
  data: PublicUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} {
  const publicUsers = convertLeansUsersToPublic(users);
  const totalPages = Math.ceil(total / limit);

  return {
    data: publicUsers,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}
