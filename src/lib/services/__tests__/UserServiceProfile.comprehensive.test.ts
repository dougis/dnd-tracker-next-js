import '../__test-helpers__/test-setup';
import { UserServiceProfile } from '../UserServiceProfile';
import User from '../../models/User';
import { checkProfileUpdateConflicts } from '../UserServiceHelpers';
import {
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../UserServiceErrors';
import { UserServiceValidation } from '../UserServiceValidation';
import { UserServiceDatabase } from '../UserServiceDatabase';
import { UserServiceLookup } from '../UserServiceLookup';
import { UserServiceResponseHelpers } from '../UserServiceResponseHelpers';
import {
  type UserProfileUpdate,
  type SubscriptionTier,
  type PublicUser,
} from '@/lib/validations/user';

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../UserServiceHelpers');
jest.mock('../UserServiceValidation');
jest.mock('../UserServiceDatabase');
jest.mock('../UserServiceLookup');
jest.mock('../UserServiceResponseHelpers');

const MockedUser = jest.mocked(User);
const mockCheckProfileUpdateConflicts = jest.mocked(checkProfileUpdateConflicts);

/**
 * Comprehensive test coverage for UserServiceProfile module
 * Target: 80%+ coverage from 43.75%
 * Focus on all acceptance criteria from issue #138
 */
describe('UserServiceProfile - Comprehensive Coverage Tests', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockEmail = 'test@example.com';
  const mockUsername = 'testuser';

  const mockUser = {
    _id: mockUserId,
    email: mockEmail,
    username: mockUsername,
    firstName: 'Test',
    lastName: 'User',
    role: 'user' as const,
    subscriptionTier: 'free' as SubscriptionTier,
    isEmailVerified: false,
    preferences: {
      theme: 'system' as const,
      emailNotifications: true,
      browserNotifications: false,
      timezone: 'UTC',
      language: 'en',
      diceRollAnimations: true,
      autoSaveEncounters: true,
    },
    save: jest.fn(),
    toPublicJSON: jest.fn(),
  };

  const mockPublicUser: PublicUser = {
    id: mockUserId,
    email: mockEmail,
    username: mockUsername,
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    subscriptionTier: 'free',
    isEmailVerified: false,
    preferences: {
      theme: 'system',
      emailNotifications: true,
      browserNotifications: false,
      timezone: 'UTC',
      language: 'en',
      diceRollAnimations: true,
      autoSaveEncounters: true,
    },
    lastLoginAt: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  function setupMocks() {
    // Mock UserServiceValidation
    const mockValidation = {
      validateAndParseProfileUpdate: jest.fn(),
      prepareConflictCheckParams: jest.fn(),
      extractUserIdString: jest.fn(),
    };
    (UserServiceValidation as any) = mockValidation;

    // Mock UserServiceDatabase
    const mockDatabase = {
      updateUserFieldsAndSave: jest.fn(),
    };
    (UserServiceDatabase as any) = mockDatabase;

    // Mock UserServiceLookup
    const mockLookup = {
      findUserOrError: jest.fn(),
      findUserByEmailOrThrow: jest.fn(),
    };
    (UserServiceLookup as any) = mockLookup;

    // Mock UserServiceResponseHelpers
    const mockResponseHelpers = {
      createSuccessResponse: jest.fn(),
      createErrorResponse: jest.fn(),
      safeToPublicJSON: jest.fn(),
      handleCustomError: jest.fn(),
      handleValidationError: jest.fn(),
    };
    (UserServiceResponseHelpers as any) = mockResponseHelpers;
  }

  describe('getUserById', () => {
    it('should successfully retrieve user by ID when user exists', async () => {
      // Setup
      const mockLookup = UserServiceLookup as any;
      const mockResponseHelpers = UserServiceResponseHelpers as any;
      
      mockLookup.findUserOrError.mockResolvedValue({
        success: true,
        data: mockUser,
      });
      mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);
      mockResponseHelpers.createSuccessResponse.mockReturnValue({
        success: true,
        data: mockPublicUser,
      });

      // Execute
      const result = await UserServiceProfile.getUserById(mockUserId);

      // Verify
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPublicUser);
      expect(mockLookup.findUserOrError).toHaveBeenCalledWith(mockUserId);
      expect(mockResponseHelpers.safeToPublicJSON).toHaveBeenCalledWith(mockUser);
    });

    it('should return error when user lookup fails', async () => {
      // Setup
      const mockLookup = UserServiceLookup as any;
      const errorResult = {
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND', statusCode: 404 },
      };
      mockLookup.findUserOrError.mockResolvedValue(errorResult);

      // Execute
      const result = await UserServiceProfile.getUserById(mockUserId);

      // Verify
      expect(result.success).toBe(false);
      expect(result).toEqual(errorResult);
    });

    it('should handle validation errors in getUserById', async () => {
      // Setup
      const mockLookup = UserServiceLookup as any;
      const mockResponseHelpers = UserServiceResponseHelpers as any;
      const validationError = new Error('Validation failed');
      
      mockLookup.findUserOrError.mockRejectedValue(validationError);
      mockResponseHelpers.handleValidationError.mockReturnValue({
        success: false,
        error: { message: 'Validation error', code: 'VALIDATION_ERROR', statusCode: 400 },
      });

      // Execute
      const result = await UserServiceProfile.getUserById(mockUserId);

      // Verify
      expect(result.success).toBe(false);
      expect(mockResponseHelpers.handleValidationError).toHaveBeenCalledWith(validationError);
    });

    it('should handle custom errors when validation error handling throws', async () => {
      // Setup
      const mockLookup = UserServiceLookup as any;
      const mockResponseHelpers = UserServiceResponseHelpers as any;
      const customError = new Error('Database error');
      
      mockLookup.findUserOrError.mockRejectedValue(customError);
      mockResponseHelpers.handleValidationError.mockImplementation(() => {
        throw new Error('Not a validation error');
      });
      mockResponseHelpers.handleCustomError.mockReturnValue({
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND', statusCode: 404 },
      });

      // Execute
      const result = await UserServiceProfile.getUserById(mockUserId);

      // Verify
      expect(result.success).toBe(false);
      expect(mockResponseHelpers.handleCustomError).toHaveBeenCalledWith(
        customError,
        'User not found',
        'USER_NOT_FOUND',
        404
      );
    });
  });

  describe('getUserByEmail', () => {
    it('should successfully retrieve user by email when user exists', async () => {
      // Setup
      const mockLookup = UserServiceLookup as any;
      const mockResponseHelpers = UserServiceResponseHelpers as any;
      
      mockLookup.findUserByEmailOrThrow.mockResolvedValue(mockUser);
      mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);
      mockResponseHelpers.createSuccessResponse.mockReturnValue({
        success: true,
        data: mockPublicUser,
      });

      // Execute
      const result = await UserServiceProfile.getUserByEmail(mockEmail);

      // Verify
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPublicUser);
      expect(mockLookup.findUserByEmailOrThrow).toHaveBeenCalledWith(mockEmail);
    });

    it('should handle errors when user lookup by email fails', async () => {
      // Setup
      const mockLookup = UserServiceLookup as any;
      const mockResponseHelpers = UserServiceResponseHelpers as any;
      const lookupError = new UserNotFoundError(mockEmail);
      
      mockLookup.findUserByEmailOrThrow.mockRejectedValue(lookupError);
      mockResponseHelpers.handleCustomError.mockReturnValue({
        success: false,
        error: { message: 'Failed to retrieve user', code: 'USER_RETRIEVAL_FAILED', statusCode: 500 },
      });

      // Execute
      const result = await UserServiceProfile.getUserByEmail(mockEmail);

      // Verify
      expect(result.success).toBe(false);
      expect(mockResponseHelpers.handleCustomError).toHaveBeenCalledWith(
        lookupError,
        'Failed to retrieve user',
        'USER_RETRIEVAL_FAILED'
      );
    });
  });

  describe('updateUserProfile', () => {
    const updateData: UserProfileUpdate = {
      firstName: 'Updated',
      lastName: 'Name',
      preferences: {
        theme: 'dark',
        emailNotifications: false,
        browserNotifications: true,
        timezone: 'America/New_York',
        language: 'es',
        diceRollAnimations: false,
        autoSaveEncounters: false,
      },
    };

    it('should successfully update user profile with valid data', async () => {
      // Setup
      const mockValidation = UserServiceValidation as any;
      const mockDatabase = UserServiceDatabase as any;
      const mockResponseHelpers = UserServiceResponseHelpers as any;
      
      MockedUser.findById.mockResolvedValue(mockUser);
      mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
      mockValidation.prepareConflictCheckParams.mockReturnValue({
        emailToCheck: undefined,
        usernameToCheck: undefined,
      });
      mockDatabase.updateUserFieldsAndSave.mockResolvedValue(undefined);
      mockResponseHelpers.createSuccessResponse.mockReturnValue({
        success: true,
        data: mockPublicUser,
      });
      mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);

      // Execute
      const result = await UserServiceProfile.updateUserProfile(mockUserId, updateData);

      // Verify
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPublicUser);
      expect(mockValidation.validateAndParseProfileUpdate).toHaveBeenCalledWith(updateData);
      expect(MockedUser.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockDatabase.updateUserFieldsAndSave).toHaveBeenCalledWith(mockUser, updateData);
    });

    it('should return error when user is not found for profile update', async () => {
      // Setup
      const mockValidation = UserServiceValidation as any;
      mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
      MockedUser.findById.mockResolvedValue(null);

      // Execute
      const result = await UserServiceProfile.updateUserProfile(mockUserId, updateData);

      // Verify
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_NOT_FOUND');
      expect(result.error?.message).toBe(`User not found: ${mockUserId}`);
      expect(result.error?.statusCode).toBe(404);
    });

    it('should handle email conflicts during profile update', async () => {
      // Setup
      const mockValidation = UserServiceValidation as any;
      const mockResponseHelpers = UserServiceResponseHelpers as any;
      const conflictError = new UserAlreadyExistsError('email', 'existing@example.com');
      
      MockedUser.findById.mockResolvedValue(mockUser);
      mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
      mockValidation.prepareConflictCheckParams.mockReturnValue({
        emailToCheck: 'existing@example.com',
        usernameToCheck: undefined,
      });
      mockValidation.extractUserIdString.mockReturnValue(mockUserId);
      mockCheckProfileUpdateConflicts.mockRejectedValue(conflictError);
      mockResponseHelpers.createErrorResponse.mockReturnValue({
        success: false,
        error: { message: 'Email already exists', code: 'USER_ALREADY_EXISTS', statusCode: 409 },
      });

      // Execute
      const result = await UserServiceProfile.updateUserProfile(mockUserId, updateData);

      // Verify
      expect(result.success).toBe(false);
      expect(mockCheckProfileUpdateConflicts).toHaveBeenCalledWith(
        mockUserId,
        'existing@example.com',
        undefined
      );
      expect(mockResponseHelpers.createErrorResponse).toHaveBeenCalledWith(conflictError);
    });

    it('should handle username conflicts during profile update', async () => {
      // Setup
      const mockValidation = UserServiceValidation as any;
      const mockResponseHelpers = UserServiceResponseHelpers as any;
      const conflictError = new UserAlreadyExistsError('username', 'existinguser');
      
      MockedUser.findById.mockResolvedValue(mockUser);
      mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
      mockValidation.prepareConflictCheckParams.mockReturnValue({
        emailToCheck: undefined,
        usernameToCheck: 'existinguser',
      });
      mockValidation.extractUserIdString.mockReturnValue(mockUserId);
      mockCheckProfileUpdateConflicts.mockRejectedValue(conflictError);
      mockResponseHelpers.createErrorResponse.mockReturnValue({
        success: false,
        error: { message: 'Username already exists', code: 'USER_ALREADY_EXISTS', statusCode: 409 },
      });

      // Execute
      const result = await UserServiceProfile.updateUserProfile(mockUserId, updateData);

      // Verify
      expect(result.success).toBe(false);
      expect(mockCheckProfileUpdateConflicts).toHaveBeenCalledWith(
        mockUserId,
        undefined,
        'existinguser'
      );
    });

    it('should skip conflict check when no email or username changes', async () => {
      // Setup
      const mockValidation = UserServiceValidation as any;
      const mockDatabase = UserServiceDatabase as any;
      const mockResponseHelpers = UserServiceResponseHelpers as any;
      
      MockedUser.findById.mockResolvedValue(mockUser);
      mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
      mockValidation.prepareConflictCheckParams.mockReturnValue({
        emailToCheck: undefined,
        usernameToCheck: undefined,
      });
      mockDatabase.updateUserFieldsAndSave.mockResolvedValue(undefined);
      mockResponseHelpers.createSuccessResponse.mockReturnValue({
        success: true,
        data: mockPublicUser,
      });
      mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);

      // Execute
      const result = await UserServiceProfile.updateUserProfile(mockUserId, updateData);

      // Verify
      expect(result.success).toBe(true);
      expect(mockCheckProfileUpdateConflicts).not.toHaveBeenCalled();
    });

    it('should handle user without _id property during conflict check', async () => {
      // Setup
      const userWithoutId = { ...mockUser };
      delete (userWithoutId as any)._id;
      
      const mockValidation = UserServiceValidation as any;
      const mockDatabase = UserServiceDatabase as any;
      const mockResponseHelpers = UserServiceResponseHelpers as any;
      
      MockedUser.findById.mockResolvedValue(userWithoutId);
      mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
      mockValidation.prepareConflictCheckParams.mockReturnValue({
        emailToCheck: 'new@example.com',
        usernameToCheck: undefined,
      });
      mockDatabase.updateUserFieldsAndSave.mockResolvedValue(undefined);
      mockResponseHelpers.createSuccessResponse.mockReturnValue({
        success: true,
        data: mockPublicUser,
      });
      mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);

      // Execute
      const result = await UserServiceProfile.updateUserProfile(mockUserId, updateData);

      // Verify
      expect(result.success).toBe(true);
      expect(mockCheckProfileUpdateConflicts).not.toHaveBeenCalled();
    });

    it('should propagate non-UserAlreadyExistsError from conflict check', async () => {
      // Setup
      const mockValidation = UserServiceValidation as any;
      const databaseError = new Error('Database connection failed');
      
      MockedUser.findById.mockResolvedValue(mockUser);
      mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
      mockValidation.prepareConflictCheckParams.mockReturnValue({
        emailToCheck: 'new@example.com',
        usernameToCheck: undefined,
      });
      mockValidation.extractUserIdString.mockReturnValue(mockUserId);
      mockCheckProfileUpdateConflicts.mockRejectedValue(databaseError);

      // Execute & Verify
      await expect(
        UserServiceProfile.updateUserProfile(mockUserId, updateData)
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle validation errors during profile update', async () => {
      // Setup
      const mockValidation = UserServiceValidation as any;
      const mockResponseHelpers = UserServiceResponseHelpers as any;
      const validationError = new Error('Invalid data');
      
      mockValidation.validateAndParseProfileUpdate.mockImplementation(() => {
        throw validationError;
      });
      mockResponseHelpers.handleCustomError.mockReturnValue({
        success: false,
        error: { message: 'Failed to update user profile', code: 'PROFILE_UPDATE_FAILED', statusCode: 500 },
      });

      // Execute
      const result = await UserServiceProfile.updateUserProfile(mockUserId, updateData);

      // Verify
      expect(result.success).toBe(false);
      expect(mockResponseHelpers.handleCustomError).toHaveBeenCalledWith(
        validationError,
        'Failed to update user profile',
        'PROFILE_UPDATE_FAILED'
      );
    });

    it('should handle UserAlreadyExistsError thrown during update process', async () => {
      // Setup
      const mockValidation = UserServiceValidation as any;
      const mockDatabase = UserServiceDatabase as any;
      const mockResponseHelpers = UserServiceResponseHelpers as any;
      const conflictError = new UserAlreadyExistsError('email', 'test@example.com');
      
      MockedUser.findById.mockResolvedValue(mockUser);
      mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
      mockValidation.prepareConflictCheckParams.mockReturnValue({
        emailToCheck: undefined,
        usernameToCheck: undefined,
      });
      mockDatabase.updateUserFieldsAndSave.mockRejectedValue(conflictError);
      mockResponseHelpers.createErrorResponse.mockReturnValue({
        success: false,
        error: { message: 'Email already exists', code: 'USER_ALREADY_EXISTS', statusCode: 409 },
      });

      // Execute
      const result = await UserServiceProfile.updateUserProfile(mockUserId, updateData);

      // Verify
      expect(result.success).toBe(false);
      expect(mockResponseHelpers.createErrorResponse).toHaveBeenCalledWith(conflictError);
    });
  });

  describe('updateSubscription', () => {
    const testTiers: SubscriptionTier[] = ['free', 'seasoned', 'expert', 'master', 'guild'];

    testTiers.forEach(tier => {
      it(`should successfully update subscription to ${tier}`, async () => {
        // Setup
        const mockLookup = UserServiceLookup as any;
        const mockDatabase = UserServiceDatabase as any;
        const mockResponseHelpers = UserServiceResponseHelpers as any;
        
        mockLookup.findUserOrError.mockResolvedValue({
          success: true,
          data: mockUser,
        });
        mockDatabase.updateUserFieldsAndSave.mockResolvedValue(undefined);
        mockResponseHelpers.createSuccessResponse.mockReturnValue({
          success: true,
          data: mockPublicUser,
        });
        mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);

        // Execute
        const result = await UserServiceProfile.updateSubscription(mockUserId, tier);

        // Verify
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockPublicUser);
        expect(mockDatabase.updateUserFieldsAndSave).toHaveBeenCalledWith(mockUser, {
          subscriptionTier: tier,
        });
      });
    });

    it('should return error when user is not found for subscription update', async () => {
      // Setup
      const mockLookup = UserServiceLookup as any;
      const errorResult = {
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND', statusCode: 404 },
      };
      mockLookup.findUserOrError.mockResolvedValue(errorResult);

      // Execute
      const result = await UserServiceProfile.updateSubscription(mockUserId, 'expert');

      // Verify
      expect(result.success).toBe(false);
      expect(result).toEqual(errorResult);
    });

    it('should handle database errors during subscription update', async () => {
      // Setup
      const mockLookup = UserServiceLookup as any;
      const mockResponseHelpers = UserServiceResponseHelpers as any;
      const databaseError = new Error('Database connection failed');
      
      mockLookup.findUserOrError.mockRejectedValue(databaseError);
      mockResponseHelpers.handleCustomError.mockReturnValue({
        success: false,
        error: { message: 'Failed to update subscription', code: 'SUBSCRIPTION_UPDATE_FAILED', statusCode: 500 },
      });

      // Execute
      const result = await UserServiceProfile.updateSubscription(mockUserId, 'expert');

      // Verify
      expect(result.success).toBe(false);
      expect(mockResponseHelpers.handleCustomError).toHaveBeenCalledWith(
        databaseError,
        'Failed to update subscription',
        'SUBSCRIPTION_UPDATE_FAILED'
      );
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete user when user exists', async () => {
      // Setup
      const mockLookup = UserServiceLookup as any;
      const mockResponseHelpers = UserServiceResponseHelpers as any;
      
      mockLookup.findUserOrError.mockResolvedValue({
        success: true,
        data: mockUser,
      });
      MockedUser.findByIdAndDelete.mockResolvedValue(mockUser);
      mockResponseHelpers.createSuccessResponse.mockReturnValue({
        success: true,
        data: undefined,
      });

      // Execute
      const result = await UserServiceProfile.deleteUser(mockUserId);

      // Verify
      expect(result.success).toBe(true);
      expect(mockLookup.findUserOrError).toHaveBeenCalledWith(mockUserId);
      expect(MockedUser.findByIdAndDelete).toHaveBeenCalledWith(mockUserId);
    });

    it('should return error when user is not found for deletion', async () => {
      // Setup
      const mockLookup = UserServiceLookup as any;
      const errorResult = {
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND', statusCode: 404 },
      };
      mockLookup.findUserOrError.mockResolvedValue(errorResult);

      // Execute
      const result = await UserServiceProfile.deleteUser(mockUserId);

      // Verify
      expect(result.success).toBe(false);
      expect(result).toEqual(errorResult);
      expect(MockedUser.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('should handle database errors during user deletion', async () => {
      // Setup
      const mockLookup = UserServiceLookup as any;
      const mockResponseHelpers = UserServiceResponseHelpers as any;
      const databaseError = new Error('Database connection failed');
      
      mockLookup.findUserOrError.mockResolvedValue({
        success: true,
        data: mockUser,
      });
      MockedUser.findByIdAndDelete.mockRejectedValue(databaseError);
      mockResponseHelpers.handleCustomError.mockReturnValue({
        success: false,
        error: { message: 'Failed to delete user', code: 'USER_DELETION_FAILED', statusCode: 500 },
      });

      // Execute
      const result = await UserServiceProfile.deleteUser(mockUserId);

      // Verify
      expect(result.success).toBe(false);
      expect(mockResponseHelpers.handleCustomError).toHaveBeenCalledWith(
        databaseError,
        'Failed to delete user',
        'USER_DELETION_FAILED'
      );
    });
  });

  describe('Private helper methods', () => {
    describe('findUserForProfileUpdate', () => {
      it('should return success result when user is found', async () => {
        // Setup
        const mockResponseHelpers = UserServiceResponseHelpers as any;
        MockedUser.findById.mockResolvedValue(mockUser);
        mockResponseHelpers.createSuccessResponse.mockReturnValue({
          success: true,
          data: mockUser,
        });

        // Execute
        const UserServiceProfileClass = UserServiceProfile as any;
        const result = await UserServiceProfileClass.findUserForProfileUpdate(mockUserId);

        // Verify
        expect(result.success).toBe(true);
        expect(result.data).toBe(mockUser);
        expect(MockedUser.findById).toHaveBeenCalledWith(mockUserId);
      });

      it('should return error result when user is not found', async () => {
        // Setup
        MockedUser.findById.mockResolvedValue(null);

        // Execute
        const UserServiceProfileClass = UserServiceProfile as any;
        const result = await UserServiceProfileClass.findUserForProfileUpdate(mockUserId);

        // Verify
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('USER_NOT_FOUND');
        expect(result.error?.message).toBe(`User not found: ${mockUserId}`);
        expect(result.error?.statusCode).toBe(404);
      });
    });

    describe('handleProfileUpdateConflicts', () => {
      it('should return null when no conflicts to check', async () => {
        // Setup
        const mockValidation = UserServiceValidation as any;
        mockValidation.prepareConflictCheckParams.mockReturnValue({
          emailToCheck: undefined,
          usernameToCheck: undefined,
        });

        // Execute
        const UserServiceProfileClass = UserServiceProfile as any;
        const result = await UserServiceProfileClass.handleProfileUpdateConflicts(
          mockUser,
          { firstName: 'Test' }
        );

        // Verify
        expect(result).toBeNull();
        expect(mockCheckProfileUpdateConflicts).not.toHaveBeenCalled();
      });

      it('should return error response when UserAlreadyExistsError is thrown', async () => {
        // Setup
        const mockValidation = UserServiceValidation as any;
        const mockResponseHelpers = UserServiceResponseHelpers as any;
        const conflictError = new UserAlreadyExistsError('email', 'test@example.com');
        
        mockValidation.prepareConflictCheckParams.mockReturnValue({
          emailToCheck: 'test@example.com',
          usernameToCheck: undefined,
        });
        mockValidation.extractUserIdString.mockReturnValue(mockUserId);
        mockCheckProfileUpdateConflicts.mockRejectedValue(conflictError);
        mockResponseHelpers.createErrorResponse.mockReturnValue({
          success: false,
          error: { message: 'Email already exists', code: 'USER_ALREADY_EXISTS', statusCode: 409 },
        });

        // Execute
        const UserServiceProfileClass = UserServiceProfile as any;
        const result = await UserServiceProfileClass.handleProfileUpdateConflicts(
          mockUser,
          { email: 'test@example.com' }
        );

        // Verify
        expect(result?.success).toBe(false);
        expect(mockResponseHelpers.createErrorResponse).toHaveBeenCalledWith(conflictError);
      });

      it('should propagate non-UserAlreadyExistsError', async () => {
        // Setup
        const mockValidation = UserServiceValidation as any;
        const databaseError = new Error('Database error');
        
        mockValidation.prepareConflictCheckParams.mockReturnValue({
          emailToCheck: 'test@example.com',
          usernameToCheck: undefined,
        });
        mockValidation.extractUserIdString.mockReturnValue(mockUserId);
        mockCheckProfileUpdateConflicts.mockRejectedValue(databaseError);

        // Execute & Verify
        const UserServiceProfileClass = UserServiceProfile as any;
        await expect(
          UserServiceProfileClass.handleProfileUpdateConflicts(
            mockUser,
            { email: 'test@example.com' }
          )
        ).rejects.toThrow('Database error');
      });

      it('should return null when no conflicts are found', async () => {
        // Setup
        const mockValidation = UserServiceValidation as any;
        
        mockValidation.prepareConflictCheckParams.mockReturnValue({
          emailToCheck: 'new@example.com',
          usernameToCheck: undefined,
        });
        mockValidation.extractUserIdString.mockReturnValue(mockUserId);
        mockCheckProfileUpdateConflicts.mockResolvedValue(undefined);

        // Execute
        const UserServiceProfileClass = UserServiceProfile as any;
        const result = await UserServiceProfileClass.handleProfileUpdateConflicts(
          mockUser,
          { email: 'new@example.com' }
        );

        // Verify
        expect(result).toBeNull();
        expect(mockCheckProfileUpdateConflicts).toHaveBeenCalledWith(
          mockUserId,
          'new@example.com',
          undefined
        );
      });
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle malformed user ID in getUserById', async () => {
      // Setup
      const mockLookup = UserServiceLookup as any;
      const invalidIdError = new Error('Invalid ObjectId');
      mockLookup.findUserOrError.mockRejectedValue(invalidIdError);

      // Execute
      const result = await UserServiceProfile.getUserById('invalid-id');

      // Verify
      expect(result.success).toBe(false);
    });

    it('should handle empty email in getUserByEmail', async () => {
      // Setup
      const mockLookup = UserServiceLookup as any;
      const emptyEmailError = new Error('Email is required');
      mockLookup.findUserByEmailOrThrow.mockRejectedValue(emptyEmailError);

      // Execute
      const result = await UserServiceProfile.getUserByEmail('');

      // Verify
      expect(result.success).toBe(false);
    });

    it('should handle null update data in updateUserProfile', async () => {
      // Setup
      const mockValidation = UserServiceValidation as any;
      const nullDataError = new Error('Update data is required');
      mockValidation.validateAndParseProfileUpdate.mockImplementation(() => {
        throw nullDataError;
      });

      // Execute
      const result = await UserServiceProfile.updateUserProfile(mockUserId, null as any);

      // Verify
      expect(result.success).toBe(false);
    });

    it('should handle invalid subscription tier in updateSubscription', async () => {
      // Setup
      const mockLookup = UserServiceLookup as any;
      const invalidTierError = new Error('Invalid subscription tier');
      mockLookup.findUserOrError.mockRejectedValue(invalidTierError);

      // Execute
      const result = await UserServiceProfile.updateSubscription(mockUserId, 'invalid' as any);

      // Verify
      expect(result.success).toBe(false);
    });
  });
});