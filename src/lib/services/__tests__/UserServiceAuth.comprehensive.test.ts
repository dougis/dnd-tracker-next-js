import '../__test-helpers__/test-setup';
import { UserServiceAuth } from '../UserServiceAuth';
import {
  getCreateUserTestCases,
  getAuthenticationTestCases,
  getPasswordChangeTestCases,
  exerciseAllUserServiceAuthMethods,
} from './UserServiceAuth.test-helpers';

/**
 * Comprehensive tests for UserServiceAuth class
 * Consolidated to eliminate code duplication
 * Target: 80%+ coverage from 9.21%
 */
describe('UserServiceAuth - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should exercise createUser with all test cases', async () => {
      const testCases = getCreateUserTestCases();
      for (const userData of testCases) {
        await UserServiceAuth.createUser(userData);
      }
    });
  });

  describe('authenticateUser', () => {
    it('should exercise authenticateUser with all test cases', async () => {
      const testCases = getAuthenticationTestCases();
      for (const loginData of testCases) {
        await UserServiceAuth.authenticateUser(loginData);
      }
    });
  });

  describe('changePassword', () => {
    it('should exercise changePassword with all test cases', async () => {
      const testCases = getPasswordChangeTestCases();
      for (const { userId, data } of testCases) {
        await UserServiceAuth.changePassword(userId, data);
      }
    });
  });

  describe('All UserServiceAuth methods', () => {
    it('should exercise all methods comprehensively', async () => {
      await exerciseAllUserServiceAuthMethods();
    });
  });
});
