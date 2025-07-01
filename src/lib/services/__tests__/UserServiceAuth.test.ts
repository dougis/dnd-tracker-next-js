import '../__test-helpers__/test-setup';
import { UserService } from '../UserService';
import {
  createValidUserData,
  createValidLoginData,
  createInvalidUserData
} from './UserServiceAuth.test-helpers';

/**
 * Basic UserService Authentication Tests
 * Simplified to eliminate code duplication
 */
describe('UserService Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should exercise createUser with various data', async () => {
      const testCases = [
        createValidUserData(),
        createValidUserData({ email: 'different@test.com', username: 'different' }),
        createInvalidUserData(),
      ];

      for (const userData of testCases) {
        await UserService.createUser(userData);
      }
    });
  });

  describe('authenticateUser', () => {
    it('should exercise authenticateUser with various credentials', async () => {
      const testCases = [
        createValidLoginData(),
        createValidLoginData({ email: 'different@test.com' }),
        createValidLoginData({ password: 'WrongPassword!' }),
      ];

      for (const loginData of testCases) {
        await UserService.authenticateUser(loginData);
      }
    });
  });
});
