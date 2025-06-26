import User from '../models/User';
import { UserAlreadyExistsError } from './UserServiceErrors';
import type { PublicUser } from '../validations/user';

/**
 * Helper functions for UserService to reduce complexity
 */

/**
 * Check for existing users to prevent duplicates
 */
export async function checkUserExists(
  email: string,
  username: string
): Promise<void> {
  const existingUserByEmail = await User.findByEmail(email);
  if (existingUserByEmail) {
    throw new UserAlreadyExistsError('email', email);
  }

  const existingUserByUsername = await User.findByUsername(username);
  if (existingUserByUsername) {
    throw new UserAlreadyExistsError('username', username);
  }
}

/**
 * Check for conflicts when updating user profile
 */
export async function checkProfileUpdateConflicts(
  userId: string,
  email?: string,
  username?: string
): Promise<void> {
  if (email) {
    const existingUser = await User.findByEmail(email);
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new UserAlreadyExistsError('email', email);
    }
  }

  if (username) {
    const existingUser = await User.findByUsername(username);
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new UserAlreadyExistsError('username', username);
    }
  }
}

/**
 * Convert lean users to public format (for pagination results)
 */
export function convertLeansUsersToPublic(users: any[]): PublicUser[] {
  return users.map(user => {
    // Convert to public format manually since we're using lean()
    const {
      passwordHash: _passwordHash,
      emailVerificationToken: _emailVerificationToken,
      passwordResetToken: _passwordResetToken,
      passwordResetExpires: _passwordResetExpires,
      ...publicUser
    } = user;
    return publicUser as PublicUser;
  });
}
