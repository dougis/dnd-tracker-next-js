/**
 * Integration tests for GitHub Actions migration functionality
 * Tests actual function execution with mocked external dependencies
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import {
  detectNewMigrations,
  createDatabaseBackup,
  rollbackMigrations,
  validateMigrationFiles,
  executeMigrations
} from '../gh-actions-migration';
import { MockTestHelper, ExecutionAssertionHelper } from './test-utils';

// Mock external dependencies
jest.mock('child_process');
jest.mock('fs/promises');

// Create dynamic MongoDB mock
const mockToArray = jest.fn();
const mockFind = jest.fn().mockReturnValue({ toArray: mockToArray });
const mockCollection = jest.fn().mockReturnValue({ find: mockFind });
const mockDb = jest.fn().mockReturnValue({ collection: mockCollection });
const mockConnect = jest.fn();
const mockClose = jest.fn();

jest.mock('mongodb', () => ({
  MongoClient: jest.fn().mockImplementation(() => ({
    connect: mockConnect,
    close: mockClose,
    db: mockDb
  }))
}));

const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockedFs = fs as jest.Mocked<typeof fs>;

// Test helper functions to reduce duplication
function setupDatabaseMock(migrationData: Array<{ version: string }>) {
  MockTestHelper.setupDatabaseMock(mockToArray, migrationData);
}

function setupFileSystemMock(fileNames: string[]) {
  MockTestHelper.setupFileSystemMock(mockedFs, fileNames);
}

describe('GitHub Actions Migration Integration Tests', () => {
  beforeEach(() => {
    // Reset specific mocks with preserved implementations
    mockConnect.mockReset().mockResolvedValue(undefined);
    mockClose.mockReset();
    mockDb.mockReset();
    mockCollection.mockReset();
    mockFind.mockReset();
    mockToArray.mockReset();

    // Setup environment and file system mocks using helpers
    MockTestHelper.setupTestEnvironment();
    MockTestHelper.setupFilesystemMocks(mockedFs);

    // Set up default database mock chain with empty data as default
    mockToArray.mockResolvedValue([]);
    mockFind.mockReturnValue({ toArray: mockToArray });
    mockCollection.mockReturnValue({ find: mockFind });
    mockDb.mockReturnValue({ collection: mockCollection });

    // Clear exec sync mock
    mockedExecSync.mockReset();
  });

  afterEach(() => {
    MockTestHelper.cleanupTestEnvironment();
  });

  describe('detectNewMigrations', () => {
    it('should detect new migrations correctly', async () => {
      // Set up scenario: DB has 2 migrations, files have 3 migrations
      setupDatabaseMock([
        { version: '20241201120000_initial_migration' },
        { version: '20241202120000_add_users' }
      ]);

      setupFileSystemMock([
        '20241201120000_initial_migration.js',
        '20241202120000_add_users.js',
        '20241203120000_new_feature.js'
      ]);

      const result = await detectNewMigrations();

      expect(result.hasNewMigrations).toBe(true);
      expect(result.newMigrationCount).toBe(1);
      expect(result.pendingMigrations).toContain('20241203120000_new_feature');
    });

    it('should handle no new migrations', async () => {
      // Set up scenario: DB has all migrations that exist in files
      setupDatabaseMock([
        { version: '20241201120000_initial_migration' },
        { version: '20241202120000_add_users' },
        { version: '20241203120000_new_feature' }
      ]);

      setupFileSystemMock([
        '20241201120000_initial_migration.js',
        '20241202120000_add_users.js',
        '20241203120000_new_feature.js'
      ]);

      const result = await detectNewMigrations();

      expect(result.hasNewMigrations).toBe(false);
      expect(result.newMigrationCount).toBe(0);
      expect(result.pendingMigrations).toHaveLength(0);
    });

    it('should handle missing migrations directory', async () => {
      // Setup database mock with empty data first
      setupDatabaseMock([]);

      mockedFs.readdir = jest.fn().mockRejectedValue(new Error('ENOENT'));

      const result = await detectNewMigrations();

      expect(result.hasNewMigrations).toBe(false);
      expect(result.newMigrationCount).toBe(0);
      expect(result.pendingMigrations).toHaveLength(0);
    });

    it('should validate MongoDB URI format', async () => {
      process.env.MONGODB_URI = 'invalid-uri';

      // Mock connect to throw validation error
      mockConnect.mockRejectedValue(new Error('Invalid MongoDB URI format'));

      await expect(detectNewMigrations()).rejects.toThrow();
    });

    it('should validate database name format', async () => {
      process.env.MONGODB_DB_NAME = 'invalid db name!';

      // Mock connect to throw validation error
      mockConnect.mockRejectedValue(new Error('Invalid database name format'));

      await expect(detectNewMigrations()).rejects.toThrow();
    });
  });

  describe('createDatabaseBackup', () => {
    it('should create backup successfully', async () => {
      mockedExecSync.mockReturnValue(Buffer.from(''));

      const result = await createDatabaseBackup();

      expect(result.success).toBe(true);
      expect(result.backupPath).toMatch(/\/tmp\/db-backups\/migration-backup-.*\.gz/);
      expect(result.fileSize).toBe(1024);
      ExecutionAssertionHelper.assertExecSyncCalledWithCommand(
        mockedExecSync,
        'mongodump --uri=mongodb://localhost:27017/test'
      );
    });

    it('should handle backup failure', async () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('mongodump failed');
      });

      const result = await createDatabaseBackup();

      expect(result.success).toBe(false);
      expect(result.fileSize).toBe(0);
    });

    it('should create backup directory if it does not exist', async () => {
      mockedFs.mkdir = jest.fn().mockResolvedValue(undefined);
      mockedExecSync.mockReturnValue(Buffer.from(''));

      await createDatabaseBackup({ backupPath: '/custom/backup/path' });

      expect(mockedFs.mkdir).toHaveBeenCalledWith('/custom/backup/path', { recursive: true });
    });

    it('should validate custom backup path', async () => {
      await expect(createDatabaseBackup({
        backupPath: '/invalid;path'
      })).rejects.toThrow('Invalid backup path format');
    });
  });

  describe('rollbackMigrations', () => {
    it('should perform automatic rollback successfully', async () => {
      mockedExecSync.mockReturnValue(Buffer.from(''));

      const result = await rollbackMigrations(2);

      expect(result.success).toBe(true);
      expect(result.method).toBe('automatic');
      expect(result.rollbackSteps).toBe(2);
      expect(mockedExecSync).toHaveBeenCalledWith(
        'npm run migrate:down 2',
        expect.objectContaining({
          env: expect.objectContaining({
            MONGODB_URI: 'mongodb://localhost:27017/test',
            MONGODB_DB_NAME: 'testdb'
          })
        })
      );
    });

    it('should fallback to backup restore when automatic rollback fails', async () => {
      // First call (automatic rollback) fails
      mockedExecSync
        .mockImplementationOnce(() => {
          throw new Error('Migration rollback failed');
        })
        // Second call (backup restore) succeeds
        .mockReturnValueOnce(Buffer.from(''));

      const backupPath = '/tmp/backup.gz';
      const result = await rollbackMigrations(1, backupPath);

      expect(result.success).toBe(true);
      expect(result.method).toBe('backup-restore');
      expect(result.restoredBackup).toBe(backupPath);
      expect(mockedExecSync).toHaveBeenCalledTimes(2);
    });

    it('should handle backup restore failure', async () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      const backupPath = '/tmp/backup.gz';
      const result = await rollbackMigrations(1, backupPath);

      expect(result.success).toBe(false);
      expect(result.method).toBe('backup-restore');
    });

    it('should handle missing backup file', async () => {
      mockedExecSync.mockImplementationOnce(() => {
        throw new Error('Migration rollback failed');
      });
      mockedFs.access = jest.fn().mockRejectedValue(new Error('ENOENT'));

      const backupPath = '/tmp/nonexistent-backup.gz';
      const result = await rollbackMigrations(1, backupPath);

      expect(result.success).toBe(false);
      expect(result.method).toBe('backup-restore');
    });

    it('should validate steps parameter', async () => {
      await expect(rollbackMigrations(-1)).rejects.toThrow(
        'Steps must be a positive integer between 1 and 100'
      );

      await expect(rollbackMigrations(101)).rejects.toThrow(
        'Steps must be a positive integer between 1 and 100'
      );

      await expect(rollbackMigrations(1.5)).rejects.toThrow(
        'Steps must be a positive integer between 1 and 100'
      );
    });
  });

  describe('validateMigrationFiles', () => {
    it('should validate migrations successfully', async () => {
      mockedExecSync.mockReturnValue(Buffer.from(''));

      const result = await validateMigrationFiles('./migrations');

      expect(result).toBe(true);
      expect(mockedExecSync).toHaveBeenCalledWith(
        'npm run migrate:validate',
        expect.objectContaining({
          env: expect.objectContaining({
            MIGRATIONS_PATH: './migrations'
          })
        })
      );
    });

    it('should handle validation failure', async () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const result = await validateMigrationFiles();

      expect(result).toBe(false);
    });
  });

  describe('executeMigrations', () => {
    it('should execute migrations successfully', async () => {
      mockedExecSync.mockReturnValue(Buffer.from(''));

      const result = await executeMigrations(false);

      expect(result).toBe(true);
      expect(mockedExecSync).toHaveBeenCalledWith(
        'npm run migrate:up',
        expect.objectContaining({
          env: expect.objectContaining({
            MONGODB_URI: 'mongodb://localhost:27017/test',
            MONGODB_DB_NAME: 'testdb',
            MIGRATION_DRY_RUN: 'false',
            MIGRATION_VALIDATE_ONLY: 'false'
          })
        })
      );
    });

    it('should execute dry run migrations', async () => {
      mockedExecSync.mockReturnValue(Buffer.from(''));

      const result = await executeMigrations(true);

      expect(result).toBe(true);
      expect(mockedExecSync).toHaveBeenCalledWith(
        'npm run migrate:up',
        expect.objectContaining({
          env: expect.objectContaining({
            MIGRATION_DRY_RUN: 'true',
            MIGRATION_VALIDATE_ONLY: 'true'
          })
        })
      );
    });

    it('should handle migration execution failure', async () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('Migration failed');
      });

      const result = await executeMigrations();

      expect(result).toBe(false);
    });

    it('should require MongoDB configuration', async () => {
      delete process.env.MONGODB_URI;

      await expect(executeMigrations()).rejects.toThrow(
        'MongoDB URI and database name are required'
      );
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle timeout errors gracefully', async () => {
      mockedExecSync.mockImplementation(() => {
        const error = new Error('Command timed out') as any;
        error.code = 'TIMEOUT';
        throw error;
      });

      const result = await createDatabaseBackup();
      expect(result.success).toBe(false);
    });

    it('should handle large backup files', async () => {
      mockedFs.stat = jest.fn().mockResolvedValue({ size: 1024 * 1024 * 1024 } as any); // 1GB
      mockedExecSync.mockReturnValue(Buffer.from(''));

      const result = await createDatabaseBackup();

      expect(result.success).toBe(true);
      expect(result.fileSize).toBe(1024 * 1024 * 1024);
    });

    it('should handle configuration object variations', async () => {
      const config = {
        mongodbUri: 'mongodb://custom:27017/custom',
        databaseName: 'customdb',
        timeout: 60000
      };

      // Set up scenario: DB has 0 migrations, file has 1 migration
      setupDatabaseMock([]);
      setupFileSystemMock(['20241201120000_migration1.js']);

      const result = await detectNewMigrations(config);

      expect(result).toBeDefined();
      expect(result.hasNewMigrations).toBe(true); // DB has 0, file has 1, so 1 new migration
      expect(result.newMigrationCount).toBe(1);
    });
  });
});