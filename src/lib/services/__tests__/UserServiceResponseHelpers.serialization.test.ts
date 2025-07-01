import { UserServiceResponseHelpers } from '../UserServiceResponseHelpers';
import {
  createMockUserForSerialization,
  expectDefaultUserValues,
  TEST_USER_ID,
} from './testUtils';

describe('UserServiceResponseHelpers - Serialization Tests', () => {
  const mockUserId = TEST_USER_ID;
  const mockDate = new Date('2024-01-01T00:00:00.000Z');

  describe('safeToPublicJSON', () => {
    it('should use toPublicJSON method when available', () => {
      const userWithMethod = createMockUserForSerialization('withMethod');
      const result =
        UserServiceResponseHelpers.safeToPublicJSON(userWithMethod);

      expect(userWithMethod.toPublicJSON).toHaveBeenCalled();
      expect(result).toEqual(userWithMethod.toPublicJSON());
    });

    it('should use fallback for user without toPublicJSON method', () => {
      const userWithoutMethod = createMockUserForSerialization('withoutMethod');
      const result =
        UserServiceResponseHelpers.safeToPublicJSON(userWithoutMethod);

      expect(result).toEqual({
        id: mockUserId,
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
      const userWithStringId = createMockUserForSerialization('withStringId');
      const result =
        UserServiceResponseHelpers.safeToPublicJSON(userWithStringId);

      expect(result.id).toBe('string-id-123');
    });

    it('should provide default values for missing properties', () => {
      const minimalUser = createMockUserForSerialization('minimal');
      const result = UserServiceResponseHelpers.safeToPublicJSON(minimalUser);

      expectDefaultUserValues(result);
    });

    it('should handle user with null values', () => {
      const userWithNulls = createMockUserForSerialization('withNulls');
      const result = UserServiceResponseHelpers.safeToPublicJSON(userWithNulls);

      expectDefaultUserValues(result);
    });

    it('should handle ObjectId with toString method', () => {
      const userWithObjectId = createMockUserForSerialization('withObjectId');
      const result =
        UserServiceResponseHelpers.safeToPublicJSON(userWithObjectId);

      expect(userWithObjectId._id.toString).toHaveBeenCalled();
      expect(result.id).toBe(mockUserId);
    });

    it('should handle partial preferences object', () => {
      const userWithPartialPrefs =
        createMockUserForSerialization('withPartialPrefs');
      const result =
        UserServiceResponseHelpers.safeToPublicJSON(userWithPartialPrefs);

      expect(result.preferences).toEqual({
        theme: 'dark',
        language: 'fr',
      });
    });

    it('should handle circular references in user objects', () => {
      const circularUser = createMockUserForSerialization('circular');

      // Should not throw despite circular reference
      const result = UserServiceResponseHelpers.safeToPublicJSON(circularUser);
      expect(result.id).toBe('circular-id');
      expect(result.email).toBe('circular@example.com');
    });

    it('should handle very large user objects', () => {
      const largeUser = createMockUserForSerialization('large');

      const result = UserServiceResponseHelpers.safeToPublicJSON(largeUser);
      expect(result.id).toBe('large-id');
      expect(result.email).toBe('large@example.com');
    });
  });
});
