/**
 * Real Password Hashing Test - NO MOCKS
 * This test uses the actual User model and bcrypt to verify password hashing
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Import the REAL user model (not mocked)
import User from '../../models/User';
import bcrypt from 'bcryptjs';

describe('Real Password Hashing Security Test', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Connect to in-memory database
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    // Clean up
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database between tests
    await User.deleteMany({});
  });

  describe('User Model Password Hashing', () => {
    it('should automatically hash passwords on save', async () => {
      const plainPassword = 'TestPassword123!';

      // Create user with plain password
      const user = new User({
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: plainPassword,
      });

      // Before save, check if password is plain text
      console.log('Before save - passwordHash:', user.passwordHash);

      // Save the user
      await user.save();

      // After save, password should be hashed
      console.log('After save - passwordHash:', user.passwordHash);
      console.log('Password length:', user.passwordHash.length);
      console.log('Is bcrypt hash?', user.passwordHash.startsWith('$2'));

      // Check if password was actually hashed
      expect(user.passwordHash).not.toBe(plainPassword);
      expect(user.passwordHash).toMatch(/^\$2[aby]\$\d+\$/);
      expect(user.passwordHash.length).toBeGreaterThan(50);

      // Verify comparePassword works
      const isValid = await user.comparePassword(plainPassword);
      expect(isValid).toBe(true);

      const isInvalid = await user.comparePassword('WrongPassword');
      expect(isInvalid).toBe(false);
    });

    it('should handle direct bcrypt operations', async () => {
      const plainPassword = 'DirectBcryptTest123!';

      // Test direct bcrypt hashing
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);

      console.log('Direct bcrypt hash:', hashedPassword);

      expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/);
      expect(hashedPassword).not.toBe(plainPassword);

      // Test comparison
      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should detect if passwords are stored as plaintext', async () => {
      const testPasswords = [
        'Password123!',
        'AnotherPassword456!',
        'SimplePassword',
      ];

      for (const password of testPasswords) {
        const user = new User({
          email: `test-${Date.now()}-${Math.random()}@example.com`,
          username: `user-${Date.now()}-${Math.random()}`,
          firstName: 'Test',
          lastName: 'User',
          passwordHash: password,
        });

        await user.save();

        console.log(`Password: "${password}" -> Hash: "${user.passwordHash}"`);

        // CRITICAL SECURITY CHECK: Password should NEVER be stored as plaintext
        expect(user.passwordHash).not.toBe(password);

        // Check if it looks like a bcrypt hash
        if (user.passwordHash === password) {
          console.error('🚨 SECURITY VULNERABILITY: Password stored as plaintext!');
          throw new Error('SECURITY VULNERABILITY: Password stored as plaintext');
        }
      }
    });
  });

  describe('Check Current Implementation Status', () => {
    it('should report the current password hashing behavior', async () => {
      const plainPassword = 'ReportTest123!';

      const user = new User({
        email: 'report@example.com',
        username: 'reportuser',
        firstName: 'Report',
        lastName: 'User',
        passwordHash: plainPassword,
      });

      console.log('=== PASSWORD HASHING ANALYSIS ===');
      console.log('Original password:', plainPassword);
      console.log('Before save:', user.passwordHash);
      console.log('Password equals original?', user.passwordHash === plainPassword);

      await user.save();

      console.log('After save:', user.passwordHash);
      console.log('Password equals original after save?', user.passwordHash === plainPassword);
      console.log('Looks like bcrypt hash?', user.passwordHash.startsWith('$2'));
      console.log('Hash length:', user.passwordHash.length);
      console.log('=== END ANALYSIS ===');

      // Test authentication
      try {
        const isValid = await user.comparePassword(plainPassword);
        console.log('comparePassword result:', isValid);
      } catch (error) {
        console.log('comparePassword error:', error);
      }
    });
  });
});