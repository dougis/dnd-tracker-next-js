/**
 * Shared test utilities for migration tests
 * Eliminates code duplication across all migration test files
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

export function createMigrationTestSetup() {
  let mockDb: jest.Mocked<Db>;
  let mockClient: jest.Mocked<MongoClient>;
  let mockCollection: any;
  let runner: MigrationRunner;
  let config: MigrationConfig;

  // Test constants
  const TestConstants = {
    TTL_INDEX_PARAMS: { expires: 1 },
    TTL_INDEX_OPTIONS: { expireAfterSeconds: 0 },
    MIGRATION_METADATA: { version: '001', description: 'Create initial user collection indexes' },
  };

  // Test data factories
  const createMigrationConfig = createFactory<MigrationConfig>({
    migrationsPath: '/test/migrations',
    collectionName: 'migrations',
    timeout: 30000,
    backupEnabled: true,
    dryRun: false,
    validateOnly: false,
  });

  const MockHelpers = {
    createMigrationBase: (upImpl?: any, downImpl?: any) => ({
      ...TestConstants.MIGRATION_METADATA,
      up: jest.fn().mockImplementation(upImpl || (async (db) => {
        await db.collection('verificationtokens').createIndex(TestConstants.TTL_INDEX_PARAMS, TestConstants.TTL_INDEX_OPTIONS);
      })),
      down: jest.fn().mockImplementation(downImpl || (async () => {})),
    }),

    setupTestEnvironment: (collectionBehavior: any = {}) => {
      const defaultBehavior = { createIndex: jest.fn().mockResolvedValue(undefined), dropIndex: jest.fn().mockResolvedValue(undefined) };
      const mockTokensCollection = { ...defaultBehavior, ...collectionBehavior };

      (mockFs.readdir as jest.Mock).mockResolvedValue(['001_initial_user_collections.js']);
      mockCollection.find.mockReturnValue({ toArray: jest.fn().mockResolvedValue([]), sort: jest.fn().mockReturnThis() });
      mockDb.collection.mockImplementation((name) => name === 'verificationtokens' ? mockTokensCollection : mockCollection);

      const migration = MockHelpers.createMigrationBase();
      jest.spyOn(runner as any, 'loadMigration').mockResolvedValue(migration);
      return { migration, mockTokensCollection };
    },
  };

  const AssertionHelpers = {
    expectTTLIndexCall: (mockCollection: any, timesCalled = 1) => {
      expect(mockCollection.createIndex).toHaveBeenCalledWith(TestConstants.TTL_INDEX_PARAMS, TestConstants.TTL_INDEX_OPTIONS);
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(timesCalled);
    },
  };

  const TestSetup = {
    initializeMocks: () => {
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
    },
  };

  testUtils.setupMockClearance();

  // Initialize mocks
  TestSetup.initializeMocks();

  return {
    TestConstants,
    MockHelpers,
    TestSetup,
    AssertionHelpers,
    mockDb: () => mockDb,
    mockClient: () => mockClient,
    mockCollection: () => mockCollection,
    runner: () => runner,
    config: () => config,
  };
}