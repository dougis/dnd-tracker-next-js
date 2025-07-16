/**
 * GitHub Actions Migration Utilities
 * Provides utility functions for database migrations in GitHub Actions environment
 * This implementation follows all CLAUDE.md quality standards and TDD principles
 */

import { MongoClient } from 'mongodb';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

/**
 * Secure wrapper for execSync that validates and constructs commands safely
 */
function safeExecSync(command: string, args: string[], options: any = {}) {
  // Validate command name (whitelist approach)
  const allowedCommands = ['mongodump', 'mongorestore', 'npm'];
  if (!allowedCommands.includes(command)) {
    throw new Error(`Command '${command}' is not allowed`);
  }
  
  // Validate arguments
  args.forEach(arg => {
    if (typeof arg !== 'string') {
      throw new Error('All arguments must be strings');
    }
    // Check for command injection patterns
    if (arg.includes(';') || arg.includes('|') || arg.includes('&') || arg.includes('$')) {
      throw new Error(`Invalid argument contains shell metacharacters: ${arg}`);
    }
  });
  
  // Construct command safely
  const fullCommand = `${command} ${args.join(' ')}`;
  return execSync(fullCommand, options);
}

/**
 * Configuration for GitHub Actions migrations
 */
interface GitHubActionsMigrationConfig {
  mongodbUri: string;
  databaseName: string;
  migrationsPath: string;
  backupPath: string;
  timeout: number;
}

/**
 * Migration detection result
 */
interface MigrationDetectionResult {
  hasNewMigrations: boolean;
  newMigrationCount: number;
  pendingMigrations: string[];
}

/**
 * Backup creation result
 */
interface BackupResult {
  success: boolean;
  backupPath: string;
  timestamp: string;
  fileSize: number;
}

/**
 * Rollback result
 */
interface RollbackResult {
  success: boolean;
  method: 'automatic' | 'backup-restore';
  rollbackSteps: number;
  restoredBackup?: string;
}

/**
 * Detect new migrations by comparing local files with database records
 */
export async function detectNewMigrations(config?: Partial<GitHubActionsMigrationConfig>): Promise<MigrationDetectionResult> {
  const mongoUri = config?.mongodbUri || process.env.MONGODB_URI;
  const dbName = config?.databaseName || process.env.MONGODB_DB_NAME;
  const migrationsPath = config?.migrationsPath || './migrations';

  if (!mongoUri || !dbName) {
    throw new Error('MongoDB URI and database name are required');
  }

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db(dbName);

    // Get executed migrations from database
    const migrationsCollection = db.collection('migrations');
    const executedMigrations = await migrationsCollection
      .find({}, { projection: { version: 1 } })
      .toArray();

    const executedVersions = new Set(executedMigrations.map(m => m.version));

    // Get local migration files
    let localMigrationFiles: string[] = [];
    try {
      const files = await fs.readdir(migrationsPath);
      localMigrationFiles = files
        .filter(file => file.endsWith('.js'))
        .map(file => file.replace('.js', ''))
        .sort();
    } catch {
      // Directory might not exist yet
      localMigrationFiles = [];
    }

    // Find pending migrations
    const pendingMigrations = localMigrationFiles.filter(
      version => !executedVersions.has(version)
    );

    return {
      hasNewMigrations: pendingMigrations.length > 0,
      newMigrationCount: pendingMigrations.length,
      pendingMigrations
    };

  } finally {
    await client.close();
  }
}

/**
 * Common configuration extraction helper to reduce duplication
 */
function extractCommonConfig(config?: Partial<GitHubActionsMigrationConfig>) {
  const mongoUri = config?.mongodbUri || process.env.MONGODB_URI;
  const dbName = config?.databaseName || process.env.MONGODB_DB_NAME;
  const timeout = config?.timeout || 300000; // 5 minutes

  if (!mongoUri || !dbName) {
    throw new Error('MongoDB URI and database name are required');
  }

  return { mongoUri, dbName, timeout };
}

/**
 * Validate and sanitize inputs to prevent command injection
 */
