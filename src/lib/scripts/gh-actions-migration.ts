/**
 * GitHub Actions Migration Utilities
 * Provides utility functions for database migrations in GitHub Actions environment
 */

import { MongoClient } from 'mongodb';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

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
 * Create database backup for migration safety
 */
export async function createDatabaseBackup(config?: Partial<GitHubActionsMigrationConfig>): Promise<BackupResult> {
  const mongoUri = config?.mongodbUri || process.env.MONGODB_URI;
  const dbName = config?.databaseName || process.env.MONGODB_DB_NAME;
  const backupPath = config?.backupPath || '/tmp/db-backups';
  const timeout = config?.timeout || 300000; // 5 minutes

  if (!mongoUri || !dbName) {
    throw new Error('MongoDB URI and database name are required');
  }

  // Ensure backup directory exists
  try {
    await fs.mkdir(backupPath, { recursive: true });
  } catch {
    // Directory might already exist
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `migration-backup-${timestamp}.gz`;
  const fullBackupPath = path.join(backupPath, backupFileName);

  try {
    // Create backup using mongodump
    const command = `mongodump --uri="${mongoUri}" --gzip --archive="${fullBackupPath}"`;

    execSync(command, {
      timeout,
      stdio: 'pipe'
    });

    // Get backup file size
    const stats = await fs.stat(fullBackupPath);

    return {
      success: true,
      backupPath: fullBackupPath,
      timestamp,
      fileSize: stats.size
    };

  } catch {
    return {
      success: false,
      backupPath: fullBackupPath,
      timestamp,
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
  const mongoUri = config?.mongodbUri || process.env.MONGODB_URI;
  const dbName = config?.databaseName || process.env.MONGODB_DB_NAME;
  const timeout = config?.timeout || 300000; // 5 minutes

  if (!mongoUri || !dbName) {
    throw new Error('MongoDB URI and database name are required');
  }

  // Try automatic rollback first
  try {
    const command = `npm run migrate:down ${steps}`;
    execSync(command, {
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
    // If automatic rollback fails and backup is available, try backup restore
    if (backupPath && await fs.access(backupPath).then(() => true).catch(() => false)) {
      try {
        const command = `mongorestore --uri="${mongoUri}" --gzip --archive="${backupPath}" --drop`;
        execSync(command, {
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

    return {
      success: false,
      method: 'automatic',
      rollbackSteps: steps
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
  const mongoUri = config?.mongodbUri || process.env.MONGODB_URI;
  const dbName = config?.databaseName || process.env.MONGODB_DB_NAME;
  const timeout = config?.timeout || 300000; // 5 minutes

  if (!mongoUri || !dbName) {
    throw new Error('MongoDB URI and database name are required');
  }

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