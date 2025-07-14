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

  // Consolidated test utilities
  const TTL_INDEX_PARAMS = { expires: 1 };
  const TTL_INDEX_OPTIONS = { expireAfterSeconds: 0 };
  const MIGRATION_METADATA = { version: '001', description: 'Create initial user collection indexes' };

  const createMigrationBase = (upImpl?: any, downImpl?: any) => ({
    ...MIGRATION_METADATA,
    up: jest.fn().mockImplementation(upImpl || (async (db) => {
      await db.collection('verificationtokens').createIndex(TTL_INDEX_PARAMS, TTL_INDEX_OPTIONS);
    })),
    down: jest.fn().mockImplementation(downImpl || (async () => {})),
  });

  const setupTestEnvironment = (collectionBehavior: any = {}) => {
    const defaultBehavior = { createIndex: jest.fn().mockResolvedValue(undefined), dropIndex: jest.fn().mockResolvedValue(undefined) };
    const mockTokensCollection = { ...defaultBehavior, ...collectionBehavior };

    (mockFs.readdir as jest.Mock).mockResolvedValue(['001_initial_user_collections.js']);
    mockCollection.find.mockReturnValue({ toArray: jest.fn().mockResolvedValue([]), sort: jest.fn().mockReturnThis() });
    mockDb.collection.mockImplementation((name) => name === 'verificationtokens' ? mockTokensCollection : mockCollection);

    const migration = createMigrationBase();
    jest.spyOn(runner as any, 'loadMigration').mockResolvedValue(migration);
    return { migration, mockTokensCollection };
  };

  const expectTTLIndexCall = (mockCollection: any, timesCalled = 1) => {
    expect(mockCollection.createIndex).toHaveBeenCalledWith(TTL_INDEX_PARAMS, TTL_INDEX_OPTIONS);
    expect(mockCollection.createIndex).toHaveBeenCalledTimes(timesCalled);
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
      const { mockTokensCollection } = setupTestEnvironment();
      const results = await runner.migrate();

      expect(results[0].success).toBe(true);
      expectTTLIndexCall(mockTokensCollection);
    });

    it('should verify TTL index is created with correct parameters', async () => {
      const { mockTokensCollection } = setupTestEnvironment();
      await runner.migrate();
      expectTTLIndexCall(mockTokensCollection);
    });

    it('should handle TTL index creation failure gracefully', async () => {
      setupTestEnvironment({ createIndex: jest.fn().mockRejectedValue(new Error('Index creation failed')) });
      const results = await runner.migrate();

      expect(results[0].success).toBe(false);
      expect(results[0].error?.message).toContain('Index creation failed');
    });

    it('should rollback TTL index during migration rollback', async () => {
      const { mockTokensCollection } = setupTestEnvironment();
      const rollbackMigration = createMigrationBase(undefined, async (db) => {
        await db.collection('verificationtokens').dropIndex(TTL_INDEX_PARAMS);
      });

      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([{ ...MIGRATION_METADATA, filename: '001_initial_user_collections.js', executedAt: new Date() }]),
        sort: jest.fn().mockReturnThis(),
      });
      jest.spyOn(runner as any, 'loadMigration').mockResolvedValue(rollbackMigration);

      const results = await runner.rollback();

      expect(results[0].success).toBe(true);
      expect(mockTokensCollection.dropIndex).toHaveBeenCalledWith(TTL_INDEX_PARAMS);
    });
  });
});