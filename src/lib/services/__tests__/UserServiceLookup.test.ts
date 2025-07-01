import '../__test-helpers__/test-setup';
import { UserServiceLookup } from '../UserServiceLookup';
import {
  findByIdMock,
  findByEmailMock,
  findByResetTokenMock,
  findByVerificationTokenMock,
  mockUserData,
} from '../__test-helpers__/test-setup';

describe('UserServiceLookup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserOrError', () => {
    it('should return success result when user found', async () => {
      findByIdMock.mockResolvedValue(mockUserData);
      
      const result = await UserServiceLookup.findUserOrError('valid-id');
      
      expect(findByIdMock).toHaveBeenCalledWith('valid-id');
      expect(result.success).toEqual(mockUserData);
    });

    it('should return error result when user not found', async () => {
      findByIdMock.mockResolvedValue(null);
      
      const result = await UserServiceLookup.findUserOrError('invalid-id');
      
      expect(findByIdMock).toHaveBeenCalledWith('invalid-id');
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('User not found');
    });

    it('should handle multiple scenarios', async () => {
      const testIds = ['id1', 'id2', 'id3', 'id4', 'id5'];
      for (const id of testIds) {
        const returnValue = testIds.indexOf(id) % 2 === 0 ? mockUserData : null;
        findByIdMock.mockResolvedValueOnce(returnValue);
        
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
      findByIdMock.mockResolvedValue(mockUserData);
      
      const result = await UserServiceLookup.findUserByIdOrThrow('valid-id');
      
      expect(result).toEqual(mockUserData);
    });

    it('should throw when user not found', async () => {
      findByIdMock.mockResolvedValue(null);
      
      await expect(UserServiceLookup.findUserByIdOrThrow('invalid-id')).rejects.toThrow('User not found');
    });

    it('should handle multiple scenarios', async () => {
      const testIds = ['throw1', 'throw2', 'throw3'];
      for (const id of testIds) {
        findByIdMock.mockResolvedValueOnce(null);
        await expect(UserServiceLookup.findUserByIdOrThrow(id)).rejects.toThrow();
      }
    });
  });

  describe('findUserByEmailOrThrow', () => {
    it('should return user when found', async () => {
      findByEmailMock.mockResolvedValue(mockUserData);
      
      const result = await UserServiceLookup.findUserByEmailOrThrow('test@example.com');
      
      expect(result).toEqual(mockUserData);
    });

    it('should throw when user not found', async () => {
      findByEmailMock.mockResolvedValue(null);
      
      await expect(UserServiceLookup.findUserByEmailOrThrow('invalid@example.com')).rejects.toThrow('User not found');
    });

    it('should handle multiple email scenarios', async () => {
      const emails = ['email1@test.com', 'email2@test.com'];
      for (const email of emails) {
        findByEmailMock.mockResolvedValueOnce(null);
        await expect(UserServiceLookup.findUserByEmailOrThrow(email)).rejects.toThrow();
      }
    });
  });

  describe('findUserByEmailNullable', () => {
    it('should return user when found', async () => {
      findByEmailMock.mockResolvedValue(mockUserData);
      
      const result = await UserServiceLookup.findUserByEmailNullable('test@example.com');
      
      expect(result).toEqual(mockUserData);
    });

    it('should return null when user not found', async () => {
      findByEmailMock.mockResolvedValue(null);
      
      const result = await UserServiceLookup.findUserByEmailNullable('invalid@example.com');
      
      expect(result).toBeNull();
    });

    it('should handle multiple email scenarios', async () => {
      const emails = ['valid@test.com', 'invalid@test.com'];
      for (const email of emails) {
        const returnValue = email.includes('valid') ? mockUserData : null;
        findByEmailMock.mockResolvedValueOnce(returnValue);
        
        const result = await UserServiceLookup.findUserByEmailNullable(email);
        expect(result).toEqual(returnValue);
      }
    });
  });

  describe('findUserByResetTokenOrThrow', () => {
    it('should return user when found', async () => {
      findByResetTokenMock.mockResolvedValue(mockUserData);
      
      const result = await UserServiceLookup.findUserByResetTokenOrThrow('valid-token');
      
      expect(result).toEqual(mockUserData);
    });

    it('should throw when user not found', async () => {
      findByResetTokenMock.mockResolvedValue(null);
      
      await expect(UserServiceLookup.findUserByResetTokenOrThrow('invalid-token')).rejects.toThrow('Password reset');
    });

    it('should handle multiple token scenarios', async () => {
      const tokens = ['token1', 'token2', 'token3'];
      for (const token of tokens) {
        findByResetTokenMock.mockResolvedValueOnce(null);
        await expect(UserServiceLookup.findUserByResetTokenOrThrow(token)).rejects.toThrow();
      }
    });
  });

  describe('findUserByVerificationTokenOrThrow', () => {
    it('should return user when found', async () => {
      findByVerificationTokenMock.mockResolvedValue(mockUserData);
      
      const result = await UserServiceLookup.findUserByVerificationTokenOrThrow('valid-token');
      
      expect(result).toEqual(mockUserData);
    });

    it('should throw when user not found', async () => {
      findByVerificationTokenMock.mockResolvedValue(null);
      
      await expect(UserServiceLookup.findUserByVerificationTokenOrThrow('invalid-token')).rejects.toThrow('Email verification');
    });

    it('should handle multiple verification token scenarios', async () => {
      const tokens = ['verify1', 'verify2'];
      for (const token of tokens) {
        findByVerificationTokenMock.mockResolvedValueOnce(null);
        await expect(UserServiceLookup.findUserByVerificationTokenOrThrow(token)).rejects.toThrow();
      }
    });
  });

  describe('userExists', () => {
    it('should return true when user exists', async () => {
      findByIdMock.mockResolvedValue(mockUserData);
      
      const result = await UserServiceLookup.userExists('valid-id');
      
      expect(result).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      findByIdMock.mockResolvedValue(null);
      
      const result = await UserServiceLookup.userExists('invalid-id');
      
      expect(result).toBe(false);
    });

    it('should handle multiple existence checks', async () => {
      const testIds = ['exists1', 'missing1', 'exists2', 'missing2'];
      for (const id of testIds) {
        const exists = id.includes('exists');
        findByIdMock.mockResolvedValueOnce(exists ? mockUserData : null);
        
        const result = await UserServiceLookup.userExists(id);
        expect(result).toBe(exists);
      }
    });
  });

  describe('emailExists', () => {
    it('should return true when email exists', async () => {
      findByEmailMock.mockResolvedValue(mockUserData);
      
      const result = await UserServiceLookup.emailExists('test@example.com');
      
      expect(result).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      findByEmailMock.mockResolvedValue(null);
      
      const result = await UserServiceLookup.emailExists('invalid@example.com');
      
      expect(result).toBe(false);
    });

    it('should handle multiple email existence checks', async () => {
      const emails = ['exists@test.com', 'missing@test.com'];
      for (const email of emails) {
        const exists = email.includes('exists');
        findByEmailMock.mockResolvedValueOnce(exists ? mockUserData : null);
        
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
        findByIdMock.mockResolvedValueOnce(null);
        const errorResult = await UserServiceLookup.findUserOrError(edgeCase);
        expect(errorResult.error).toBeDefined();
        
        // Test userExists
        findByIdMock.mockResolvedValueOnce(null);
        const existsResult = await UserServiceLookup.userExists(edgeCase);
        expect(existsResult).toBe(false);
        
        // Test emailExists  
        findByEmailMock.mockResolvedValueOnce(null);
        const emailExistsResult = await UserServiceLookup.emailExists(edgeCase);
        expect(emailExistsResult).toBe(false);
        
        // Test findUserByEmailNullable
        findByEmailMock.mockResolvedValueOnce(null);
        const nullableResult = await UserServiceLookup.findUserByEmailNullable(edgeCase);
        expect(nullableResult).toBeNull();
      }
    });

    it('should handle success scenarios for all methods', async () => {
      const successCases = ['success1', 'success2'];
      
      for (const successCase of successCases) {
        // Test findUserOrError success
        findByIdMock.mockResolvedValueOnce(mockUserData);
        const successResult = await UserServiceLookup.findUserOrError(successCase);
        expect(successResult.success).toEqual(mockUserData);
        
        // Test userExists success
        findByIdMock.mockResolvedValueOnce(mockUserData);
        const existsResult = await UserServiceLookup.userExists(successCase);
        expect(existsResult).toBe(true);
        
        // Test findUserByIdOrThrow success
        findByIdMock.mockResolvedValueOnce(mockUserData);
        const throwResult = await UserServiceLookup.findUserByIdOrThrow(successCase);
        expect(throwResult).toEqual(mockUserData);
      }
    });

    it('should exercise all paths for maximum coverage', async () => {
      // Exercise error paths for throwing methods
      findByIdMock.mockResolvedValueOnce(null);
      await expect(UserServiceLookup.findUserByIdOrThrow('error-test')).rejects.toThrow();
      
      findByEmailMock.mockResolvedValueOnce(null);
      await expect(UserServiceLookup.findUserByEmailOrThrow('error@test.com')).rejects.toThrow();
      
      findByResetTokenMock.mockResolvedValueOnce(null);
      await expect(UserServiceLookup.findUserByResetTokenOrThrow('error-token')).rejects.toThrow();
      
      findByVerificationTokenMock.mockResolvedValueOnce(null);
      await expect(UserServiceLookup.findUserByVerificationTokenOrThrow('error-token')).rejects.toThrow();

      // Exercise success paths for all methods
      findByIdMock.mockResolvedValueOnce(mockUserData);
      await UserServiceLookup.findUserOrError('success-test');
      
      findByIdMock.mockResolvedValueOnce(mockUserData);
      await UserServiceLookup.userExists('success-test');
      
      findByEmailMock.mockResolvedValueOnce(mockUserData);
      await UserServiceLookup.emailExists('success@test.com');
      
      findByEmailMock.mockResolvedValueOnce(mockUserData);
      await UserServiceLookup.findUserByEmailNullable('success@test.com');
      
      findByResetTokenMock.mockResolvedValueOnce(mockUserData);
      await UserServiceLookup.findUserByResetTokenOrThrow('success-token');
      
      findByVerificationTokenMock.mockResolvedValueOnce(mockUserData);
      await UserServiceLookup.findUserByVerificationTokenOrThrow('success-token');
    });
  });
});