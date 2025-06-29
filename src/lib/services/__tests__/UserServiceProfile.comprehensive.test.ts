import { UserServiceProfile } from '../UserServiceProfile';
import User from '../../models/User';
import { checkProfileUpdateConflicts } from '../UserServiceHelpers';
import {
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../UserServiceErrors';

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../UserServiceHelpers');
jest.mock('../UserServiceValidation');
jest.mock('../UserServiceDatabase');
jest.mock('../UserServiceLookup');
jest.mock('../UserServiceResponseHelpers');

const MockedUser = jest.mocked(User);
const mockCheckProfileUpdateConflicts = jest.mocked(checkProfileUpdateConflicts);

describe('UserServiceProfile - Comprehensive Tests', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockEmail = 'test@example.com';
  const mockUsername = 'testuser';
  
  const mockUserInstance = {
    _id: mockUserId,
    email: mockEmail,
    username: mockUsername,
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    subscriptionTier: 'free',
    isEmailVerified: false,
    save: jest.fn(),
    toPublicJSON: jest.fn().mockReturnValue({
      _id: mockUserId,
      email: mockEmail,
      username: mockUsername,
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      subscriptionTier: 'free',
      isEmailVerified: false,
    }),
  };

  const mockPublicUser = {
    _id: mockUserId,
    email: mockEmail,
    username: mockUsername,
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    subscriptionTier: 'free',
    isEmailVerified: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock UserServiceValidation
    const mockValidation = {
      validateAndParseProfileUpdate: jest.fn().mockReturnValue({
        firstName: 'Updated',
        lastName: 'Name',
      }),
      prepareConflictCheckParams: jest.fn().mockReturnValue({
        emailToCheck: undefined,
        usernameToCheck: undefined,
      }),
      extractUserIdString: jest.fn().mockReturnValue(mockUserId),
    };
    require('../UserServiceValidation').UserServiceValidation = mockValidation;

    // Mock UserServiceDatabase
    const mockDatabase = {
      updateUserFieldsAndSave: jest.fn(),
    };
    require('../UserServiceDatabase').UserServiceDatabase = mockDatabase;

    // Mock UserServiceLookup
    const mockLookup = {
      findUserOrError: jest.fn().mockResolvedValue({ success: true, data: mockUserInstance }),
      findUserByEmailOrThrow: jest.fn().mockResolvedValue(mockUserInstance),
    };
    require('../UserServiceLookup').UserServiceLookup = mockLookup;

    // Mock UserServiceResponseHelpers
    const mockResponseHelpers = {
      createSuccessResponse: jest.fn().mockImplementation((data) => ({ success: true, data })),
      createErrorResponse: jest.fn().mockImplementation((error) => ({ success: false, error })),
      safeToPublicJSON: jest.fn().mockReturnValue(mockPublicUser),
      handleCustomError: jest.fn().mockReturnValue({ success: false, error: { message: 'Error', code: 'ERROR', statusCode: 500 } }),
      handleValidationError: jest.fn().mockImplementation(() => {
        throw new Error('Not a validation error');
      }),
    };
    require('../UserServiceResponseHelpers').UserServiceResponseHelpers = mockResponseHelpers;
  });

  describe('getUserById', () => {
    it('should successfully retrieve user by ID', async () => {
      const result = await UserServiceProfile.getUserById(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPublicUser);
    });

    it('should return error for non-existent user', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserOrError.mockResolvedValue({
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND', statusCode: 404 }
      });

      const result = await UserServiceProfile.getUserById(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });

    it('should handle validation errors', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserOrError.mockRejectedValue(new Error('validation failed'));
      
      const mockResponseHelpers = require('../UserServiceResponseHelpers').UserServiceResponseHelpers;
      mockResponseHelpers.handleValidationError.mockReturnValue({
        success: false,
        error: { message: 'Validation error', code: 'VALIDATION_ERROR', statusCode: 400 }
      });

      const result = await UserServiceProfile.getUserById(mockUserId);

      expect(result.success).toBe(false);
    });

    it('should handle other errors with custom error handler', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserOrError.mockRejectedValue(new Error('Database error'));

      const result = await UserServiceProfile.getUserById(mockUserId);

      expect(result.success).toBe(false);
    });
  });

  describe('getUserByEmail', () => {
    it('should successfully retrieve user by email', async () => {
      const result = await UserServiceProfile.getUserByEmail(mockEmail);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPublicUser);
    });

    it('should return error for non-existent user', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserByEmailOrThrow.mockRejectedValue(new UserNotFoundError(mockEmail));

      const result = await UserServiceProfile.getUserByEmail(mockEmail);

      expect(result.success).toBe(false);
    });

    it('should handle database errors', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserByEmailOrThrow.mockRejectedValue(new Error('Database connection failed'));

      const result = await UserServiceProfile.getUserByEmail(mockEmail);

      expect(result.success).toBe(false);
    });
  });

  describe('updateUserProfile', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      preferences: {
        theme: 'dark' as const,
        emailNotifications: true,
        browserNotifications: false,
        timezone: 'UTC',
        language: 'en',
        diceRollAnimations: true,
        autoSaveEncounters: true,
      },
    };

    it('should successfully update user profile without conflicts', async () => {
      MockedUser.findById.mockResolvedValue(mockUserInstance as any);

      const result = await UserServiceProfile.updateUserProfile(mockUserId, updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPublicUser);
    });

    it('should return error for non-existent user', async () => {
      MockedUser.findById.mockResolvedValue(null);

      const result = await UserServiceProfile.updateUserProfile(mockUserId, updateData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });

    it('should handle email conflicts', async () => {
      MockedUser.findById.mockResolvedValue(mockUserInstance as any);
      const mockValidation = require('../UserServiceValidation').UserServiceValidation;
      mockValidation.prepareConflictCheckParams.mockReturnValue({
        emailToCheck: 'newemail@example.com',
        usernameToCheck: undefined,
      });
      mockCheckProfileUpdateConflicts.mockRejectedValue(new UserAlreadyExistsError('email', 'newemail@example.com'));

      const result = await UserServiceProfile.updateUserProfile(mockUserId, updateData);

      expect(result.success).toBe(false);
    });

    it('should handle username conflicts', async () => {
      MockedUser.findById.mockResolvedValue(mockUserInstance as any);
      const mockValidation = require('../UserServiceValidation').UserServiceValidation;
      mockValidation.prepareConflictCheckParams.mockReturnValue({
        emailToCheck: undefined,
        usernameToCheck: 'newusername',
      });
      mockCheckProfileUpdateConflicts.mockRejectedValue(new UserAlreadyExistsError('username', 'newusername'));

      const result = await UserServiceProfile.updateUserProfile(mockUserId, updateData);

      expect(result.success).toBe(false);
    });

    it('should skip conflict check when no email or username changes', async () => {
      MockedUser.findById.mockResolvedValue(mockUserInstance as any);

      const result = await UserServiceProfile.updateUserProfile(mockUserId, updateData);

      expect(mockCheckProfileUpdateConflicts).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should handle validation errors', async () => {
      const mockValidation = require('../UserServiceValidation').UserServiceValidation;
      mockValidation.validateAndParseProfileUpdate.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const result = await UserServiceProfile.updateUserProfile(mockUserId, updateData);

      expect(result.success).toBe(false);
    });

    it('should handle user without _id property', async () => {
      const userWithoutId = { ...mockUserInstance };
      delete userWithoutId._id;
      MockedUser.findById.mockResolvedValue(userWithoutId as any);
      const mockValidation = require('../UserServiceValidation').UserServiceValidation;
      mockValidation.prepareConflictCheckParams.mockReturnValue({
        emailToCheck: 'newemail@example.com',
        usernameToCheck: undefined,
      });

      const result = await UserServiceProfile.updateUserProfile(mockUserId, updateData);

      expect(mockCheckProfileUpdateConflicts).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should handle conflict check errors that are not UserAlreadyExistsError', async () => {
      MockedUser.findById.mockResolvedValue(mockUserInstance as any);
      const mockValidation = require('../UserServiceValidation').UserServiceValidation;
      mockValidation.prepareConflictCheckParams.mockReturnValue({
        emailToCheck: 'newemail@example.com',
        usernameToCheck: undefined,
      });
      mockCheckProfileUpdateConflicts.mockRejectedValue(new Error('Database error'));

      await expect(UserServiceProfile.updateUserProfile(mockUserId, updateData)).rejects.toThrow('Database error');
    });
  });

  describe('updateSubscription', () => {
    it('should successfully update user subscription', async () => {
      const result = await UserServiceProfile.updateSubscription(mockUserId, 'expert');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPublicUser);
    });

    it('should return error for non-existent user', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserOrError.mockResolvedValue({
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND', statusCode: 404 }
      });

      const result = await UserServiceProfile.updateSubscription(mockUserId, 'expert');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });

    it('should handle database errors during subscription update', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserOrError.mockRejectedValue(new Error('Database error'));

      const result = await UserServiceProfile.updateSubscription(mockUserId, 'expert');

      expect(result.success).toBe(false);
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete user', async () => {
      MockedUser.findByIdAndDelete.mockResolvedValue(mockUserInstance as any);

      const result = await UserServiceProfile.deleteUser(mockUserId);

      expect(result.success).toBe(true);
      expect(MockedUser.findByIdAndDelete).toHaveBeenCalledWith(mockUserId);
    });

    it('should return error for non-existent user', async () => {
      const mockLookup = require('../UserServiceLookup').UserServiceLookup;
      mockLookup.findUserOrError.mockResolvedValue({
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND', statusCode: 404 }
      });

      const result = await UserServiceProfile.deleteUser(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });

    it('should handle database errors during deletion', async () => {
      MockedUser.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

      const result = await UserServiceProfile.deleteUser(mockUserId);

      expect(result.success).toBe(false);
    });
  });

  describe('Private helper methods', () => {
    it('should handle findUserForProfileUpdate with valid user', async () => {
      MockedUser.findById.mockResolvedValue(mockUserInstance as any);

      // Access private method through reflection for testing
      const UserServiceProfileClass = UserServiceProfile as any;
      const result = await UserServiceProfileClass.findUserForProfileUpdate(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockUserInstance);
    });

    it('should handle findUserForProfileUpdate with non-existent user', async () => {
      MockedUser.findById.mockResolvedValue(null);

      // Access private method through reflection for testing
      const UserServiceProfileClass = UserServiceProfile as any;
      const result = await UserServiceProfileClass.findUserForProfileUpdate(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    });

    it('should handle handleProfileUpdateConflicts with no conflicts', async () => {
      const mockValidation = require('../UserServiceValidation').UserServiceValidation;
      mockValidation.prepareConflictCheckParams.mockReturnValue({
        emailToCheck: undefined,
        usernameToCheck: undefined,
      });

      // Access private method through reflection for testing
      const UserServiceProfileClass = UserServiceProfile as any;
      const result = await UserServiceProfileClass.handleProfileUpdateConflicts(mockUserInstance, { firstName: 'Test' });

      expect(result).toBeNull();
    });

    it('should handle handleProfileUpdateConflicts with conflicts found', async () => {
      const mockValidation = require('../UserServiceValidation').UserServiceValidation;
      mockValidation.prepareConflictCheckParams.mockReturnValue({
        emailToCheck: 'newemail@example.com',
        usernameToCheck: undefined,
      });
      mockCheckProfileUpdateConflicts.mockRejectedValue(new UserAlreadyExistsError('email', 'newemail@example.com'));

      // Access private method through reflection for testing
      const UserServiceProfileClass = UserServiceProfile as any;
      const result = await UserServiceProfileClass.handleProfileUpdateConflicts(mockUserInstance, { email: 'newemail@example.com' });

      expect(result?.success).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle malformed user ID', async () => {
      const result = await UserServiceProfile.getUserById('invalid-id');
      expect(result.success).toBe(false);
    });

    it('should handle empty email', async () => {
      const result = await UserServiceProfile.getUserByEmail('');
      expect(result.success).toBe(false);
    });

    it('should handle null update data', async () => {
      const result = await UserServiceProfile.updateUserProfile(mockUserId, null as any);
      expect(result.success).toBe(false);
    });

    it('should handle invalid subscription tier', async () => {
      const result = await UserServiceProfile.updateSubscription(mockUserId, 'invalid' as any);
      expect(result.success).toBe(false);
    });
  });
});