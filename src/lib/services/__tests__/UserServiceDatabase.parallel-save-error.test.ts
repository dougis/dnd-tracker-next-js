/**
 * Test for ParallelSaveError bug fix in UserServiceDatabase.generateAndSaveEmailToken
 * This test demonstrates the bug where the method attempts to save twice,
 * causing a ParallelSaveError in actual MongoDB operations.
 */

import { UserServiceDatabase } from '../UserServiceDatabase';

describe('UserServiceDatabase - ParallelSaveError Fix', () => {
  let mockUser: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock user that simulates the real behavior
    mockUser = {
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      emailVerificationToken: undefined,

      // Mock generateEmailVerificationToken to simulate the real User model behavior
      // This method saves the document internally (as per User.ts:400)
      generateEmailVerificationToken: jest.fn().mockImplementation(async function() {
        this.emailVerificationToken = 'generated-token';
        // This simulates the internal save() call that happens in the real implementation
        await this.save();
        return 'generated-token';
      }),

      // Mock save method to detect parallel save attempts
      save: jest.fn().mockImplementation(async function() {
        // Simulate the ParallelSaveError that occurs when save() is called
        // multiple times on the same document
        if (this._saving) {
          throw new Error("Can't save() the same doc multiple times in parallel");
        }
        this._saving = true;

        // Simulate async save operation
        await new Promise(resolve => setTimeout(resolve, 1));

        this._saving = false;
        return this;
      }),
    };
  });

  describe('generateAndSaveEmailToken - Fixed Implementation', () => {
    it('should not attempt double save after fix', async () => {
      // This test verifies the fix works - no ParallelSaveError should occur
      // The method should call generateEmailVerificationToken() which handles saving internally

      // This should not throw an error after the fix
      await expect(
        UserServiceDatabase.generateAndSaveEmailToken(mockUser)
      ).resolves.not.toThrow();

      // Verify that generateEmailVerificationToken was called
      expect(mockUser.generateEmailVerificationToken).toHaveBeenCalledTimes(1);

      // Verify that save was only called once (from generateEmailVerificationToken)
      expect(mockUser.save).toHaveBeenCalledTimes(1);

      // Verify the token was set
      expect(mockUser.emailVerificationToken).toBe('generated-token');
    });
  });

  describe('generateAndSaveEmailToken - Call Flow Verification', () => {
    it('should only call save once through generateEmailVerificationToken', async () => {
      // This test verifies the exact call flow after the fix
      // The method should only call save() once through generateEmailVerificationToken

      // Create a mock that tracks save calls more precisely
      const saveCalls: string[] = [];
      mockUser.save = jest.fn().mockImplementation(async function() {
        saveCalls.push('save-called');
        return this;
      });

      mockUser.generateEmailVerificationToken = jest.fn().mockImplementation(async function() {
        this.emailVerificationToken = 'generated-token';
        saveCalls.push('generateEmailVerificationToken-save');
        await this.save();
        return 'generated-token';
      });

      // This should work without throwing an error after the fix
      await UserServiceDatabase.generateAndSaveEmailToken(mockUser);

      // After the fix, we should only have save calls from generateEmailVerificationToken
      expect(saveCalls).toEqual(['generateEmailVerificationToken-save', 'save-called']);

      // Verify token was generated
      expect(mockUser.generateEmailVerificationToken).toHaveBeenCalledTimes(1);
      expect(mockUser.emailVerificationToken).toBe('generated-token');
    });
  });
});