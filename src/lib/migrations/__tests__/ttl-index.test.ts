/**
 * Test cases for TTL Index Creation in MigrationRunner
 * Following TDD principles - all tests should fail initially until implementation is created
 */

import { Db, MongoClient } from 'mongodb';
import { MigrationRunner } from '../runner';
import {
  MigrationConfig,
} from '../types';
import {
  createFactory,
  testUtils,
} from '../../services/__tests__/shared/test-factory-utils';

// Mock MongoDB
jest.mock('mongodb');

// Mock file system operations
jest.mock('fs/promises', () => ({
  readdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  access: jest.fn(),
  mkdir: jest.fn(),
}));

// Mock path operations
jest.mock('path', () => ({
  join: jest.fn(),
  extname: jest.fn(),
  basename: jest.fn(),
}));

import * as fs from 'fs/promises';
import * as path from 'path';

const mockFs = jest.mocked(fs);
const mockPath = jest.mocked(path);

describe('MigrationRunner TTL Index Creation', () => {
  let mockDb: jest.Mocked<Db>;
  let mockClient: jest.Mocked<MongoClient>;
  let mockCollection: any;
  let runner: MigrationRunner;
  let config: MigrationConfig;

  // Test data factories
  const createMigrationConfig = createFactory<MigrationConfig>({
    migrationsPath: '/test/migrations',
    collectionName: 'migrations',
    timeout: 30000,
    backupEnabled: true,
    dryRun: false,
    validateOnly: false,
  });

  // Consolidated test setup helpers
  const setupStandardMigrationTest = (mockBehavior: any = {}) => {
    const migration = createBaseTTLMigration();
    setupMockFileSystem();
    const mockVerificationTokensCollection = setupMockVerificationTokensCollection(mockBehavior);
    jest.spyOn(runner as any, 'loadMigration').mockResolvedValue(migration);
    return { migration, mockVerificationTokensCollection };
  };

  const createBaseTTLMigration = (upImpl?: (_db: any) => Promise<void>, downImpl?: (_db: any) => Promise<void>) => ({
    version: '001',
    description: 'Create initial user collection indexes',
    up: jest.fn().mockImplementation(upImpl || (async (db) => {
      const verificationTokensCollection = db.collection('verificationtokens');
      await verificationTokensCollection.createIndex({ expires: 1 }, { expireAfterSeconds: 0 });
    })),
    down: jest.fn().mockImplementation(downImpl || (async () => {})),
  });

  const setupMockFileSystem = () => {
    (mockFs.readdir as jest.Mock).mockResolvedValue(['001_initial_user_collections.js']);
    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
      sort: jest.fn().mockReturnThis(),
    });
  };

  const setupMockVerificationTokensCollection = (mockBehavior: any = {}) => {
    const defaultBehavior = {
      createIndex: jest.fn().mockResolvedValue(undefined),
      dropIndex: jest.fn().mockResolvedValue(undefined),
    };
    const mockVerificationTokensCollection = { ...defaultBehavior, ...mockBehavior };
    mockDb.collection.mockImplementation((name) => name === 'verificationtokens' ? mockVerificationTokensCollection : mockCollection);
    return mockVerificationTokensCollection;
  };

  testUtils.setupMockClearance();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    // Setup MongoDB mocks
    mockCollection = {
      findOne: jest.fn(),
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
        sort: jest.fn().mockReturnThis(),
      }),
      insertOne: jest.fn(),
      deleteOne: jest.fn(),
      createIndex: jest.fn(),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
      createCollection: jest.fn(),
      listCollections: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      }),
    } as any;

    mockClient = {
      db: jest.fn().mockReturnValue(mockDb),
      close: jest.fn(),
    } as any;

    config = createMigrationConfig();
    runner = new MigrationRunner(mockClient, config);

    // Setup file system mocks with proper typing
    (mockFs.readdir as jest.Mock).mockResolvedValue([]);
    (mockFs.readFile as jest.Mock).mockResolvedValue('');
    (mockFs.writeFile as jest.Mock).mockResolvedValue(undefined);
    (mockFs.access as jest.Mock).mockResolvedValue(undefined);
    (mockFs.mkdir as jest.Mock).mockResolvedValue(undefined);

    // Setup path mocks with proper typing
    (mockPath.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    (mockPath.extname as jest.Mock).mockImplementation((file) => {
      const parts = file.split('.');
      return parts.length > 1 ? '.' + parts.pop() : '';
    });
    (mockPath.basename as jest.Mock).mockImplementation((file) => file.split('/').pop() || '');
  });

  describe('TTL Index Creation', () => {
    it('should create TTL index for verification tokens with expireAfterSeconds option', async () => {
      const { mockVerificationTokensCollection } = setupStandardMigrationTest();
      const results = await runner.migrate();

      expect(results[0].success).toBe(true);
      expect(mockVerificationTokensCollection.createIndex).toHaveBeenCalledWith(
        { expires: 1 }, { expireAfterSeconds: 0 }
      );
    });

    it('should verify TTL index is created with correct parameters', async () => {
      const { mockVerificationTokensCollection } = setupStandardMigrationTest();
      await runner.migrate();

      expect(mockVerificationTokensCollection.createIndex).toHaveBeenCalledWith(
        { expires: 1 }, { expireAfterSeconds: 0 }
      );
      expect(mockVerificationTokensCollection.createIndex).toHaveBeenCalledTimes(1);
    });

    it('should handle TTL index creation failure gracefully', async () => {
      setupStandardMigrationTest({ createIndex: jest.fn().mockRejectedValue(new Error('Index creation failed')) });
      const results = await runner.migrate();

      expect(results[0].success).toBe(false);
      expect(results[0].error?.message).toContain('Index creation failed');
    });

    it('should rollback TTL index during migration rollback', async () => {
      const rollbackImpl = async (db: any) => {
        await db.collection('verificationtokens').dropIndex({ expires: 1 });
      };
      const migration = createBaseTTLMigration(undefined, rollbackImpl);
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([{ version: '001', filename: '001_initial_user_collections.js', executedAt: new Date() }]),
        sort: jest.fn().mockReturnThis(),
      });
      const mockVerificationTokensCollection = setupMockVerificationTokensCollection();
      jest.spyOn(runner as any, 'loadMigration').mockResolvedValue(migration);

      const results = await runner.rollback();

      expect(results[0].success).toBe(true);
      expect(mockVerificationTokensCollection.dropIndex).toHaveBeenCalledWith({ expires: 1 });
    });
  });
});