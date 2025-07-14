/**
 * Test cases for TTL Index Creation in MigrationRunner
 * Following TDD principles - all tests should fail initially until implementation is created
 */

import { createMigrationTestSetup } from './migration-test-helpers';

const {
  TestConstants,
  MockHelpers,
  TestSetup,
  AssertionHelpers,
  mockDb,
  mockClient,
  mockCollection,
  runner,
  config,
} = createMigrationTestSetup();

describe('MigrationRunner TTL Index Creation', () => {
  beforeEach(() => {
    TestSetup.initializeMocks();
  });

  describe('TTL Index Creation', () => {
    it('should create TTL index for verification tokens with expireAfterSeconds option', async () => {
      const { mockTokensCollection } = MockHelpers.setupTestEnvironment();
      const results = await runner().migrate();

      expect(results[0].success).toBe(true);
      AssertionHelpers.expectTTLIndexCall(mockTokensCollection);
    });

    it('should verify TTL index is created with correct parameters', async () => {
      const { mockTokensCollection } = MockHelpers.setupTestEnvironment();
      await runner().migrate();
      AssertionHelpers.expectTTLIndexCall(mockTokensCollection);
    });

    it('should handle TTL index creation failure gracefully', async () => {
      MockHelpers.setupTestEnvironment({ createIndex: jest.fn().mockRejectedValue(new Error('Index creation failed')) });
      const results = await runner().migrate();

      expect(results[0].success).toBe(false);
      expect(results[0].error?.message).toContain('Index creation failed');
    });

    it('should rollback TTL index during migration rollback', async () => {
      const { mockTokensCollection } = MockHelpers.setupTestEnvironment();
      const rollbackMigration = MockHelpers.createMigrationBase(undefined, async (db) => {
        await db.collection('verificationtokens').dropIndex(TestConstants.TTL_INDEX_PARAMS);
      });

      mockCollection().find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([{ ...TestConstants.MIGRATION_METADATA, filename: '001_initial_user_collections.js', executedAt: new Date() }]),
        sort: jest.fn().mockReturnThis(),
      });
      jest.spyOn(runner() as any, 'loadMigration').mockResolvedValue(rollbackMigration);

      const results = await runner().rollback();

      expect(results[0].success).toBe(true);
      expect(mockTokensCollection.dropIndex).toHaveBeenCalledWith(TestConstants.TTL_INDEX_PARAMS);
    });
  });
});