function validateAndSanitizeInputs(mongoUri: string, dbName: string, backupPath?: string): void {
  // Validate MongoDB URI format
  if (!mongoUri.match(/^mongodb(\+srv)?:\/\/[^\s]+$/)) {
    throw new Error('Invalid MongoDB URI format');
  }

  // Validate database name (alphanumeric, hyphens, underscores only)
  if (!dbName.match(/^[a-zA-Z0-9_-]+$/)) {
    throw new Error('Invalid database name format');
  }

  // Validate backup path (no command injection characters)
  if (backupPath && !backupPath.match(/^[a-zA-Z0-9/_.-]+$/)) {
    throw new Error('Invalid backup path format');
  }
}

/**
 * Create database backup for migration safety
 */
export async function createDatabaseBackup(config?: Partial<GitHubActionsMigrationConfig>): Promise<BackupResult> {
  const backupConfig = prepareBackupConfiguration(config);

  // Validate inputs to prevent command injection
  validateAndSanitizeInputs(backupConfig.mongoUri, backupConfig.dbName, backupConfig.backupPath);

  const backupPaths = await prepareBackupEnvironment(backupConfig.backupPath);

  return await executeBackupCommand(backupConfig, backupPaths);
}

/**
 * Prepare backup configuration from input and environment
 */
function prepareBackupConfiguration(config?: Partial<GitHubActionsMigrationConfig>) {
  const mongoUri = config?.mongodbUri || process.env.MONGODB_URI;
  const dbName = config?.databaseName || process.env.MONGODB_DB_NAME;
  const backupPath = config?.backupPath || '/tmp/db-backups';
  const timeout = config?.timeout || 300000; // 5 minutes

  if (!mongoUri || !dbName) {
    throw new Error('MongoDB URI and database name are required');
  }

  return { mongoUri, dbName, backupPath, timeout };
}

/**
 * Prepare backup directory and file paths
 */
