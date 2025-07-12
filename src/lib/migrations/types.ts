/**
 * Type definitions for MongoDB migration system
 */

import { Db, MongoClient } from 'mongodb';

/**
 * Migration metadata stored in database
 */
export interface MigrationRecord {
  version: string;
  description: string;
  filename: string;
  executedAt: Date;
  executionTime: number;
  gitCommit?: string;
  rollbackAvailable: boolean;
}

/**
 * Migration file structure
 */
export interface Migration {
  version: string;
  description: string;
  up: (_db: Db) => Promise<void>;
  down: (_db: Db) => Promise<void>;
}

/**
 * Migration runner configuration
 */
export interface MigrationConfig {
  migrationsPath: string;
  collectionName: string;
  timeout: number;
  backupEnabled: boolean;
  dryRun: boolean;
  validateOnly: boolean;
}

/**
 * Migration execution result
 */
export interface MigrationResult {
  success: boolean;
  version: string;
  description: string;
  executionTime: number;
  error?: Error;
}

/**
 * Migration status information
 */
export interface MigrationStatus {
  version: string;
  description: string;
  filename: string;
  status: 'pending' | 'executed' | 'failed';
  executedAt?: Date;
  executionTime?: number;
}

/**
 * Migration runner interface
 */
export interface IMigrationRunner {
  getStatus(): Promise<MigrationStatus[]>;
  migrate(): Promise<MigrationResult[]>;
  rollback(_steps?: number): Promise<MigrationResult[]>;
  createMigration(_description: string): Promise<string>;
  validateMigrations(): Promise<boolean>;
}

/**
 * Migration context passed to migration functions
 */
export interface MigrationContext {
  db: Db;
  client: MongoClient;
  version: string;
  description: string;
  dryRun: boolean;
}

/**
 * Migration template data
 */
export interface MigrationTemplate {
  version: string;
  description: string;
  filename: string;
  content: string;
}

/**
 * Migration validation error
 */
export interface MigrationValidationError {
  version: string;
  filename: string;
  error: string;
  type: 'syntax' | 'structure' | 'dependency' | 'duplicate';
}