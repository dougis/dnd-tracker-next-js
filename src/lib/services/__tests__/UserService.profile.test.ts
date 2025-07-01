/**
 * UserService Profile Management Operations Tests
 * Tests delegation to UserServiceProfile module
 */

import { UserService } from '../UserService';
import { UserServiceProfile } from '../UserServiceProfile';
import { ServiceResult } from '../UserServiceErrors';
import type {
  UserProfileUpdate,
  PublicUser,
  SubscriptionTier,
} from '../../validations/user';

// Mock UserServiceProfile
jest.mock('../UserServiceProfile');

const mockUserServiceProfile = UserServiceProfile as jest.Mocked<typeof UserServiceProfile>;

describe('UserService Profile Management Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should delegate to UserServiceProfile.getUserById', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const expectedResult: ServiceResult<PublicUser> = {
        success: true,
        data: {
          _id: userId,
          email: 'test@example.com',
          username: 'testuser',
          subscriptionTier: 'free',
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockUserServiceProfile.getUserById.mockResolvedValue(expectedResult);

      const result = await UserService.getUserById(userId);

      expect(mockUserServiceProfile.getUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const expectedError: ServiceResult<PublicUser> = {
        success: false,
        error: {
          type: 'USER_NOT_FOUND',
          message: 'User not found',
          field: 'userId',
        },
      };

      mockUserServiceProfile.getUserById.mockResolvedValue(expectedError);

      const result = await UserService.getUserById(userId);

      expect(mockUserServiceProfile.getUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedError);
    });
  });

  describe('getUserByEmail', () => {
    it('should delegate to UserServiceProfile.getUserByEmail', async () => {
      const email = 'test@example.com';

      const expectedResult: ServiceResult<PublicUser> = {
        success: true,
        data: {
          _id: '507f1f77bcf86cd799439011',
          email: email,
          username: 'testuser',
          subscriptionTier: 'free',
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockUserServiceProfile.getUserByEmail.mockResolvedValue(expectedResult);

      const result = await UserService.getUserByEmail(email);

      expect(mockUserServiceProfile.getUserByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(expectedResult);
    });

    it('should handle user not found by email', async () => {
      const email = 'nonexistent@example.com';

      const expectedError: ServiceResult<PublicUser> = {
        success: false,
        error: {
          type: 'USER_NOT_FOUND',
          message: 'User not found',
          field: 'email',
        },
      };

      mockUserServiceProfile.getUserByEmail.mockResolvedValue(expectedError);

      const result = await UserService.getUserByEmail(email);

      expect(mockUserServiceProfile.getUserByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(expectedError);
    });
  });

  describe('updateUserProfile', () => {
    it('should delegate to UserServiceProfile.updateUserProfile', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateData: UserProfileUpdate = {
        username: 'newusername',
        firstName: 'John',
        lastName: 'Doe',
      };

      const expectedResult: ServiceResult<PublicUser> = {
        success: true,
        data: {
          _id: userId,
          email: 'test@example.com',
          username: 'newusername',
          firstName: 'John',
          lastName: 'Doe',
          subscriptionTier: 'free',
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockUserServiceProfile.updateUserProfile.mockResolvedValue(expectedResult);

      const result = await UserService.updateUserProfile(userId, updateData);

      expect(mockUserServiceProfile.updateUserProfile).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(expectedResult);
    });

    it('should handle update conflicts', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateData: UserProfileUpdate = {
        email: 'existing@example.com',
      };

      const expectedError: ServiceResult<PublicUser> = {
        success: false,
        error: {
          type: 'USER_ALREADY_EXISTS',
          message: 'User with this email already exists',
          field: 'email',
        },
      };

      mockUserServiceProfile.updateUserProfile.mockResolvedValue(expectedError);

      const result = await UserService.updateUserProfile(userId, updateData);

      expect(mockUserServiceProfile.updateUserProfile).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(expectedError);
    });
  });

  describe('updateSubscription', () => {
    it('should delegate to UserServiceProfile.updateSubscription', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const newTier: SubscriptionTier = 'pro';

      const expectedResult: ServiceResult<PublicUser> = {
        success: true,
        data: {
          _id: userId,
          email: 'test@example.com',
          username: 'testuser',
          subscriptionTier: 'pro',
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockUserServiceProfile.updateSubscription.mockResolvedValue(expectedResult);

      const result = await UserService.updateSubscription(userId, newTier);

      expect(mockUserServiceProfile.updateSubscription).toHaveBeenCalledWith(userId, newTier);
      expect(result).toEqual(expectedResult);
    });

    it('should handle subscription update for non-existent user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const newTier: SubscriptionTier = 'pro';

      const expectedError: ServiceResult<PublicUser> = {
        success: false,
        error: {
          type: 'USER_NOT_FOUND',
          message: 'User not found',
          field: 'userId',
        },
      };

      mockUserServiceProfile.updateSubscription.mockResolvedValue(expectedError);

      const result = await UserService.updateSubscription(userId, newTier);

      expect(mockUserServiceProfile.updateSubscription).toHaveBeenCalledWith(userId, newTier);
      expect(result).toEqual(expectedError);
    });
  });

  describe('deleteUser', () => {
    it('should delegate to UserServiceProfile.deleteUser', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const expectedResult: ServiceResult<void> = {
        success: true,
        data: undefined,
      };

      mockUserServiceProfile.deleteUser.mockResolvedValue(expectedResult);

      const result = await UserService.deleteUser(userId);

      expect(mockUserServiceProfile.deleteUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle delete user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const expectedError: ServiceResult<void> = {
        success: false,
        error: {
          type: 'USER_NOT_FOUND',
          message: 'User not found',
          field: 'userId',
        },
      };

      mockUserServiceProfile.deleteUser.mockResolvedValue(expectedError);

      const result = await UserService.deleteUser(userId);

      expect(mockUserServiceProfile.deleteUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedError);
    });
  });
});