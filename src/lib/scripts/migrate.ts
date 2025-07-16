#!/usr/bin/env node

/**
 * Migration CLI commands
 * Provides command-line interface for database migrations
 */

import { MongoClient } from 'mongodb';
import { MigrationRunner } from '../migrations/runner';
import { MigrationConfig } from '../migrations/types';

/**
 * CLI command handlers
 */
class MigrationCLI {
  private client: MongoClient | null = null;

  private runner: MigrationRunner | null = null;

  /**
   * Initialize database connection and runner
   */
  private async initialize(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!mongoUri) {
      throw new Error(
        'MONGODB_URI or DATABASE_URL environment variable is required'
      );
    }

    this.client = new MongoClient(mongoUri);
    await this.client.connect();

    const config: MigrationConfig = {
      migrationsPath: process.env.MIGRATIONS_PATH || './migrations',
      collectionName: process.env.MIGRATIONS_COLLECTION || 'migrations',
      timeout: parseInt(process.env.MIGRATION_TIMEOUT || '30000', 10),
      backupEnabled: process.env.MIGRATION_BACKUP_ENABLED !== 'false',
      dryRun: process.env.MIGRATION_DRY_RUN === 'true',
      validateOnly: process.env.MIGRATION_VALIDATE_ONLY === 'true',
      databaseName:
        process.env.MONGODB_DB_NAME || process.env.DATABASE_NAME || 'test',
    };

