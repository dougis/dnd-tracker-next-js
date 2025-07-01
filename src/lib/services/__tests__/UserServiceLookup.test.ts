import '../__test-helpers__/test-setup';
import { UserServiceLookup } from '../UserServiceLookup';
import { mockUserData } from '../__test-helpers__/test-setup';

// Get reference to mocked User
const User = require('../../models/User').default;

describe('UserServiceLookup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserOrError', () => {
    it('should return success result when user found', async () => {
      User.findById.mockResolvedValue(mockUserData);
      
      const result = await UserServiceLookup.findUserOrError('valid-id');
      
      expect(User.findById).toHaveBeenCalledWith('valid-id');
      expect(result.success).toEqual(mockUserData);
    });

    it('should return error result when user not found', async () => {
      User.findById.mockResolvedValue(null);
      
      const result = await UserServiceLookup.findUserOrError('invalid-id');
      
      expect(User.findById).toHaveBeenCalledWith('invalid-id');
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('User not found');
    });

    it('should handle multiple scenarios', async () => {
      const testIds = ['id1', 'id2', 'id3', 'id4', 'id5'];
      for (const id of testIds) {
        const returnValue = testIds.indexOf(id) % 2 === 0 ? mockUserData : null;
        User.findById.mockResolvedValueOnce(returnValue);
        
        const result = await UserServiceLookup.findUserOrError(id);
        
        if (returnValue) {
          expect(result.success).toEqual(mockUserData);
        } else {
          expect(result.error).toBeDefined();
        }
      }
    });
  });

  describe('findUserByIdOrThrow', () => {
    it('should return user when found', async () => {
      User.findById.mockResolvedValue(mockUserData);
      
      const result = await UserServiceLookup.findUserByIdOrThrow('valid-id');
      
      expect(result).toEqual(mockUserData);
    });

    it('should throw when user not found', async () => {
      User.findById.mockResolvedValue(null);
      
      await expect(UserServiceLookup.findUserByIdOrThrow('invalid-id')).rejects.toThrow('User not found');
    });

    it('should handle multiple scenarios', async () => {
      const testIds = ['throw1', 'throw2', 'throw3'];
      for (const id of testIds) {
        User.findById.mockResolvedValueOnce(null);
        await expect(UserServiceLookup.findUserByIdOrThrow(id)).rejects.toThrow();
      }
    });
  });

  describe('findUserByEmailOrThrow', () => {
    it('should return user when found', async () => {
      User.findByEmail.mockResolvedValue(mockUserData);
      
      const result = await UserServiceLookup.findUserByEmailOrThrow('test@example.com');
      
      expect(result).toEqual(mockUserData);
    });

    it('should throw when user not found', async () => {
      User.findByEmail.mockResolvedValue(null);
      
      await expect(UserServiceLookup.findUserByEmailOrThrow('invalid@example.com')).rejects.toThrow('User not found');
    });

    it('should handle multiple email scenarios', async () => {
      const emails = ['email1@test.com', 'email2@test.com'];
      for (const email of emails) {
        User.findByEmail.mockResolvedValueOnce(null);
        await expect(UserServiceLookup.findUserByEmailOrThrow(email)).rejects.toThrow();
      }
    });
  });

  describe('findUserByEmailNullable', () => {
    it('should return user when found', async () => {
      User.findByEmail.mockResolvedValue(mockUserData);
      
      const result = await UserServiceLookup.findUserByEmailNullable('test@example.com');
      
      expect(result).toEqual(mockUserData);
    });

    it('should return null when user not found', async () => {
      User.findByEmail.mockResolvedValue(null);
      
      const result = await UserServiceLookup.findUserByEmailNullable('invalid@example.com');
      
      expect(result).toBeNull();
    });

    it('should handle multiple email scenarios', async () => {
      const emails = ['valid@test.com', 'invalid@test.com'];
      for (const email of emails) {
        const returnValue = email.includes('valid') ? mockUserData : null;
        User.findByEmail.mockResolvedValueOnce(returnValue);
        
        const result = await UserServiceLookup.findUserByEmailNullable(email);
        expect(result).toEqual(returnValue);
      }
    });
  });

  describe('findUserByResetTokenOrThrow', () => {
    it('should return user when found', async () => {
      User.findByResetToken.mockResolvedValue(mockUserData);
      
      const result = await UserServiceLookup.findUserByResetTokenOrThrow('valid-token');
      
      expect(result).toEqual(mockUserData);
    });

    it('should throw when user not found', async () => {
      User.findByResetToken.mockResolvedValue(null);
      
      await expect(UserServiceLookup.findUserByResetTokenOrThrow('invalid-token')).rejects.toThrow('Password reset');
    });

    it('should handle multiple token scenarios', async () => {
      const tokens = ['token1', 'token2', 'token3'];
      for (const token of tokens) {
        User.findByResetToken.mockResolvedValueOnce(null);
        await expect(UserServiceLookup.findUserByResetTokenOrThrow(token)).rejects.toThrow();
      }
    });
  });

  describe('findUserByVerificationTokenOrThrow', () => {
    it('should return user when found', async () => {
      User.findByVerificationToken.mockResolvedValue(mockUserData);
      
      const result = await UserServiceLookup.findUserByVerificationTokenOrThrow('valid-token');
      
      expect(result).toEqual(mockUserData);
    });

    it('should throw when user not found', async () => {
      User.findByVerificationToken.mockResolvedValue(null);
      
      await expect(UserServiceLookup.findUserByVerificationTokenOrThrow('invalid-token')).rejects.toThrow('Email verification');
    });

    it('should handle multiple verification token scenarios', async () => {
      const tokens = ['verify1', 'verify2'];
      for (const token of tokens) {
        User.findByVerificationToken.mockResolvedValueOnce(null);
        await expect(UserServiceLookup.findUserByVerificationTokenOrThrow(token)).rejects.toThrow();
      }
    });
  });

  describe('userExists', () => {
    it('should return true when user exists', async () => {
      User.findById.mockResolvedValue(mockUserData);
      
      const result = await UserServiceLookup.userExists('valid-id');
      
      expect(result).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      User.findById.mockResolvedValue(null);
      
      const result = await UserServiceLookup.userExists('invalid-id');
      
      expect(result).toBe(false);
    });

    it('should handle multiple existence checks', async () => {
      const testIds = ['exists1', 'missing1', 'exists2', 'missing2'];
      for (const id of testIds) {
        const exists = id.includes('exists');
        User.findById.mockResolvedValueOnce(exists ? mockUserData : null);
        
        const result = await UserServiceLookup.userExists(id);
        expect(result).toBe(exists);
      }
    });
  });

  describe('emailExists', () => {
    it('should return true when email exists', async () => {
      User.findByEmail.mockResolvedValue(mockUserData);
      
      const result = await UserServiceLookup.emailExists('test@example.com');
      
      expect(result).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      User.findByEmail.mockResolvedValue(null);
      
      const result = await UserServiceLookup.emailExists('invalid@example.com');
      
      expect(result).toBe(false);
    });

    it('should handle multiple email existence checks', async () => {
      const emails = ['exists@test.com', 'missing@test.com'];
      for (const email of emails) {
        const exists = email.includes('exists');
        User.findByEmail.mockResolvedValueOnce(exists ? mockUserData : null);
        
        const result = await UserServiceLookup.emailExists(email);
        expect(result).toBe(exists);
      }
    });
  });

  describe('comprehensive coverage', () => {
    it('should handle edge cases for all methods', async () => {
      const edgeCases = ['', ' ', 'null', 'undefined'];
      
      for (const edgeCase of edgeCases) {
        // Test findUserOrError
        User.findById.mockResolvedValueOnce(null);
        const errorResult = await UserServiceLookup.findUserOrError(edgeCase);
        expect(errorResult.error).toBeDefined();
        
        // Test userExists
        User.findById.mockResolvedValueOnce(null);
        const existsResult = await UserServiceLookup.userExists(edgeCase);
        expect(existsResult).toBe(false);
        
        // Test emailExists  
        User.findByEmail.mockResolvedValueOnce(null);
        const emailExistsResult = await UserServiceLookup.emailExists(edgeCase);
        expect(emailExistsResult).toBe(false);
        
        // Test findUserByEmailNullable
        User.findByEmail.mockResolvedValueOnce(null);
        const nullableResult = await UserServiceLookup.findUserByEmailNullable(edgeCase);
        expect(nullableResult).toBeNull();
      }
    });

    it('should handle success scenarios for all methods', async () => {
      const successCases = ['success1', 'success2'];
      
      for (const successCase of successCases) {
        // Test findUserOrError success
        User.findById.mockResolvedValueOnce(mockUserData);
        const successResult = await UserServiceLookup.findUserOrError(successCase);
        expect(successResult.success).toEqual(mockUserData);
        
        // Test userExists success
        User.findById.mockResolvedValueOnce(mockUserData);
        const existsResult = await UserServiceLookup.userExists(successCase);
        expect(existsResult).toBe(true);
        
        // Test findUserByIdOrThrow success
        User.findById.mockResolvedValueOnce(mockUserData);
        const throwResult = await UserServiceLookup.findUserByIdOrThrow(successCase);
        expect(throwResult).toEqual(mockUserData);
      }
    });
  });
});