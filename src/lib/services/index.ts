/**
 * Central export file for all service layers in the D&D Encounter Tracker
 *
 * This file provides a single point of import for all business logic services
 * used throughout the application.
 */

// User service
export { UserService } from './UserService';
export type { PaginatedResult, UserStats } from './UserService';

// Export custom error classes and service types for use in API routes
export type { ServiceResult } from './UserServiceErrors';
export {
  UserServiceError,
  UserNotFoundError,
  UserAlreadyExistsError,
  InvalidCredentialsError,
  TokenExpiredError,
  TokenInvalidError,
  handleServiceError,
} from './UserServiceErrors';

// Export helper functions for reuse in other services
export {
  checkUserExists,
  checkProfileUpdateConflicts,
  convertLeansUsersToPublic,
} from './UserServiceHelpers';
