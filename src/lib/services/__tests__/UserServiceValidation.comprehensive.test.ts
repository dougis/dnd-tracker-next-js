import { UserServiceValidation } from '../UserServiceValidation';
import {
  userRegistrationSchema,
  userLoginSchema,
  userProfileUpdateSchema,
  changePasswordSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  emailVerificationSchema,
} from '../../validations/user';
import { TestPasswordConstants } from '../../test-utils/password-constants';

// Mock the validation schemas
jest.mock('../../validations/user');

const mockUserRegistrationSchema = jest.mocked(userRegistrationSchema);
const mockUserLoginSchema = jest.mocked(userLoginSchema);
const mockUserProfileUpdateSchema = jest.mocked(userProfileUpdateSchema);
const mockChangePasswordSchema = jest.mocked(changePasswordSchema);
const mockPasswordResetRequestSchema = jest.mocked(passwordResetRequestSchema);
const mockPasswordResetSchema = jest.mocked(passwordResetSchema);
const mockEmailVerificationSchema = jest.mocked(emailVerificationSchema);

describe('UserServiceValidation - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateAndParseRegistration', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      password: TestPasswordConstants.PASSWORD_123,
      confirmPassword: TestPasswordConstants.PASSWORD_123,
      agreeToTerms: true,
      subscribeToNewsletter: false,
    };

    it('should successfully validate and parse valid registration data', () => {
      const expectedResult = { ...validRegistrationData };
      mockUserRegistrationSchema.parse.mockReturnValue(expectedResult);

      const result = UserServiceValidation.validateAndParseRegistration(
        validRegistrationData
      );

      expect(mockUserRegistrationSchema.parse).toHaveBeenCalledWith(
        validRegistrationData
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw validation error for invalid data', () => {
      const invalidData = { email: 'invalid-email' };
      mockUserRegistrationSchema.parse.mockImplementation(() => {
        throw new Error('Invalid email format');
      });

      expect(() =>
        UserServiceValidation.validateAndParseRegistration(invalidData)
      ).toThrow('Invalid email format');
    });

    it('should handle undefined input', () => {
      mockUserRegistrationSchema.parse.mockImplementation(() => {
        throw new Error('Required field missing');
      });

      expect(() =>
        UserServiceValidation.validateAndParseRegistration(undefined)
      ).toThrow('Required field missing');
    });

    it('should handle null input', () => {
      mockUserRegistrationSchema.parse.mockImplementation(() => {
        throw new Error('Input cannot be null');
      });

      expect(() =>
        UserServiceValidation.validateAndParseRegistration(null)
      ).toThrow('Input cannot be null');
    });
  });

  describe('validateAndParseLogin', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: TestPasswordConstants.PASSWORD_123,
      rememberMe: false,
    };

    it('should successfully validate and parse valid login data', () => {
      const expectedResult = { ...validLoginData };
      mockUserLoginSchema.parse.mockReturnValue(expectedResult);

      const result =
        UserServiceValidation.validateAndParseLogin(validLoginData);

      expect(mockUserLoginSchema.parse).toHaveBeenCalledWith(validLoginData);
      expect(result).toEqual(expectedResult);
    });

    it('should throw validation error for missing password', () => {
      const invalidData = { email: 'test@example.com' };
      mockUserLoginSchema.parse.mockImplementation(() => {
        throw new Error('Password is required');
      });

      expect(() =>
        UserServiceValidation.validateAndParseLogin(invalidData)
      ).toThrow('Password is required');
    });

    it('should throw validation error for invalid email format', () => {
      const invalidData = { email: 'invalid-email', password: TestPasswordConstants.PASSWORD_123 };
      mockUserLoginSchema.parse.mockImplementation(() => {
        throw new Error('Invalid email format');
      });

      expect(() =>
        UserServiceValidation.validateAndParseLogin(invalidData)
      ).toThrow('Invalid email format');
    });
  });

  describe('validateAndParseProfileUpdate', () => {
    const validUpdateData = {
      firstName: 'Updated',
      lastName: 'Name',
      email: 'newemail@example.com',
      username: 'newusername',
    };

    it('should successfully validate and parse valid profile update data', () => {
      const expectedResult = { ...validUpdateData };
      mockUserProfileUpdateSchema.parse.mockReturnValue(expectedResult);

      const result =
        UserServiceValidation.validateAndParseProfileUpdate(validUpdateData);

      expect(mockUserProfileUpdateSchema.parse).toHaveBeenCalledWith(
        validUpdateData
      );
      expect(result).toEqual(expectedResult);
    });

    it('should allow partial updates', () => {
      const partialData = { firstName: 'Updated' };
      mockUserProfileUpdateSchema.parse.mockReturnValue(partialData);

      const result =
        UserServiceValidation.validateAndParseProfileUpdate(partialData);

      expect(result).toEqual(partialData);
    });

    it('should throw validation error for invalid email in update', () => {
      const invalidData = { email: 'invalid-email' };
      mockUserProfileUpdateSchema.parse.mockImplementation(() => {
        throw new Error('Invalid email format');
      });

      expect(() =>
        UserServiceValidation.validateAndParseProfileUpdate(invalidData)
      ).toThrow('Invalid email format');
    });
  });

  describe('validateAndParsePasswordChange', () => {
    const validPasswordData = {
      currentPassword: TestPasswordConstants.OLD_PASSWORD,
      newPassword: TestPasswordConstants.NEW_PASSWORD,
      confirmNewPassword: TestPasswordConstants.NEW_PASSWORD,
    };

    it('should successfully validate and parse valid password change data', () => {
      const expectedResult = { ...validPasswordData };
      mockChangePasswordSchema.parse.mockReturnValue(expectedResult);

      const result =
        UserServiceValidation.validateAndParsePasswordChange(validPasswordData);

      expect(mockChangePasswordSchema.parse).toHaveBeenCalledWith(
        validPasswordData
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw validation error for mismatched passwords', () => {
      const invalidData = {
        currentPassword: TestPasswordConstants.OLD_PASSWORD,
        newPassword: TestPasswordConstants.NEW_PASSWORD,
        confirmNewPassword: TestPasswordConstants.DIFFERENT_PASSWORD,
      };
      mockChangePasswordSchema.parse.mockImplementation(() => {
        throw new Error('Passwords do not match');
      });

      expect(() =>
        UserServiceValidation.validateAndParsePasswordChange(invalidData)
      ).toThrow('Passwords do not match');
    });

    it('should throw validation error for weak new password', () => {
      const invalidData = {
        currentPassword: TestPasswordConstants.OLD_PASSWORD,
        newPassword: '123',
        confirmNewPassword: '123',
      };
      mockChangePasswordSchema.parse.mockImplementation(() => {
        throw new Error('Password too weak');
      });

      expect(() =>
        UserServiceValidation.validateAndParsePasswordChange(invalidData)
      ).toThrow('Password too weak');
    });
  });

  describe('validateAndParsePasswordResetRequest', () => {
    const validResetRequestData = {
      email: 'test@example.com',
    };

    it('should successfully validate and parse valid password reset request data', () => {
      const expectedResult = { ...validResetRequestData };
      mockPasswordResetRequestSchema.parse.mockReturnValue(expectedResult);

      const result = UserServiceValidation.validateAndParsePasswordResetRequest(
        validResetRequestData
      );

      expect(mockPasswordResetRequestSchema.parse).toHaveBeenCalledWith(
        validResetRequestData
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw validation error for invalid email', () => {
      const invalidData = { email: 'invalid-email' };
      mockPasswordResetRequestSchema.parse.mockImplementation(() => {
        throw new Error('Invalid email format');
      });

      expect(() =>
        UserServiceValidation.validateAndParsePasswordResetRequest(invalidData)
      ).toThrow('Invalid email format');
    });
  });

  describe('validateAndParsePasswordReset', () => {
    const validResetData = {
      token: 'valid-reset-token',
      password: TestPasswordConstants.NEW_PASSWORD,
      confirmPassword: TestPasswordConstants.NEW_PASSWORD,
    };

    it('should successfully validate and parse valid password reset data', () => {
      const expectedResult = { ...validResetData };
      mockPasswordResetSchema.parse.mockReturnValue(expectedResult);

      const result =
        UserServiceValidation.validateAndParsePasswordReset(validResetData);

      expect(mockPasswordResetSchema.parse).toHaveBeenCalledWith(
        validResetData
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw validation error for invalid token', () => {
      const invalidData = {
        token: '',
        password: TestPasswordConstants.NEW_PASSWORD,
        confirmPassword: TestPasswordConstants.NEW_PASSWORD,
      };
      mockPasswordResetSchema.parse.mockImplementation(() => {
        throw new Error('Token is required');
      });

      expect(() =>
        UserServiceValidation.validateAndParsePasswordReset(invalidData)
      ).toThrow('Token is required');
    });

    it('should throw validation error for mismatched passwords', () => {
      const invalidData = {
        token: 'valid-token',
        password: TestPasswordConstants.NEW_PASSWORD,
        confirmPassword: TestPasswordConstants.DIFFERENT_PASSWORD,
      };
      mockPasswordResetSchema.parse.mockImplementation(() => {
        throw new Error('Passwords do not match');
      });

      expect(() =>
        UserServiceValidation.validateAndParsePasswordReset(invalidData)
      ).toThrow('Passwords do not match');
    });
  });

  describe('validateAndParseEmailVerification', () => {
    const validVerificationData = {
      token: 'valid-verification-token',
    };

    it('should successfully validate and parse valid email verification data', () => {
      const expectedResult = { ...validVerificationData };
      mockEmailVerificationSchema.parse.mockReturnValue(expectedResult);

      const result = UserServiceValidation.validateAndParseEmailVerification(
        validVerificationData
      );

      expect(mockEmailVerificationSchema.parse).toHaveBeenCalledWith(
        validVerificationData
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw validation error for missing token', () => {
      const invalidData = {};
      mockEmailVerificationSchema.parse.mockImplementation(() => {
        throw new Error('Token is required');
      });

      expect(() =>
        UserServiceValidation.validateAndParseEmailVerification(invalidData)
      ).toThrow('Token is required');
    });

    it('should throw validation error for invalid token format', () => {
      const invalidData = { token: 123 };
      mockEmailVerificationSchema.parse.mockImplementation(() => {
        throw new Error('Token must be a string');
      });

      expect(() =>
        UserServiceValidation.validateAndParseEmailVerification(invalidData)
      ).toThrow('Token must be a string');
    });
  });

  describe('hasChanged', () => {
    it('should return true when new value is different from current value', () => {
      const result = UserServiceValidation.hasChanged(
        'old@example.com',
        'new@example.com'
      );
      expect(result).toBe(true);
    });

    it('should return false when new value is same as current value', () => {
      const result = UserServiceValidation.hasChanged(
        'same@example.com',
        'same@example.com'
      );
      expect(result).toBe(false);
    });

    it('should return false when new value is undefined', () => {
      const result = UserServiceValidation.hasChanged(
        'current@example.com',
        undefined
      );
      expect(result).toBe(false);
    });

    it('should return true when current value is undefined and new value is provided', () => {
      const result = UserServiceValidation.hasChanged(
        undefined,
        'new@example.com'
      );
      expect(result).toBe(true);
    });

    it('should return false when both values are undefined', () => {
      const result = UserServiceValidation.hasChanged(undefined, undefined);
      expect(result).toBe(false);
    });

    it('should return true when current value is empty string and new value is provided', () => {
      const result = UserServiceValidation.hasChanged('', 'new@example.com');
      expect(result).toBe(true);
    });

    it('should return false when new value is empty string and current is empty', () => {
      const result = UserServiceValidation.hasChanged('', '');
      expect(result).toBe(false);
    });
  });

  describe('prepareConflictCheckParams', () => {
    const mockUser = {
      email: 'current@example.com',
      username: 'currentuser',
    };

    it('should identify email change', () => {
      const validatedData = { email: 'new@example.com' };
      const result = UserServiceValidation.prepareConflictCheckParams(
        mockUser,
        validatedData
      );

      expect(result.emailToCheck).toBe('new@example.com');
      expect(result.usernameToCheck).toBeUndefined();
    });

    it('should identify username change', () => {
      const validatedData = { username: 'newuser' };
      const result = UserServiceValidation.prepareConflictCheckParams(
        mockUser,
        validatedData
      );

      expect(result.emailToCheck).toBeUndefined();
      expect(result.usernameToCheck).toBe('newuser');
    });

    it('should identify both email and username changes', () => {
      const validatedData = { email: 'new@example.com', username: 'newuser' };
      const result = UserServiceValidation.prepareConflictCheckParams(
        mockUser,
        validatedData
      );

      expect(result.emailToCheck).toBe('new@example.com');
      expect(result.usernameToCheck).toBe('newuser');
    });

    it('should return no conflicts when values are unchanged', () => {
      const validatedData = {
        email: 'current@example.com',
        username: 'currentuser',
      };
      const result = UserServiceValidation.prepareConflictCheckParams(
        mockUser,
        validatedData
      );

      expect(result.emailToCheck).toBeUndefined();
      expect(result.usernameToCheck).toBeUndefined();
    });

    it('should return no conflicts when no email or username in update', () => {
      const validatedData = { firstName: 'Updated' };
      const result = UserServiceValidation.prepareConflictCheckParams(
        mockUser,
        validatedData
      );

      expect(result.emailToCheck).toBeUndefined();
      expect(result.usernameToCheck).toBeUndefined();
    });

    it('should handle user with undefined email/username', () => {
      const userWithUndefined = { email: undefined, username: undefined };
      const validatedData = { email: 'new@example.com', username: 'newuser' };
      const result = UserServiceValidation.prepareConflictCheckParams(
        userWithUndefined,
        validatedData
      );

      expect(result.emailToCheck).toBe('new@example.com');
      expect(result.usernameToCheck).toBe('newuser');
    });

    it('should handle user with null email/username', () => {
      const userWithNull = { email: null, username: null };
      const validatedData = { email: 'new@example.com', username: 'newuser' };
      const result = UserServiceValidation.prepareConflictCheckParams(
        userWithNull,
        validatedData
      );

      expect(result.emailToCheck).toBe('new@example.com');
      expect(result.usernameToCheck).toBe('newuser');
    });
  });

  describe('extractUserIdString', () => {
    it('should extract user ID as string when _id has toString method', () => {
      const user = {
        _id: {
          toString: jest.fn().mockReturnValue('507f1f77bcf86cd799439011'),
        },
      };

      const result = UserServiceValidation.extractUserIdString(user);

      expect(result).toBe('507f1f77bcf86cd799439011');
      expect(user._id.toString).toHaveBeenCalled();
    });

    it('should extract user ID using String() when _id does not have toString method', () => {
      const user = {
        _id: 'string-id',
      };

      const result = UserServiceValidation.extractUserIdString(user);

      expect(result).toBe('string-id');
    });

    it('should extract numeric user ID as string', () => {
      const user = {
        _id: 12345,
      };

      const result = UserServiceValidation.extractUserIdString(user);

      expect(result).toBe('12345');
    });

    it('should throw error when user has no _id', () => {
      const user = {};

      expect(() => UserServiceValidation.extractUserIdString(user)).toThrow(
        'User ID not found'
      );
    });

    it('should throw error when user _id is null', () => {
      const user = { _id: null };

      expect(() => UserServiceValidation.extractUserIdString(user)).toThrow(
        'User ID not found'
      );
    });

    it('should throw error when user _id is undefined', () => {
      const user = { _id: undefined };

      expect(() => UserServiceValidation.extractUserIdString(user)).toThrow(
        'User ID not found'
      );
    });

    it('should handle ObjectId-like objects', () => {
      const user = {
        _id: {
          toString: jest.fn().mockReturnValue('507f1f77bcf86cd799439011'),
          toHexString: jest.fn(),
        },
      };

      const result = UserServiceValidation.extractUserIdString(user);

      expect(result).toBe('507f1f77bcf86cd799439011');
      expect(user._id.toString).toHaveBeenCalled();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle malformed input data gracefully', () => {
      mockUserRegistrationSchema.parse.mockImplementation(() => {
        throw new Error('Malformed data');
      });

      expect(() =>
        UserServiceValidation.validateAndParseRegistration('malformed')
      ).toThrow('Malformed data');
    });

    it('should handle schema validation throwing non-Error objects', () => {
      mockUserLoginSchema.parse.mockImplementation(() => {
        throw 'String error';
      });

      expect(() => UserServiceValidation.validateAndParseLogin({})).toThrow(
        'String error'
      );
    });

    it('should handle circular reference objects', () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      mockUserProfileUpdateSchema.parse.mockImplementation(() => {
        throw new Error('Circular reference detected');
      });

      expect(() =>
        UserServiceValidation.validateAndParseProfileUpdate(circularObj)
      ).toThrow('Circular reference detected');
    });

    it('should handle very large input objects', () => {
      const largeObj = {
        data: 'x'.repeat(10000),
      };

      mockUserRegistrationSchema.parse.mockImplementation(() => {
        throw new Error('Input too large');
      });

      expect(() =>
        UserServiceValidation.validateAndParseRegistration(largeObj)
      ).toThrow('Input too large');
    });
  });
});
