/**
 * Tests for database selection in MigrationRunner
 * Testing the bug where migrations execute against 'test' database instead of specified database
 * Following TDD principles - all tests should fail initially until implementation is fixed
 */

import { MongoClient } from 'mongodb';
import { MigrationRunner } from '../runner';
import { MigrationConfig } from '../types';
import { createMigrationTestSetup } from './migration-test-helpers';

/**
 * Helper function to create a mock MongoClient with customizable URL
 */
function createMockClient(url?: string): MongoClient {
  const options = url ? { url } : {};
  return {
    db: jest.fn().mockReturnValue({}),
    options,
  } as unknown as MongoClient;
}

/**
 * Helper function to create a base migration config with optional overrides
 */
function createTestConfig(overrides: Partial<MigrationConfig> = {}): MigrationConfig {
  return {
    migrationsPath: '/test/migrations',
    collectionName: 'migrations',
    timeout: 30000,
    backupEnabled: true,
    dryRun: false,
    validateOnly: false,
    ...overrides,
  };
}

describe('MigrationRunner Database Selection', () => {
  const testSetup = createMigrationTestSetup();

  beforeEach(() => {
    testSetup.TestSetup.initializeMocks();
  });

  describe('Database Selection from Connection String', () => {
    it('should use database name specified in connection string', () => {
      const mockClient = createMockClient('mongodb://username:password@host:port/dnd-dev?retryWrites=true&w=majority');
      const config = createTestConfig();

      new MigrationRunner(mockClient, config);

      // Should call client.db('dnd-dev') not client.db()
      expect(mockClient.db).toHaveBeenCalledWith('dnd-dev');
    });

    it('should use database name from config.databaseName when provided', () => {
      const mockClient = createMockClient('mongodb://username:password@host:port/dnd-dev');
      const config = createTestConfig({ databaseName: 'custom-db' });

      new MigrationRunner(mockClient, config);

      // Should use config.databaseName over connection string
      expect(mockClient.db).toHaveBeenCalledWith('custom-db');
    });

    it('should extract database name from connection string with query parameters', () => {
      const mockClient = createMockClient('mongodb://username:password@host:port/production-db?ssl=true&replicaSet=rs0');
      const config = createTestConfig();

      new MigrationRunner(mockClient, config);

      expect(mockClient.db).toHaveBeenCalledWith('production-db');
    });

    it('should handle connection string without database name', () => {
      const mockClient = createMockClient('mongodb://username:password@host:port/');
      const config = createTestConfig();

      new MigrationRunner(mockClient, config);

      // Should fallback to 'test' when no database name is found
      expect(mockClient.db).toHaveBeenCalledWith('test');
    });

    it('should handle connection string ending with just slash', () => {
      const mockClient = createMockClient('mongodb://username:password@host:port');
      const config = createTestConfig();

      new MigrationRunner(mockClient, config);

      // Should fallback to 'test' when no database name is found
      expect(mockClient.db).toHaveBeenCalledWith('test');
    });

    it('should handle missing connection URL', () => {
      const mockClient = createMockClient(); // No URL provided
      const config = createTestConfig();

      new MigrationRunner(mockClient, config);

      // Should fallback to 'test' when no URL is available
      expect(mockClient.db).toHaveBeenCalledWith('test');
    });
  });

  describe('Database Selection Priority', () => {
    it('should prioritize config.databaseName over connection string', () => {
      const mockClient = createMockClient('mongodb://username:password@host:port/connection-string-db');
      const config = createTestConfig({ databaseName: 'config-specified-db' });

      new MigrationRunner(mockClient, config);

      expect(mockClient.db).toHaveBeenCalledWith('config-specified-db');
      expect(mockClient.db).not.toHaveBeenCalledWith('connection-string-db');
    });

    it('should handle empty string databaseName in config', () => {
      const mockClient = createMockClient('mongodb://username:password@host:port/fallback-db');
      const config = createTestConfig({ databaseName: '' }); // Empty string should be treated as undefined

      new MigrationRunner(mockClient, config);

      expect(mockClient.db).toHaveBeenCalledWith('fallback-db');
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed connection strings gracefully', () => {
      const mockClient = createMockClient('not-a-valid-url');
      const config = createTestConfig();

      new MigrationRunner(mockClient, config);

      // Should fallback to 'test' for malformed URLs
      expect(mockClient.db).toHaveBeenCalledWith('test');
    });

    it('should handle database name with special characters', () => {
      const mockClient = createMockClient('mongodb://username:password@host:port/my-app_test-db');
      const config = createTestConfig();

      new MigrationRunner(mockClient, config);

      expect(mockClient.db).toHaveBeenCalledWith('my-app_test-db');
    });
  });
});