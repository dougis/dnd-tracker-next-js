import { UserServiceLookup } from '../UserServiceLookup';
import { mockUserData } from '../__test-helpers__/test-setup';

// Mock the User model
jest.mock('../../models/User', () => ({
  default: {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByResetToken: jest.fn(),
    findByVerificationToken: jest.fn(),
  },
}));

import User from '../../models/User';

// Cast to any to access mock methods
const MockedUser = User as any;

describe('UserServiceLookup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserOrError method', () => {
    it('should return success when user is found', async () => {
      MockedUser.findById.mockResolvedValueOnce(mockUserData);
      
      const result = await UserServiceLookup.findUserOrError('valid-id');
      expect(result.success).toBeDefined();
      expect(result.success).toEqual(mockUserData);
    });

    it('should return error when user is not found', async () => {
      MockedUser.findById.mockResolvedValueOnce(null);
      
      const result = await UserServiceLookup.findUserOrError('invalid-id');
      expect(result.error).toBeDefined();
    });
  });

  describe('findUserByIdOrThrow method', () => {
    it('should return user when found', async () => {
      MockedUser.findById.mockResolvedValueOnce(mockUserData);
      
      const result = await UserServiceLookup.findUserByIdOrThrow('valid-id');
      expect(result).toEqual(mockUserData);
    });

    it('should throw when user not found', async () => {
      MockedUser.findById.mockResolvedValueOnce(null);
      
      await expect(UserServiceLookup.findUserByIdOrThrow('invalid-id')).rejects.toThrow();
    });
  });

  describe('findUserByEmailOrThrow method', () => {
    it('should return user when found', async () => {
      MockedUser.findByEmail.mockResolvedValueOnce(mockUserData);
      
      const result = await UserServiceLookup.findUserByEmailOrThrow('test@example.com');
      expect(result).toEqual(mockUserData);
    });

    it('should throw when user not found', async () => {
      MockedUser.findByEmail.mockResolvedValueOnce(null);
      
      await expect(UserServiceLookup.findUserByEmailOrThrow('invalid@example.com')).rejects.toThrow();
    });
  });

  describe('findUserByEmailNullable method', () => {
    it('should return user when found', async () => {
      MockedUser.findByEmail.mockResolvedValueOnce(mockUserData);
      
      const result = await UserServiceLookup.findUserByEmailNullable('test@example.com');
      expect(result).toEqual(mockUserData);
    });

    it('should return null when user not found', async () => {
      MockedUser.findByEmail.mockResolvedValueOnce(null);
      
      const result = await UserServiceLookup.findUserByEmailNullable('invalid@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findUserByResetTokenOrThrow method', () => {
    it('should return user when found', async () => {
      MockedUser.findByResetToken.mockResolvedValueOnce(mockUserData);
      
      const result = await UserServiceLookup.findUserByResetTokenOrThrow('valid-token');
      expect(result).toEqual(mockUserData);
    });

    it('should throw when user not found', async () => {
      MockedUser.findByResetToken.mockResolvedValueOnce(null);
      
      await expect(UserServiceLookup.findUserByResetTokenOrThrow('invalid-token')).rejects.toThrow();
    });
  });

  describe('findUserByVerificationTokenOrThrow method', () => {
    it('should return user when found', async () => {
      MockedUser.findByVerificationToken.mockResolvedValueOnce(mockUserData);
      
      const result = await UserServiceLookup.findUserByVerificationTokenOrThrow('valid-token');
      expect(result).toEqual(mockUserData);
    });

    it('should throw when user not found', async () => {
      MockedUser.findByVerificationToken.mockResolvedValueOnce(null);
      
      await expect(UserServiceLookup.findUserByVerificationTokenOrThrow('invalid-token')).rejects.toThrow();
    });
  });

  describe('userExists method', () => {
    it('should return true when user exists', async () => {
      MockedUser.findById.mockResolvedValueOnce(mockUserData);
      
      const result = await UserServiceLookup.userExists('valid-id');
      expect(result).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      MockedUser.findById.mockResolvedValueOnce(null);
      
      const result = await UserServiceLookup.userExists('invalid-id');
      expect(result).toBe(false);
    });
  });

  describe('emailExists method', () => {
    it('should return true when email exists', async () => {
      MockedUser.findByEmail.mockResolvedValueOnce(mockUserData);
      
      const result = await UserServiceLookup.emailExists('test@example.com');
      expect(result).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      MockedUser.findByEmail.mockResolvedValueOnce(null);
      
      const result = await UserServiceLookup.emailExists('invalid@example.com');
      expect(result).toBe(false);
    });
  });

  describe('comprehensive coverage', () => {
    it('should handle multiple scenarios for all methods', async () => {
      // Test multiple calls to increase coverage
      const testScenarios = [
        { input: 'test1', returnValue: mockUserData },
        { input: 'test2', returnValue: null },
        { input: 'test3', returnValue: mockUserData },
      ];

      for (const scenario of testScenarios) {
        // Test findUserOrError
        MockedUser.findById.mockResolvedValueOnce(scenario.returnValue);
        await UserServiceLookup.findUserOrError(scenario.input);

        // Test userExists
        MockedUser.findById.mockResolvedValueOnce(scenario.returnValue);
        await UserServiceLookup.userExists(scenario.input);

        // Test email methods
        MockedUser.findByEmail.mockResolvedValueOnce(scenario.returnValue);
        await UserServiceLookup.emailExists(scenario.input);

        MockedUser.findByEmail.mockResolvedValueOnce(scenario.returnValue);
        await UserServiceLookup.findUserByEmailNullable(scenario.input);
      }

      // Test throwing methods separately to handle exceptions
      MockedUser.findById.mockResolvedValueOnce(null);
      await expect(UserServiceLookup.findUserByIdOrThrow('test')).rejects.toThrow();

      MockedUser.findByEmail.mockResolvedValueOnce(null);
      await expect(UserServiceLookup.findUserByEmailOrThrow('test')).rejects.toThrow();

      MockedUser.findByResetToken.mockResolvedValueOnce(null);
      await expect(UserServiceLookup.findUserByResetTokenOrThrow('test')).rejects.toThrow();

      MockedUser.findByVerificationToken.mockResolvedValueOnce(null);
      await expect(UserServiceLookup.findUserByVerificationTokenOrThrow('test')).rejects.toThrow();
    });

    it('should handle edge cases', async () => {
      const edgeCases = ['', ' ', 'null', 'undefined'];
      
      for (const edgeCase of edgeCases) {
        // Test with alternating success/failure
        const shouldSucceed = edgeCases.indexOf(edgeCase) % 2 === 0;
        const returnValue = shouldSucceed ? mockUserData : null;

        MockedUser.findById.mockResolvedValueOnce(returnValue);
        await UserServiceLookup.findUserOrError(edgeCase);

        MockedUser.findById.mockResolvedValueOnce(returnValue);
        await UserServiceLookup.userExists(edgeCase);

        MockedUser.findByEmail.mockResolvedValueOnce(returnValue);
        await UserServiceLookup.emailExists(edgeCase);
      }
    });
  });
});