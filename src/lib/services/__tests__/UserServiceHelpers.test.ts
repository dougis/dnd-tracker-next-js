import {
  checkUserExists,
  checkProfileUpdateConflicts,
  convertLeansUsersToPublic,
} from '../UserServiceHelpers';
import { UserAlreadyExistsError } from '../UserServiceErrors';

// Mock the User model
jest.mock('../../models/User', () => ({
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
}));

// Import the mocked User
import User from '../../models/User';
const mockUser = User as jest.Mocked<typeof User>;

describe('UserServiceHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkUserExists', () => {
    it('should not throw when no existing users found', async () => {
      mockUser.findByEmail.mockResolvedValue(null);
      mockUser.findByUsername.mockResolvedValue(null);

      await expect(
        checkUserExists('new@example.com', 'newuser')
      ).resolves.not.toThrow();

      expect(mockUser.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(mockUser.findByUsername).toHaveBeenCalledWith('newuser');
    });

    it('should throw UserAlreadyExistsError when email exists', async () => {
      const existingUser = { _id: 'user1', email: 'test@example.com' };
      mockUser.findByEmail.mockResolvedValue(existingUser);
      mockUser.findByUsername.mockResolvedValue(null);

      await expect(
        checkUserExists('test@example.com', 'newuser')
      ).rejects.toThrow(UserAlreadyExistsError);

      await expect(
        checkUserExists('test@example.com', 'newuser')
      ).rejects.toThrow('User already exists with email: test@example.com');
    });

    it('should throw UserAlreadyExistsError when username exists', async () => {
      const existingUser = { _id: 'user1', username: 'testuser' };
      mockUser.findByEmail.mockResolvedValue(null);
      mockUser.findByUsername.mockResolvedValue(existingUser);

      await expect(
        checkUserExists('new@example.com', 'testuser')
      ).rejects.toThrow(UserAlreadyExistsError);

      await expect(
        checkUserExists('new@example.com', 'testuser')
      ).rejects.toThrow('User already exists with username: testuser');
    });

    it('should throw UserAlreadyExistsError when both email and username exist', async () => {
      const existingEmailUser = { _id: 'user1', email: 'test@example.com' };
      const existingUsernameUser = { _id: 'user2', username: 'testuser' };

      mockUser.findByEmail.mockResolvedValue(existingEmailUser);
      mockUser.findByUsername.mockResolvedValue(existingUsernameUser);

      // Should throw for email first (order of checks)
      await expect(
        checkUserExists('test@example.com', 'testuser')
      ).rejects.toThrow('User already exists with email: test@example.com');
    });

    it('should handle empty string inputs', async () => {
      mockUser.findByEmail.mockResolvedValue(null);
      mockUser.findByUsername.mockResolvedValue(null);

      await expect(checkUserExists('', '')).resolves.not.toThrow();

      expect(mockUser.findByEmail).toHaveBeenCalledWith('');
      expect(mockUser.findByUsername).toHaveBeenCalledWith('');
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockUser.findByEmail.mockRejectedValue(dbError);

      await expect(
        checkUserExists('test@example.com', 'testuser')
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('checkProfileUpdateConflicts', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('should not throw when no email or username provided', async () => {
      await expect(
        checkProfileUpdateConflicts(userId)
      ).resolves.not.toThrow();

      expect(mockUser.findByEmail).not.toHaveBeenCalled();
      expect(mockUser.findByUsername).not.toHaveBeenCalled();
    });

    it('should not throw when email is available', async () => {
      mockUser.findByEmail.mockResolvedValue(null);

      await expect(
        checkProfileUpdateConflicts(userId, 'new@example.com')
      ).resolves.not.toThrow();

      expect(mockUser.findByEmail).toHaveBeenCalledWith('new@example.com');
    });

    it('should not throw when username is available', async () => {
      mockUser.findByUsername.mockResolvedValue(null);

      await expect(
        checkProfileUpdateConflicts(userId, undefined, 'newuser')
      ).resolves.not.toThrow();

      expect(mockUser.findByUsername).toHaveBeenCalledWith('newuser');
    });

    it('should not throw when email belongs to same user', async () => {
      const existingUser = {
        _id: { toString: () => userId },
        email: 'test@example.com'
      };
      mockUser.findByEmail.mockResolvedValue(existingUser);

      await expect(
        checkProfileUpdateConflicts(userId, 'test@example.com')
      ).resolves.not.toThrow();
    });

    it('should not throw when username belongs to same user', async () => {
      const existingUser = {
        _id: { toString: () => userId },
        username: 'testuser'
      };
      mockUser.findByUsername.mockResolvedValue(existingUser);

      await expect(
        checkProfileUpdateConflicts(userId, undefined, 'testuser')
      ).resolves.not.toThrow();
    });

    it('should throw UserAlreadyExistsError when email belongs to different user', async () => {
      const existingUser = {
        _id: { toString: () => 'different-user-id' },
        email: 'test@example.com'
      };
      mockUser.findByEmail.mockResolvedValue(existingUser);

      await expect(
        checkProfileUpdateConflicts(userId, 'test@example.com')
      ).rejects.toThrow(UserAlreadyExistsError);

      await expect(
        checkProfileUpdateConflicts(userId, 'test@example.com')
      ).rejects.toThrow('User already exists with email: test@example.com');
    });

    it('should throw UserAlreadyExistsError when username belongs to different user', async () => {
      const existingUser = {
        _id: { toString: () => 'different-user-id' },
        username: 'testuser'
      };
      mockUser.findByUsername.mockResolvedValue(existingUser);

      await expect(
        checkProfileUpdateConflicts(userId, undefined, 'testuser')
      ).rejects.toThrow(UserAlreadyExistsError);

      await expect(
        checkProfileUpdateConflicts(userId, undefined, 'testuser')
      ).rejects.toThrow('User already exists with username: testuser');
    });

    it('should handle both email and username updates', async () => {
      mockUser.findByEmail.mockResolvedValue(null);
      mockUser.findByUsername.mockResolvedValue(null);

      await expect(
        checkProfileUpdateConflicts(userId, 'new@example.com', 'newuser')
      ).resolves.not.toThrow();

      expect(mockUser.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(mockUser.findByUsername).toHaveBeenCalledWith('newuser');
    });

    it('should handle empty string values', async () => {
      // Empty strings are falsy, so the function should not call the database
      await expect(
        checkProfileUpdateConflicts(userId, '', '')
      ).resolves.not.toThrow();

      // Should not be called because empty strings are falsy
      expect(mockUser.findByEmail).not.toHaveBeenCalled();
      expect(mockUser.findByUsername).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockUser.findByEmail.mockRejectedValue(dbError);

      await expect(
        checkProfileUpdateConflicts(userId, 'test@example.com')
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('convertLeansUsersToPublic', () => {
    it('should return empty array for null input', () => {
      const result = convertLeansUsersToPublic(null as any);
      expect(result).toEqual([]);
    });

    it('should return empty array for undefined input', () => {
      const result = convertLeansUsersToPublic(undefined as any);
      expect(result).toEqual([]);
    });

    it('should return empty array for non-array input', () => {
      const result = convertLeansUsersToPublic('not an array' as any);
      expect(result).toEqual([]);
    });

    it('should return empty array for empty array input', () => {
      const result = convertLeansUsersToPublic([]);
      expect(result).toEqual([]);
    });

    it('should convert single user to public format', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        subscriptionTier: 'free',
        isEmailVerified: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        passwordHash: 'hashedpassword',
        emailVerificationToken: 'token123',
        passwordResetToken: 'resettoken',
        passwordResetExpires: new Date(),
      };

      const result = convertLeansUsersToPublic([user]);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        subscriptionTier: 'free',
        isEmailVerified: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });

      // Ensure sensitive fields are removed
      expect(result[0]).not.toHaveProperty('passwordHash');
      expect(result[0]).not.toHaveProperty('emailVerificationToken');
      expect(result[0]).not.toHaveProperty('passwordResetToken');
      expect(result[0]).not.toHaveProperty('passwordResetExpires');
    });

    it('should handle _id with toString method', () => {
      const user = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        email: 'test@example.com',
        username: 'testuser',
      };

      const result = convertLeansUsersToPublic([user]);

      expect(result[0].id).toBe('507f1f77bcf86cd799439011');
      expect(result[0]).not.toHaveProperty('_id');
    });

    it('should handle _id as string', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        username: 'testuser',
      };

      const result = convertLeansUsersToPublic([user]);

      expect(result[0].id).toBe('507f1f77bcf86cd799439011');
      expect(result[0]).not.toHaveProperty('_id');
    });

    it('should handle multiple users', () => {
      const users = [
        {
          _id: 'user1',
          email: 'user1@example.com',
          username: 'user1',
          passwordHash: 'hash1',
        },
        {
          _id: 'user2',
          email: 'user2@example.com',
          username: 'user2',
          passwordHash: 'hash2',
        },
      ];

      const result = convertLeansUsersToPublic(users);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('user1');
      expect(result[1].id).toBe('user2');
      expect(result[0]).not.toHaveProperty('passwordHash');
      expect(result[1]).not.toHaveProperty('passwordHash');
    });

    it('should filter out null users', () => {
      const users = [
        {
          _id: 'user1',
          email: 'user1@example.com',
          username: 'user1',
        },
        null,
        {
          _id: 'user2',
          email: 'user2@example.com',
          username: 'user2',
        },
      ];

      const result = convertLeansUsersToPublic(users);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('user1');
      expect(result[1].id).toBe('user2');
    });

    it('should filter out undefined users', () => {
      const users = [
        {
          _id: 'user1',
          email: 'user1@example.com',
          username: 'user1',
        },
        undefined,
        {
          _id: 'user2',
          email: 'user2@example.com',
          username: 'user2',
        },
      ];

      const result = convertLeansUsersToPublic(users);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('user1');
      expect(result[1].id).toBe('user2');
    });

    it('should handle users without _id field', () => {
      const user = {
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashedpassword',
      };

      const result = convertLeansUsersToPublic([user]);

      expect(result[0]).not.toHaveProperty('id');
      expect(result[0]).not.toHaveProperty('_id');
      expect(result[0]).not.toHaveProperty('passwordHash');
      expect(result[0].email).toBe('test@example.com');
    });

    it('should handle empty user objects', () => {
      const result = convertLeansUsersToPublic([{}]);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({});
    });

    it('should handle mixed valid and invalid users', () => {
      const users = [
        null,
        {
          _id: 'user1',
          email: 'user1@example.com',
          passwordHash: 'hash1',
        },
        undefined,
        {},
        {
          _id: 'user2',
          email: 'user2@example.com',
          passwordHash: 'hash2',
        },
      ];

      const result = convertLeansUsersToPublic(users);

      expect(result).toHaveLength(3); // 1 valid user + 1 empty object + 1 valid user
      expect(result[0].id).toBe('user1');
      expect(result[1]).toEqual({});
      expect(result[2].id).toBe('user2');
    });
  });
});