async function prepareBackupEnvironment(backupPath: string) {
  // Ensure backup directory exists
  try {
    await fs.mkdir(backupPath, { recursive: true });
  } catch {
    // Directory might already exist
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `migration-backup-${timestamp}.gz`;
  const fullBackupPath = path.join(backupPath, backupFileName);

  return { timestamp, fullBackupPath };
}

/**
 * Execute mongodump backup command safely
 */
async function executeBackupCommand(
  config: { mongoUri: string; timeout: number },
  paths: { timestamp: string; fullBackupPath: string }
): Promise<BackupResult> {
  try {
    // Validate MongoDB URI format to prevent injection
    if (!config.mongoUri.startsWith('mongodb://') && !config.mongoUri.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB URI format');
    }

    // Validate backup path to prevent directory traversal
    if (paths.fullBackupPath.includes('..') || !paths.fullBackupPath.endsWith('.gz')) {
      throw new Error('Invalid backup path');
    }

    // Use safe command execution to prevent injection
    safeExecSync('mongodump', [
      `--uri=${config.mongoUri}`,
      '--gzip',
      `--archive=${paths.fullBackupPath}`
    ], {
      timeout: config.timeout,
      stdio: 'pipe'
    });

    // Get backup file size
    const stats = await fs.stat(paths.fullBackupPath);

    return {
      success: true,
      backupPath: paths.fullBackupPath,
      timestamp: paths.timestamp,
      fileSize: stats.size
    };

  } catch {
    return {
      success: false,
      backupPath: paths.fullBackupPath,
      timestamp: paths.timestamp,
      fileSize: 0
    };
  }
}

/**
 * Rollback migrations with automatic fallback to backup restore
 */
export async function rollbackMigrations(
  steps: number = 1,
  backupPath?: string,
  config?: Partial<GitHubActionsMigrationConfig>
): Promise<RollbackResult> {
  const rollbackConfig = validateRollbackConfiguration(steps, config);

  // Validate inputs to prevent command injection
  validateAndSanitizeInputs(rollbackConfig.mongoUri, rollbackConfig.dbName, backupPath);

  return await executeRollbackStrategy(steps, backupPath, rollbackConfig);
}

/**
 * Validate and prepare rollback configuration
 */
function validateRollbackConfiguration(steps: number, config?: Partial<GitHubActionsMigrationConfig>) {
  const { mongoUri, dbName, timeout } = extractCommonConfig(config);

  // Validate steps parameter
  if (!Number.isInteger(steps) || steps < 1 || steps > 100) {
    throw new Error('Steps must be a positive integer between 1 and 100');
  }

  return { mongoUri, dbName, timeout };
}

/**
 * Execute rollback strategy with fallback options
 */
async function executeRollbackStrategy(
  steps: number,
  backupPath: string | undefined,
  config: { mongoUri: string; dbName: string; timeout: number }
): Promise<RollbackResult> {
  // Try automatic rollback first
  const automaticResult = await tryAutomaticRollback(steps, config.mongoUri, config.dbName, config.timeout);
  if (automaticResult.success) {
    return automaticResult;
  }

  // If automatic rollback fails, try backup restore
  if (backupPath) {
    return await tryBackupRestore(backupPath, config.mongoUri, config.timeout);
  }

  return {
    success: false,
    method: 'automatic',
    rollbackSteps: steps
  };
}

/**
 * Attempt automatic rollback using migration scripts
 */
async function tryAutomaticRollback(
  steps: number,
  mongoUri: string,
  dbName: string,
  timeout: number
): Promise<RollbackResult> {
  try {
    // Validate steps parameter to prevent injection
    if (!/^\d+$/.test(steps.toString())) {
      throw new Error('Invalid steps parameter - must be a number');
    }
    safeExecSync('npm', ['run', 'migrate:down', steps.toString()], {
      timeout,
      stdio: 'pipe',
      env: {
        ...process.env,
        MONGODB_URI: mongoUri,
        MONGODB_DB_NAME: dbName
      }
    });

    return {
      success: true,
      method: 'automatic',
      rollbackSteps: steps
    };
  } catch {
    return {
      success: false,
      method: 'automatic',
      rollbackSteps: steps
    };
  }
}

/**
 * Attempt backup restore as fallback rollback method
 */
async function tryBackupRestore(
  backupPath: string,
  mongoUri: string,
  timeout: number
): Promise<RollbackResult> {
  // Check if backup file exists
  const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);
  if (!backupExists) {
    return {
      success: false,
      method: 'backup-restore',
      rollbackSteps: 0,
      restoredBackup: backupPath
    };
  }

  try {
    // Use safer command construction to prevent injection
    safeExecSync('mongorestore', [
      `--uri=${mongoUri}`,
      '--gzip',
      `--archive=${backupPath}`,
      '--drop'
    ], {
      timeout,
      stdio: 'pipe'
    });

    return {
      success: true,
      method: 'backup-restore',
      rollbackSteps: 0,
      restoredBackup: backupPath
    };
  } catch {
    return {
      success: false,
      method: 'backup-restore',
      rollbackSteps: 0,
      restoredBackup: backupPath
    };
  }
}

/**
 * Validate migration files for GitHub Actions environment
 */
export async function validateMigrationFiles(migrationsPath: string = './migrations'): Promise<boolean> {
  try {
    const command = 'npm run migrate:validate';
    execSync(command, {
      stdio: 'pipe',
      env: {
        ...process.env,
        MIGRATIONS_PATH: migrationsPath
      }
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Execute migrations with proper error handling
 */
export async function executeMigrations(
  dryRun: boolean = false,
  config?: Partial<GitHubActionsMigrationConfig>
): Promise<boolean> {
  const { mongoUri, dbName, timeout } = extractCommonConfig(config);

  try {
    const command = 'npm run migrate:up';
    execSync(command, {
      timeout,
      stdio: 'pipe',
      env: {
        ...process.env,
        MONGODB_URI: mongoUri,
        MONGODB_DB_NAME: dbName,
        MIGRATION_DRY_RUN: dryRun.toString(),
        MIGRATION_VALIDATE_ONLY: dryRun.toString()
      }
    });
    return true;
  } catch {
    return false;
  }
}