    this.runner = new MigrationRunner(this.client, config);
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    if (this.client) {
      await this.client.close();
    }
  }

  /**
   * Show migration status
   */
  async status(): Promise<void> {
    await this.initialize();

    try {
      console.log('📊 Migration Status\n');

      const statuses = await this.runner!.getStatus();

      if (statuses.length === 0) {
        console.log('No migrations found.');
        return;
      }

      console.log(
        'Version | Status    | Description                    | Executed At'
      );
      console.log(
        '--------|-----------|--------------------------------|-------------------'
      );

      for (const status of statuses) {
        const version = status.version.padEnd(7);
        const statusText = status.status.padEnd(9);
        const description = status.description.substring(0, 30).padEnd(30);
        const executedAt = status.executedAt
          ? status.executedAt.toISOString().substring(0, 19).replace('T', ' ')
          : 'Not executed';

        console.log(
          `${version} | ${statusText} | ${description} | ${executedAt}`
        );
      }

      const pendingCount = statuses.filter(s => s.status === 'pending').length;
      const executedCount = statuses.filter(
        s => s.status === 'executed'
      ).length;

      console.log(
        `\n📈 Summary: ${executedCount} executed, ${pendingCount} pending`
      );
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Run pending migrations
   */
  async up(): Promise<void> {
    await this.initialize();

    try {
      console.log('🚀 Running migrations...\n');

      const results = await this.runner!.migrate();

      if (results.length === 0) {
        console.log('✅ No pending migrations to run.');
        return;
      }

      for (const result of results) {
        if (result.success) {
          console.log(
            `✅ ${result.version}: ${result.description} (${result.executionTime}ms)`
          );
        } else {
          console.error(
            `❌ ${result.version}: ${result.description} - ${result.error?.message}`
          );
          console.error(`   Execution stopped due to failure.`);
          break;
        }
      }

      const successCount = results.filter(r => r.success).length;
      const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);

      console.log(
        `\n🎉 Completed ${successCount}/${results.length} migrations in ${totalTime}ms`
      );
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Rollback migrations
   */
  async down(steps: number = 1): Promise<void> {
    await this.initialize();

    try {
      console.log(`🔄 Rolling back ${steps} migration(s)...\n`);

      const results = await this.runner!.rollback(steps);

      if (results.length === 0) {
        console.log('✅ No migrations to rollback.');
        return;
      }

      for (const result of results) {
        if (result.success) {
          console.log(
            `✅ Rolled back ${result.version}: ${result.description} (${result.executionTime}ms)`
          );
        } else {
          console.error(
            `❌ Failed to rollback ${result.version}: ${result.description} - ${result.error?.message}`
          );
          break;
        }
      }

      const successCount = results.filter(r => r.success).length;
      const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);

      console.log(
        `\n🎉 Rolled back ${successCount}/${results.length} migrations in ${totalTime}ms`
      );
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Create new migration
   */
  async create(description: string): Promise<void> {
    if (!description) {
      console.error('❌ Migration description is required');
      console.log('Usage: npm run migrate:create "Add user authentication"');
      process.exit(1);
    }

    await this.initialize();

    try {
      console.log(`📝 Creating migration: ${description}\n`);

      const filename = await this.runner!.createMigration(description);

      console.log(`✅ Created migration file: ${filename}`);
      console.log(`   Edit the file to implement your migration logic.`);
      console.log(`   Run 'npm run migrate:up' to execute pending migrations.`);
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Validate migrations
   */
  async validate(): Promise<void> {
    await this.initialize();

    try {
      console.log('🔍 Validating migrations...\n');

      const isValid = await this.runner!.validateMigrations();

      if (isValid) {
        console.log('✅ All migrations are valid.');
      } else {
        console.error(
          '❌ Migration validation failed. Check the logs above for details.'
        );
        process.exit(1);
      }
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Show help
   */
  help(): void {
    console.log(`
🗄️  MongoDB Migration Tool

USAGE:
  npm run migrate:<command> [options]

COMMANDS:
  status                    Show migration status
  up                       Run pending migrations  
  down [steps]             Rollback migrations (default: 1 step)
  create <description>     Create new migration file
  validate                 Validate all migration files
  help                     Show this help message

ENVIRONMENT VARIABLES:
  MONGODB_URI              MongoDB connection string (required)
  MIGRATIONS_PATH          Path to migrations directory (default: ./migrations)
  MIGRATIONS_COLLECTION    Collection name for migration records (default: migrations)
  MIGRATION_TIMEOUT        Migration timeout in milliseconds (default: 30000)
  MIGRATION_BACKUP_ENABLED Enable backups before migrations (default: true)
  MIGRATION_DRY_RUN        Run in dry-run mode (default: false)
  MIGRATION_VALIDATE_ONLY  Only validate, don't execute (default: false)

EXAMPLES:
  npm run migrate:status
  npm run migrate:up
  npm run migrate:down 2
  npm run migrate:create "Add user authentication"
  npm run migrate:validate

For more information, see the documentation.
    `);
  }
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  const cli = new MigrationCLI();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    await executeCommand(cli, command, args);
  } catch (error) {
    console.error(
      `❌ Error: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}

async function executeCommand(
  cli: MigrationCLI,
  command: string,
  args: string[]
): Promise<void> {
  switch (command) {
    case 'status':
      await cli.status();
      break;
    case 'up':
      await cli.up();
      break;
    case 'down':
      await handleDownCommand(cli, args);
      break;
    case 'create':
      await handleCreateCommand(cli, args);
      break;
    case 'validate':
      await cli.validate();
      break;
    case 'help':
    case '--help':
    case '-h':
      cli.help();
      break;
    default:
      handleUnknownCommand(command);
  }
}

async function handleDownCommand(
  cli: MigrationCLI,
  args: string[]
): Promise<void> {
  const steps = args[0] ? parseInt(args[0], 10) : 1;
  if (isNaN(steps) || steps < 1) {
    console.error('❌ Invalid number of steps. Must be a positive integer.');
    process.exit(1);
  }
  await cli.down(steps);
}

async function handleCreateCommand(
  cli: MigrationCLI,
  args: string[]
): Promise<void> {
  const description = args.join(' ');
  await cli.create(description);
}

function handleUnknownCommand(command: string): never {
  console.error(`❌ Unknown command: ${command || '(none)'}`);
  console.log('Run "npm run migrate:help" for usage information.');
  process.exit(1);
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { MigrationCLI, main };
