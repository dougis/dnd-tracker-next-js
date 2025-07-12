/**
 * Basic MigrationRunner tests - core functionality
 */

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

import { Db, MongoClient } from 'mongodb';
import { MigrationRunner } from '../runner';
import { MigrationConfig } from '../types';

describe('MigrationRunner - Basic Tests', () => {
  let mockDb: jest.Mocked<Db>;
  let mockClient: jest.Mocked<MongoClient>;
  let mockCollection: any;
  let runner: MigrationRunner;
  let config: MigrationConfig;

  beforeEach(() => {
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

    config = {
      migrationsPath: '/test/migrations',
      collectionName: 'migrations',
      timeout: 30000,
      backupEnabled: true,
      dryRun: false,
      validateOnly: false,
    };

    runner = new MigrationRunner(mockClient, config);
  });

  describe('constructor', () => {
    it('should create MigrationRunner with valid configuration', () => {
      expect(runner).toBeInstanceOf(MigrationRunner);
    });

    it('should throw error with invalid client', () => {
      expect(() => new MigrationRunner(null as any, config)).toThrow(
        'MongoDB client is required'
      );
    });

    it('should throw error with invalid configuration', () => {
      expect(() => new MigrationRunner(mockClient, null as any)).toThrow(
        'Migration configuration is required'
      );
    });

    it('should validate required configuration fields', () => {
      const invalidConfig = { ...config, migrationsPath: '' };
      expect(() => new MigrationRunner(mockClient, invalidConfig)).toThrow(
        'Migrations path is required'
      );
    });

    it('should set default values for optional configuration fields', () => {
      const minimalConfig = {
        migrationsPath: '/test/migrations',
        collectionName: 'migrations',
      } as MigrationConfig;

      const testRunner = new MigrationRunner(mockClient, minimalConfig);
      expect(testRunner).toBeInstanceOf(MigrationRunner);
    });
  });

  describe('basic validation', () => {
    it('should validate migration path accessibility', async () => {
      const fs = require('fs/promises');
      fs.access = jest.fn().mockRejectedValue({ code: 'ENOENT' });

      const inaccessibleConfig = {
        ...config,
        migrationsPath: '/non/existent/path',
      };

      const inaccessibleRunner = new MigrationRunner(mockClient, inaccessibleConfig);
      await expect(inaccessibleRunner.getStatus()).rejects.toThrow();
    });

    it('should handle invalid timeout values', () => {
      const invalidConfig = { ...config, timeout: -1 };

      expect(() => new MigrationRunner(mockClient, invalidConfig)).toThrow(
        'Timeout must be a positive number'
      );
    });

    it('should handle invalid collection names', () => {
      const invalidConfig = { ...config, collectionName: '' };

      expect(() => new MigrationRunner(mockClient, invalidConfig)).toThrow(
        'Collection name cannot be empty'
      );
    });
  });
});