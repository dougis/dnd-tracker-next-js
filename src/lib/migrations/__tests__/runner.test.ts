/**
 * Test cases for MigrationRunner class
 * Following TDD principles - all tests should fail initially until implementation is created
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
import {
  Migration,
  MigrationConfig,
} from '../types';
import {
  createFactory,
  testUtils,
  assertionHelpers,
} from '../../services/__tests__/shared/test-factory-utils';

import * as fs from 'fs/promises';
import * as path from 'path';

const mockFs = jest.mocked(fs);
const mockPath = jest.mocked(path);

describe('MigrationRunner', () => {
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

  const createMigration = createFactory<Migration>({
    version: '001',
    description: 'Test migration',
    up: jest.fn().mockResolvedValue(undefined),
    down: jest.fn().mockResolvedValue(undefined),
  });


  testUtils.setupMockClearance();

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

    config = createMigrationConfig();
    runner = new MigrationRunner(mockClient, config);

    // Setup file system mocks
    mockFs.readdir = jest.fn().mockResolvedValue([]);
    mockFs.readFile = jest.fn().mockResolvedValue('');
    mockFs.writeFile = jest.fn().mockResolvedValue(undefined);
    mockFs.access = jest.fn().mockResolvedValue(undefined);
    mockFs.mkdir = jest.fn().mockResolvedValue(undefined);

    // Setup path mocks
    mockPath.join = jest.fn((...args) => args.join('/'));
    mockPath.extname = jest.fn((file) => {
      const parts = file.split('.');
      return parts.length > 1 ? '.' + parts.pop() : '';
    });
    mockPath.basename = jest.fn((file) => file.split('/').pop() || '');
  });

  describe('constructor', () => {
    it('should create MigrationRunner with valid configuration', () => {
      const testConfig = createMigrationConfig();
      const testRunner = new MigrationRunner(mockClient, testConfig);

      expect(testRunner).toBeInstanceOf(MigrationRunner);
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

  describe('getStatus', () => {
    it('should return status of all migrations', async () => {
      const migrationFiles = [
        '001_create_users.js',
        '002_add_indexes.js',
        '003_update_schema.js',
      ];

      const executedMigrations = [
        { version: '001', executedAt: new Date(), executionTime: 150 },
      ];

      mockFs.readdir = jest.fn().mockResolvedValue(migrationFiles);
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(executedMigrations),
        sort: jest.fn().mockReturnThis(),
      });

      const status = await runner.getStatus();

      expect(status).toHaveLength(3);
      expect(status[0].status).toBe('executed');
      expect(status[1].status).toBe('pending');
      expect(status[2].status).toBe('pending');
    });

    it('should handle empty migrations directory', async () => {
      mockFs.readdir = jest.fn().mockResolvedValue([]);

      const status = await runner.getStatus();

      expect(status).toHaveLength(0);
    });

    it('should handle database connection errors', async () => {
      mockFs.readdir = jest.fn().mockResolvedValue(['001_test.js']);
      mockCollection.find.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(runner.getStatus()).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should filter out non-migration files', async () => {
      const files = [
        '001_migration.js',
        'README.md',
        '.gitkeep',
        '002_migration.ts',
        'helper.js',
      ];

      mockFs.readdir = jest.fn().mockResolvedValue(files);
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
        sort: jest.fn().mockReturnThis(),
      });

      const status = await runner.getStatus();

      expect(status).toHaveLength(2); // Only migration files
      expect(status.map(s => s.filename)).toEqual([
        '001_migration.js',
        '002_migration.ts',
      ]);
    });

    it('should sort migrations by version', async () => {
      const migrationFiles = [
        '003_third.js',
        '001_first.js',
        '002_second.js',
      ];

      mockFs.readdir = jest.fn().mockResolvedValue(migrationFiles);
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
        sort: jest.fn().mockReturnThis(),
      });

      const status = await runner.getStatus();

      expect(status.map(s => s.version)).toEqual(['001', '002', '003']);
    });
  });

  describe('migrate', () => {
    it('should execute pending migrations in order', async () => {
      const migration1 = createMigration({ version: '001', description: 'First migration' });
      const migration2 = createMigration({ version: '002', description: 'Second migration' });

      mockFs.readdir = jest.fn().mockResolvedValue(['001_first.js', '002_second.js']);
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
        sort: jest.fn().mockReturnThis(),
      });

      // Mock dynamic imports
      jest.doMock('/test/migrations/001_first.js', () => migration1, { virtual: true });
      jest.doMock('/test/migrations/002_second.js', () => migration2, { virtual: true });

      const results = await runner.migrate();

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[0].version).toBe('001');
      expect(results[1].success).toBe(true);
      expect(results[1].version).toBe('002');

      assertionHelpers.expectSingleCall(migration1.up, mockDb);
      assertionHelpers.expectSingleCall(migration2.up, mockDb);
    });

    it('should skip already executed migrations', async () => {
      const migration = createMigration({ version: '001' });

      mockFs.readdir = jest.fn().mockResolvedValue(['001_test.js']);
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { version: '001', executedAt: new Date() },
        ]),
        sort: jest.fn().mockReturnThis(),
      });

      const results = await runner.migrate();

      expect(results).toHaveLength(0);
      expect(migration.up).not.toHaveBeenCalled();
    });

    it('should handle migration execution errors', async () => {
      const migration = createMigration({
        version: '001',
        up: jest.fn().mockRejectedValue(new Error('Migration failed')),
      });

      mockFs.readdir = jest.fn().mockResolvedValue(['001_test.js']);
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
        sort: jest.fn().mockReturnThis(),
      });

      jest.doMock('/test/migrations/001_test.js', () => migration, { virtual: true });

      const results = await runner.migrate();

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error?.message).toBe('Migration failed');
    });

    it('should stop execution on first failure when configured', async () => {
      const migration1 = createMigration({
        version: '001',
        up: jest.fn().mockRejectedValue(new Error('First failed')),
      });
      const migration2 = createMigration({ version: '002' });

      mockFs.readdir = jest.fn().mockResolvedValue(['001_first.js', '002_second.js']);
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
        sort: jest.fn().mockReturnThis(),
      });

      jest.doMock('/test/migrations/001_first.js', () => migration1, { virtual: true });
      jest.doMock('/test/migrations/002_second.js', () => migration2, { virtual: true });

      const results = await runner.migrate();

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(migration2.up).not.toHaveBeenCalled();
    });

    it('should record successful migrations in database', async () => {
      const migration = createMigration({ version: '001', description: 'Test migration' });

      mockFs.readdir = jest.fn().mockResolvedValue(['001_test.js']);
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
        sort: jest.fn().mockReturnThis(),
      });

      jest.doMock('/test/migrations/001_test.js', () => migration, { virtual: true });

      await runner.migrate();

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          version: '001',
          description: 'Test migration',
          filename: '001_test.js',
          executedAt: expect.any(Date),
          executionTime: expect.any(Number),
        })
      );
    });

    it('should respect timeout configuration', async () => {
      const slowMigration = createMigration({
        version: '001',
        up: jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 35000))),
      });

      const timeoutConfig = createMigrationConfig({ timeout: 1000 });
      const timeoutRunner = new MigrationRunner(mockClient, timeoutConfig);

      mockFs.readdir = jest.fn().mockResolvedValue(['001_slow.js']);
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
        sort: jest.fn().mockReturnThis(),
      });

      jest.doMock('/test/migrations/001_slow.js', () => slowMigration, { virtual: true });

      const results = await timeoutRunner.migrate();

      expect(results[0].success).toBe(false);
      expect(results[0].error?.message).toContain('timeout');
    });

    it('should support dry run mode', async () => {
      const migration = createMigration({ version: '001' });
      const dryRunConfig = createMigrationConfig({ dryRun: true });
      const dryRunRunner = new MigrationRunner(mockClient, dryRunConfig);

      mockFs.readdir = jest.fn().mockResolvedValue(['001_test.js']);
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
        sort: jest.fn().mockReturnThis(),
      });

      jest.doMock('/test/migrations/001_test.js', () => migration, { virtual: true });

      const results = await dryRunRunner.migrate();

      expect(results[0].success).toBe(true);
      expect(migration.up).not.toHaveBeenCalled();
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });
  });

  describe('rollback', () => {
    it('should rollback the last migration', async () => {
      const migration = createMigration({ version: '001' });

      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { version: '001', filename: '001_test.js', executedAt: new Date() },
        ]),
        sort: jest.fn().mockReturnThis(),
      });

      jest.doMock('/test/migrations/001_test.js', () => migration, { virtual: true });

      const results = await runner.rollback();

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].version).toBe('001');
      assertionHelpers.expectSingleCall(migration.down, mockDb);
    });

    it('should rollback multiple migrations when steps specified', async () => {
      const migration1 = createMigration({ version: '001' });
      const migration2 = createMigration({ version: '002' });

      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { version: '002', filename: '002_second.js', executedAt: new Date() },
          { version: '001', filename: '001_first.js', executedAt: new Date() },
        ]),
        sort: jest.fn().mockReturnThis(),
      });

      jest.doMock('/test/migrations/001_first.js', () => migration1, { virtual: true });
      jest.doMock('/test/migrations/002_second.js', () => migration2, { virtual: true });

      const results = await runner.rollback(2);

      expect(results).toHaveLength(2);
      expect(results[0].version).toBe('002');
      expect(results[1].version).toBe('001');
    });

    it('should handle rollback errors gracefully', async () => {
      const migration = createMigration({
        version: '001',
        down: jest.fn().mockRejectedValue(new Error('Rollback failed')),
      });

      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { version: '001', filename: '001_test.js', executedAt: new Date() },
        ]),
        sort: jest.fn().mockReturnThis(),
      });

      jest.doMock('/test/migrations/001_test.js', () => migration, { virtual: true });

      const results = await runner.rollback();

      expect(results[0].success).toBe(false);
      expect(results[0].error?.message).toBe('Rollback failed');
    });

    it('should remove migration record from database after successful rollback', async () => {
      const migration = createMigration({ version: '001' });

      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { version: '001', filename: '001_test.js', executedAt: new Date() },
        ]),
        sort: jest.fn().mockReturnThis(),
      });

      jest.doMock('/test/migrations/001_test.js', () => migration, { virtual: true });

      await runner.rollback();

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ version: '001' });
    });

    it('should return empty array when no migrations to rollback', async () => {
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
        sort: jest.fn().mockReturnThis(),
      });

      const results = await runner.rollback();

      expect(results).toHaveLength(0);
    });
  });

  describe('createMigration', () => {
    it('should create new migration file with proper naming convention', async () => {
      const description = 'Add user authentication';
      const expectedFilename = '001_add_user_authentication.js';

      mockFs.readdir = jest.fn().mockResolvedValue([]);
      mockFs.writeFile = jest.fn().mockResolvedValue(undefined);

      const filename = await runner.createMigration(description);

      expect(filename).toBe(expectedFilename);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        `/test/migrations/${expectedFilename}`,
        expect.stringContaining('Add user authentication'),
        'utf8'
      );
    });

    it('should increment version number for subsequent migrations', async () => {
      const existingFiles = ['001_first.js', '002_second.js'];
      mockFs.readdir = jest.fn().mockResolvedValue(existingFiles);
      mockFs.writeFile = jest.fn().mockResolvedValue(undefined);

      const filename = await runner.createMigration('Third migration');

      expect(filename).toBe('003_third_migration.js');
    });

    it('should handle special characters in description', async () => {
      mockFs.readdir = jest.fn().mockResolvedValue([]);
      mockFs.writeFile = jest.fn().mockResolvedValue(undefined);

      const filename = await runner.createMigration('Add user@domain.com & validate!');

      expect(filename).toBe('001_add_user_domain_com_validate.js');
    });

    it('should create migrations directory if it does not exist', async () => {
      mockFs.readdir = jest.fn().mockRejectedValue({ code: 'ENOENT' });
      mockFs.mkdir = jest.fn().mockResolvedValue(undefined);
      mockFs.writeFile = jest.fn().mockResolvedValue(undefined);

      await runner.createMigration('Test migration');

      expect(mockFs.mkdir).toHaveBeenCalledWith('/test/migrations', { recursive: true });
    });

    it('should throw error for empty description', async () => {
      await expect(runner.createMigration('')).rejects.toThrow(
        'Migration description is required'
      );
    });

    it('should handle file system write errors', async () => {
      mockFs.readdir = jest.fn().mockResolvedValue([]);
      mockFs.writeFile = jest.fn().mockRejectedValue(new Error('Permission denied'));

      await expect(runner.createMigration('Test migration')).rejects.toThrow(
        'Permission denied'
      );
    });
  });

  describe('validateMigrations', () => {
    it('should validate all migration files successfully', async () => {
      const validMigration = createMigration({ version: '001' });

      mockFs.readdir = jest.fn().mockResolvedValue(['001_test.js']);
      jest.doMock('/test/migrations/001_test.js', () => validMigration, { virtual: true });

      const isValid = await runner.validateMigrations();

      expect(isValid).toBe(true);
    });

    it('should detect syntax errors in migration files', async () => {
      mockFs.readdir = jest.fn().mockResolvedValue(['001_invalid.js']);
      jest.doMock('/test/migrations/001_invalid.js', () => {
        throw new SyntaxError('Unexpected token');
      }, { virtual: true });

      const isValid = await runner.validateMigrations();

      expect(isValid).toBe(false);
    });

    it('should detect missing required methods', async () => {
      const invalidMigration = { version: '001', description: 'Test' }; // Missing up/down

      mockFs.readdir = jest.fn().mockResolvedValue(['001_invalid.js']);
      jest.doMock('/test/migrations/001_invalid.js', () => invalidMigration, { virtual: true });

      const isValid = await runner.validateMigrations();

      expect(isValid).toBe(false);
    });

    it('should detect duplicate version numbers', async () => {
      const migration1 = createMigration({ version: '001' });
      const migration2 = createMigration({ version: '001' }); // Duplicate version

      mockFs.readdir = jest.fn().mockResolvedValue(['001_first.js', '001_second.js']);
      jest.doMock('/test/migrations/001_first.js', () => migration1, { virtual: true });
      jest.doMock('/test/migrations/001_second.js', () => migration2, { virtual: true });

      const isValid = await runner.validateMigrations();

      expect(isValid).toBe(false);
    });

    it('should return true for empty migrations directory', async () => {
      mockFs.readdir = jest.fn().mockResolvedValue([]);

      const isValid = await runner.validateMigrations();

      expect(isValid).toBe(true);
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle database connection failures during migration', async () => {
      mockFs.readdir = jest.fn().mockResolvedValue(['001_test.js']);
      mockCollection.find.mockImplementation(() => {
        throw new Error('Connection lost');
      });

      await expect(runner.migrate()).rejects.toThrow('Connection lost');
    });

    it('should handle corrupted migration files', async () => {
      mockFs.readdir = jest.fn().mockResolvedValue(['001_corrupted.js']);
      jest.doMock('/test/migrations/001_corrupted.js', () => {
        throw new Error('Unexpected end of input');
      }, { virtual: true });

      const results = await runner.migrate();

      expect(results[0].success).toBe(false);
      expect(results[0].error?.message).toContain('Unexpected end of input');
    });

    it('should handle file system permission errors', async () => {
      mockFs.readdir = jest.fn().mockRejectedValue({ code: 'EACCES' });

      await expect(runner.getStatus()).rejects.toThrow();
    });

    it('should handle malformed migration records in database', async () => {
      const malformedRecord = { version: null, executedAt: 'invalid-date' };

      mockFs.readdir = jest.fn().mockResolvedValue(['001_test.js']);
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([malformedRecord]),
        sort: jest.fn().mockReturnThis(),
      });

      const status = await runner.getStatus();

      expect(status[0].status).toBe('pending'); // Should handle gracefully
    });

    it('should handle memory limits with large migration files', async () => {
      const largeMigration = {
        ...createMigration({ version: '001' }),
        largeData: 'x'.repeat(1000000), // 1MB of data
      };

      mockFs.readdir = jest.fn().mockResolvedValue(['001_large.js']);
      jest.doMock('/test/migrations/001_large.js', () => largeMigration, { virtual: true });

      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
        sort: jest.fn().mockReturnThis(),
      });

      const results = await runner.migrate();

      expect(results[0].success).toBe(true); // Should handle large files
    });
  });

  describe('Configuration validation', () => {
    it('should validate migration path accessibility', async () => {
      const inaccessibleConfig = createMigrationConfig({
        migrationsPath: '/non/existent/path',
      });

      mockFs.access = jest.fn().mockRejectedValue({ code: 'ENOENT' });

      const inaccessibleRunner = new MigrationRunner(mockClient, inaccessibleConfig);

      await expect(inaccessibleRunner.getStatus()).rejects.toThrow();
    });

    it('should handle invalid timeout values', () => {
      const invalidConfig = createMigrationConfig({ timeout: -1 });

      expect(() => new MigrationRunner(mockClient, invalidConfig)).toThrow(
        'Timeout must be a positive number'
      );
    });

    it('should handle invalid collection names', () => {
      const invalidConfig = createMigrationConfig({ collectionName: '' });

      expect(() => new MigrationRunner(mockClient, invalidConfig)).toThrow(
        'Collection name cannot be empty'
      );
    });
  });

  describe('Performance considerations', () => {
    it('should process large numbers of migrations efficiently', async () => {
      const manyMigrations = Array.from({ length: 100 }, (_, i) =>
        `${String(i + 1).padStart(3, '0')}_migration_${i + 1}.js`
      );

      mockFs.readdir = jest.fn().mockResolvedValue(manyMigrations);
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
        sort: jest.fn().mockReturnThis(),
      });

      const startTime = Date.now();
      const status = await runner.getStatus();
      const endTime = Date.now();

      expect(status).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
    });

    it('should handle concurrent migration attempts gracefully', async () => {
      const migration = createMigration({ version: '001' });

      mockFs.readdir = jest.fn().mockResolvedValue(['001_test.js']);
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
        sort: jest.fn().mockReturnThis(),
      });
      mockCollection.insertOne.mockRejectedValue({ code: 11000 }); // Duplicate key error

      jest.doMock('/test/migrations/001_test.js', () => migration, { virtual: true });

      const results = await runner.migrate();

      expect(results[0].success).toBe(false);
      expect(results[0].error?.message).toContain('already executed');
    });
  });
});