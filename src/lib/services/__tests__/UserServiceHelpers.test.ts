import {
  checkUserExists,
  checkProfileUpdateConflicts,
  convertLeansUsersToPublic,
} from '../UserServiceHelpers';
import { UserAlreadyExistsError } from '../UserServiceErrors';
import {
  createMockUser,
  createMockUsers,
  testDatabaseError,
  expectSensitiveFieldsRemoved,
  expectUserIdConversion,
  expectMockCalls,
  expectErrorThrown,
  createExistingUserWithEmail,
  createExistingUserWithUsername,
  createUserWithObjectId,
  setupConflictTest,
  testFilterInvalidUsers,
  TEST_USER_ID,
  TEST_EMAIL,
  TEST_USERNAME,
} from './testUtils';
import { setupBasicUserMocks } from './mockSetup';

// Mock the User model
jest.mock('../../models/User', () => ({
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
}));

const { mockUser, resetMocks } = setupBasicUserMocks();

describe('UserServiceHelpers', () => {
  beforeEach(resetMocks);

  describe('checkUserExists', () => {
    it('should not throw when no existing users found', async () => {
      mockUser.findByEmail.mockResolvedValue(null);
      mockUser.findByUsername.mockResolvedValue(null);

      await expect(
        checkUserExists('new@example.com', 'newuser')
      ).resolves.not.toThrow();

      expectMockCalls(mockUser, 'new@example.com', 'newuser');
    });

    it('should throw UserAlreadyExistsError when email exists', async () => {
      setupConflictTest(mockUser, 'email', TEST_EMAIL);

      await expectErrorThrown(
        () => checkUserExists(TEST_EMAIL, 'newuser'),
        UserAlreadyExistsError,
        `User already exists with email: ${TEST_EMAIL}`
      );
    });

    it('should throw UserAlreadyExistsError when username exists', async () => {
      setupConflictTest(mockUser, 'username', TEST_USERNAME);

      await expectErrorThrown(
        () => checkUserExists('new@example.com', TEST_USERNAME),
        UserAlreadyExistsError,
        `User already exists with username: ${TEST_USERNAME}`
      );
    });

    it('should throw UserAlreadyExistsError when both email and username exist', async () => {
      const existingEmailUser = createExistingUserWithEmail(
        TEST_EMAIL,
        'user1'
      );
      const existingUsernameUser = createExistingUserWithUsername(
        TEST_USERNAME,
        'user2'
      );

      mockUser.findByEmail.mockResolvedValue(existingEmailUser as any);
      mockUser.findByUsername.mockResolvedValue(existingUsernameUser as any);

      // Should throw for email first (order of checks)
      await expect(checkUserExists(TEST_EMAIL, TEST_USERNAME)).rejects.toThrow(
        `User already exists with email: ${TEST_EMAIL}`
      );
    });

    it('should handle empty string inputs', async () => {
      mockUser.findByEmail.mockResolvedValue(null);
      mockUser.findByUsername.mockResolvedValue(null);

      await expect(checkUserExists('', '')).resolves.not.toThrow();

      expectMockCalls(mockUser, '', '');
    });

    it('should handle database errors gracefully', async () => {
      mockUser.findByEmail.mockRejectedValue(
        new Error('Database connection failed')
      );

      await testDatabaseError(
        () => checkUserExists(TEST_EMAIL, TEST_USERNAME),
        'Database connection failed'
      );
    });
  });

  describe('checkProfileUpdateConflicts', () => {
    const userId = TEST_USER_ID;

    it('should not throw when no email or username provided', async () => {
      await expect(checkProfileUpdateConflicts(userId)).resolves.not.toThrow();

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
      const existingUser = createUserWithObjectId(userId, {
        email: TEST_EMAIL,
      });
      mockUser.findByEmail.mockResolvedValue(existingUser as any);

      await expect(
        checkProfileUpdateConflicts(userId, TEST_EMAIL)
      ).resolves.not.toThrow();
    });

    it('should not throw when username belongs to same user', async () => {
      const existingUser = createUserWithObjectId(userId, {
        username: TEST_USERNAME,
      });
      mockUser.findByUsername.mockResolvedValue(existingUser as any);

      await expect(
        checkProfileUpdateConflicts(userId, undefined, TEST_USERNAME)
      ).resolves.not.toThrow();
    });

    it('should throw UserAlreadyExistsError when email belongs to different user', async () => {
      setupConflictTest(mockUser, 'email', TEST_EMAIL, 'different-user-id');

      await expectErrorThrown(
        () => checkProfileUpdateConflicts(userId, TEST_EMAIL),
        UserAlreadyExistsError,
        `User already exists with email: ${TEST_EMAIL}`
      );
    });

    it('should throw UserAlreadyExistsError when username belongs to different user', async () => {
      setupConflictTest(
        mockUser,
        'username',
        TEST_USERNAME,
        'different-user-id'
      );

      await expectErrorThrown(
        () => checkProfileUpdateConflicts(userId, undefined, TEST_USERNAME),
        UserAlreadyExistsError,
        `User already exists with username: ${TEST_USERNAME}`
      );
    });

    it('should handle both email and username updates', async () => {
      mockUser.findByEmail.mockResolvedValue(null);
      mockUser.findByUsername.mockResolvedValue(null);

      await expect(
        checkProfileUpdateConflicts(userId, 'new@example.com', 'newuser')
      ).resolves.not.toThrow();

      expectMockCalls(mockUser, 'new@example.com', 'newuser');
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
      mockUser.findByEmail.mockRejectedValue(
        new Error('Database connection failed')
      );

      await testDatabaseError(
        () => checkProfileUpdateConflicts(userId, TEST_EMAIL),
        'Database connection failed'
      );
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
      const user = createMockUser({
        passwordHash: 'hashedpassword',
        emailVerificationToken: 'token123',
        passwordResetToken: 'resettoken',
        passwordResetExpires: new Date(),
      });

      const result = convertLeansUsersToPublic([user]);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: TEST_USER_ID,
        email: TEST_EMAIL,
        username: TEST_USERNAME,
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        subscriptionTier: 'free',
        isEmailVerified: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });

      // Use helper for sensitive fields check
      expectSensitiveFieldsRemoved(result[0]);
    });

    it('should handle _id with toString method', () => {
      const user = createMockUser({
        _id: { toString: () => TEST_USER_ID },
      });

      const result = convertLeansUsersToPublic([user]);

      expectUserIdConversion(result[0], TEST_USER_ID);
    });

    it('should handle _id as string', () => {
      const user = createMockUser({ _id: TEST_USER_ID });

      const result = convertLeansUsersToPublic([user]);

      expectUserIdConversion(result[0], TEST_USER_ID);
    });

    it('should handle multiple users', () => {
      const users = createMockUsers(2).map((user, i) => ({
        ...user,
        passwordHash: `hash${i + 1}`,
      }));

      const result = convertLeansUsersToPublic(users);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('user1');
      expect(result[1].id).toBe('user2');
      expectSensitiveFieldsRemoved(result[0]);
      expectSensitiveFieldsRemoved(result[1]);
    });

    it('should filter out null users', () => {
      testFilterInvalidUsers('null', convertLeansUsersToPublic);
    });

    it('should filter out undefined users', () => {
      testFilterInvalidUsers('undefined', convertLeansUsersToPublic);
    });

    it('should handle users without _id field', () => {
      const user = createMockUser({
        _id: undefined,
        passwordHash: 'hashedpassword',
      });
      delete (user as any)._id; // Remove _id completely

      const result = convertLeansUsersToPublic([user]);

      expect(result[0]).not.toHaveProperty('id');
      expect(result[0]).not.toHaveProperty('_id');
      expectSensitiveFieldsRemoved(result[0]);
      expect(result[0].email).toBe(TEST_EMAIL);
    });

    it('should handle empty user objects', () => {
      const result = convertLeansUsersToPublic([{}]);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({});
    });

    it('should handle mixed valid and invalid users', () => {
      const [user1, user2] = createMockUsers(2).map((user, i) => ({
        ...user,
        passwordHash: `hash${i + 1}`,
      }));
      const users = [null, user1, undefined, {}, user2];

      const result = convertLeansUsersToPublic(users);

      expect(result).toHaveLength(3); // 1 valid user + 1 empty object + 1 valid user
      expect(result[0].id).toBe('user1');
      expect(result[1]).toEqual({});
      expect(result[2].id).toBe('user2');
    });
  });
});
