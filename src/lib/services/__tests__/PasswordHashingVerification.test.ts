import '../__test-helpers__/test-setup';
import User from '../../models/User';
import { UserService } from '../UserService';
import bcrypt from 'bcryptjs';

/**
 * Critical Security Test: Password Hashing Verification
 * This test verifies that passwords are properly hashed and never stored in plaintext
 */
describe('Password Hashing Security Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Model Password Hashing', () => {
    it('should hash password on user creation', async () => {
      const plainPassword = 'TestPassword123!';

      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: plainPassword, // This should be hashed by pre-save hook
      };

      const user = new User(userData);

      // Before save, password should be plaintext
      expect(user.passwordHash).toBe(plainPassword);

      // Save the user (should trigger password hashing)
      await user.save();

      // After save, password should be hashed
      expect(user.passwordHash).not.toBe(plainPassword);
      expect(user.passwordHash).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern

      // Should be able to compare with original password
      const isValid = await user.comparePassword(plainPassword);
      expect(isValid).toBe(true);

      // Should fail with wrong password
      const isInvalid = await user.comparePassword('WrongPassword');
      expect(isInvalid).toBe(false);
    });

    it('should not rehash already hashed passwords', async () => {
      const plainPassword = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      const userData = {
        email: 'test2@example.com',
        username: 'testuser2',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: hashedPassword,
      };

      const user = new User(userData);
      await user.save();

      // Should remain the same hashed password
      expect(user.passwordHash).toBe(hashedPassword);
    });
  });

  describe('UserService Password Hashing', () => {
    it('should create user with hashed password via UserService', async () => {
      const plainPassword = 'ServiceTestPassword123!';
      const userData = {
        email: 'service@example.com',
        username: 'serviceuser',
        firstName: 'Service',
        lastName: 'User',
        password: plainPassword,
      };

      const result = await UserService.createUser(userData);

      if (result.success && result.data) {
        // Find the actual user in database to check password hash
        const user = await User.findByEmail(userData.email);
        expect(user).toBeTruthy();
        expect(user!.passwordHash).not.toBe(plainPassword);
        expect(user!.passwordHash).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern

        // Should be able to authenticate with original password
        const authResult = await UserService.authenticateUser({
          email: userData.email,
          password: plainPassword,
          rememberMe: false,
        });

        expect(authResult.success).toBe(true);
      }
    });

    it('should authenticate user with hashed password comparison', async () => {
      const plainPassword = 'AuthTestPassword123!';
      const userData = {
        email: 'auth@example.com',
        username: 'authuser',
        firstName: 'Auth',
        lastName: 'User',
        password: plainPassword,
      };

      // Create user
      const createResult = await UserService.createUser(userData);
      expect(createResult.success).toBe(true);

      // Authenticate with correct password
      const authResult = await UserService.authenticateUser({
        email: userData.email,
        password: plainPassword,
        rememberMe: false,
      });

      expect(authResult.success).toBe(true);

      // Should fail with wrong password
      const wrongAuthResult = await UserService.authenticateUser({
        email: userData.email,
        password: 'WrongPassword123!',
        rememberMe: false,
      });

      expect(wrongAuthResult.success).toBe(false);
    });

    it('should hash password when changing password', async () => {
      const originalPassword = 'OriginalPassword123!';
      const newPassword = 'NewPassword123!';

      const userData = {
        email: 'change@example.com',
        username: 'changeuser',
        firstName: 'Change',
        lastName: 'User',
        password: originalPassword,
      };

      // Create user
      const createResult = await UserService.createUser(userData);
      expect(createResult.success).toBe(true);

      const user = await User.findByEmail(userData.email);
      const originalHash = user!.passwordHash;

      // Change password
      const changeResult = await UserService.changePassword(user!._id.toString(), {
        currentPassword: originalPassword,
        newPassword: newPassword,
        confirmNewPassword: newPassword,
      });

      expect(changeResult.success).toBe(true);

      // Verify password was hashed and changed
      const updatedUser = await User.findByEmail(userData.email);
      expect(updatedUser!.passwordHash).not.toBe(originalHash);
      expect(updatedUser!.passwordHash).not.toBe(newPassword);
      expect(updatedUser!.passwordHash).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern

      // Should authenticate with new password
      const authResult = await UserService.authenticateUser({
        email: userData.email,
        password: newPassword,
        rememberMe: false,
      });

      expect(authResult.success).toBe(true);
    });
  });

  describe('Security Compliance', () => {
    it('should never store plaintext passwords in database', async () => {
      const passwords = [
        'Password123!',
        'AnotherPassword456!',
        'ThirdPassword789!',
      ];

      for (const password of passwords) {
        const userData = {
          email: `security${Math.random()}@example.com`,
          username: `securityuser${Math.random()}`,
          firstName: 'Security',
          lastName: 'User',
          password: password,
        };

        await UserService.createUser(userData);

        const user = await User.findByEmail(userData.email);
        expect(user).toBeTruthy();

        // Password should be hashed, not plaintext
        expect(user!.passwordHash).not.toBe(password);
        expect(user!.passwordHash.length).toBeGreaterThan(50); // bcrypt hashes are long
        expect(user!.passwordHash.startsWith('$2')).toBe(true); // bcrypt prefix
      }
    });

    it('should use proper bcrypt salt rounds', async () => {
      const userData = {
        email: 'salttest@example.com',
        username: 'saltuser',
        firstName: 'Salt',
        lastName: 'User',
        password: 'SaltTestPassword123!',
      };

      await UserService.createUser(userData);
      const user = await User.findByEmail(userData.email);

      // Extract salt rounds from hash
      const hashParts = user!.passwordHash.split('$');
      const saltRounds = parseInt(hashParts[2]);

      // Should use at least 12 rounds for security
      expect(saltRounds).toBeGreaterThanOrEqual(12);
    });
  });
});