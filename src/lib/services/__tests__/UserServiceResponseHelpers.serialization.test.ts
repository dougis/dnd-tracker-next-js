import { UserServiceResponseHelpers } from '../UserServiceResponseHelpers';

describe('UserServiceResponseHelpers - Serialization Tests', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockDate = new Date('2024-01-01T00:00:00.000Z');

  describe('safeToPublicJSON', () => {
    it('should use toPublicJSON method when available', () => {
      const mockPublicData = {
        _id: mockUserId,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        subscriptionTier: 'free',
        preferences: {
          theme: 'dark',
          language: 'en',
          timezone: 'UTC',
          emailNotifications: true,
          pushNotifications: false,
          autoSaveEncounters: true,
        },
        isEmailVerified: true,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const userWithMethod = {
        toPublicJSON: jest.fn().mockReturnValue(mockPublicData),
      };

      const result = UserServiceResponseHelpers.safeToPublicJSON(userWithMethod);

      expect(userWithMethod.toPublicJSON).toHaveBeenCalled();
      expect(result).toEqual(mockPublicData);
    });

    it('should use fallback for user without toPublicJSON method', () => {
      const userWithoutMethod = {
        _id: { toString: () => mockUserId },
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        subscriptionTier: 'expert',
        preferences: {
          theme: 'light',
          language: 'es',
          timezone: 'PST',
          emailNotifications: false,
          pushNotifications: true,
          autoSaveEncounters: false,
        },
        isEmailVerified: false,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const result = UserServiceResponseHelpers.safeToPublicJSON(userWithoutMethod);

      expect(result).toEqual({
        _id: mockUserId,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        subscriptionTier: 'expert',
        preferences: {
          theme: 'light',
          language: 'es',
          timezone: 'PST',
          emailNotifications: false,
          pushNotifications: true,
          autoSaveEncounters: false,
        },
        isEmailVerified: false,
        createdAt: mockDate,
        updatedAt: mockDate,
      });
    });

    it('should handle user with string id instead of _id', () => {
      const userWithStringId = {
        id: 'string-id-123',
        email: 'test@example.com',
      };

      const result = UserServiceResponseHelpers.safeToPublicJSON(userWithStringId);

      expect(result._id).toBe('string-id-123');
    });

    it('should provide default values for missing properties', () => {
      const minimalUser = {};

      const result = UserServiceResponseHelpers.safeToPublicJSON(minimalUser);

      expect(result).toEqual({
        _id: undefined,
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        role: 'user',
        subscriptionTier: 'free',
        preferences: {
          theme: 'system',
          language: 'en',
          timezone: 'UTC',
          emailNotifications: true,
          pushNotifications: true,
          autoSaveEncounters: true,
        },
        isEmailVerified: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should handle user with null values', () => {
      const userWithNulls = {
        _id: null,
        email: null,
        username: null,
        firstName: null,
        lastName: null,
        role: null,
        subscriptionTier: null,
        preferences: null,
        isEmailVerified: null,
        createdAt: null,
        updatedAt: null,
      };

      const result = UserServiceResponseHelpers.safeToPublicJSON(userWithNulls);

      expect(result).toEqual({
        _id: undefined,
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        role: 'user',
        subscriptionTier: 'free',
        preferences: {
          theme: 'system',
          language: 'en',
          timezone: 'UTC',
          emailNotifications: true,
          pushNotifications: true,
          autoSaveEncounters: true,
        },
        isEmailVerified: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should handle ObjectId with toString method', () => {
      const userWithObjectId = {
        _id: {
          toString: jest.fn().mockReturnValue(mockUserId),
        },
        email: 'test@example.com',
      };

      const result = UserServiceResponseHelpers.safeToPublicJSON(userWithObjectId);

      expect(userWithObjectId._id.toString).toHaveBeenCalled();
      expect(result._id).toBe(mockUserId);
    });

    it('should handle partial preferences object', () => {
      const userWithPartialPrefs = {
        preferences: {
          theme: 'dark',
          language: 'fr',
        },
      };

      const result = UserServiceResponseHelpers.safeToPublicJSON(userWithPartialPrefs);

      expect(result.preferences).toEqual({
        theme: 'dark',
        language: 'fr',
      });
    });

    it('should handle circular references in user objects', () => {
      const circularUser: any = {
        _id: 'circular-id',
        email: 'circular@example.com',
      };
      circularUser.self = circularUser;

      // Should not throw despite circular reference
      const result = UserServiceResponseHelpers.safeToPublicJSON(circularUser);
      expect(result._id).toBe('circular-id');
      expect(result.email).toBe('circular@example.com');
    });

    it('should handle very large user objects', () => {
      const largeUser = {
        _id: 'large-id',
        email: 'large@example.com',
        largeField: 'x'.repeat(10000),
      };

      const result = UserServiceResponseHelpers.safeToPublicJSON(largeUser);
      expect(result._id).toBe('large-id');
      expect(result.email).toBe('large@example.com');
    });
  });
});
