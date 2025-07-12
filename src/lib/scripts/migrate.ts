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
      throw new Error('MONGODB_URI or DATABASE_URL environment variable is required');
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

      console.log('Version | Status    | Description                    | Executed At');
      console.log('--------|-----------|--------------------------------|-------------------');

      for (const status of statuses) {
        const version = status.version.padEnd(7);
        const statusText = status.status.padEnd(9);
        const description = status.description.substring(0, 30).padEnd(30);
        const executedAt = status.executedAt
          ? status.executedAt.toISOString().substring(0, 19).replace('T', ' ')
          : 'Not executed';

        console.log(`${version} | ${statusText} | ${description} | ${executedAt}`);
      }

      const pendingCount = statuses.filter(s => s.status === 'pending').length;
      const executedCount = statuses.filter(s => s.status === 'executed').length;

      console.log(`\n📈 Summary: ${executedCount} executed, ${pendingCount} pending`);
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Execute migration operation with common error handling and reporting
   */
  private async executeOperation<T>(
    operation: () => Promise<T[]>,
    startMessage: string,
    emptyMessage: string,
    successMessageTemplate: string,
    summaryTemplate: string
  ): Promise<void> {
    await this.initialize();

    try {
      console.log(startMessage);

      const results = await operation();

      if (results.length === 0) {
        console.log(emptyMessage);
        return;
      }

      for (const result of results as any[]) {
        if (result.success) {
          console.log(`✅ ${successMessageTemplate.replace('{result}', `${result.version}: ${result.description} (${result.executionTime}ms)`)}`);
        } else {
          console.error(`❌ ${result.version}: ${result.description} - ${result.error?.message}`);
          if (startMessage.includes('Running')) {
            console.error(`   Execution stopped due to failure.`);
          }
          break;
        }
      }

      const successCount = results.filter((r: any) => r.success).length;
      const totalTime = results.reduce((sum: number, r: any) => sum + r.executionTime, 0);

      console.log(`\n🎉 ${summaryTemplate.replace('{count}', `${successCount}/${results.length}`).replace('{time}', `${totalTime}ms`)}`);
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Run pending migrations
   */
  async up(): Promise<void> {
    await this.executeOperation(
      () => this.runner!.migrate(),
      '🚀 Running migrations...\n',
      '✅ No pending migrations to run.',
      '{result}',
      'Completed {count} migrations in {time}'
    );
  }

  /**
   * Rollback migrations
   */
  async down(steps: number = 1): Promise<void> {
    await this.executeOperation(
      () => this.runner!.rollback(steps),
      `🔄 Rolling back ${steps} migration(s)...\n`,
      '✅ No migrations to rollback.',
      'Rolled back {result}',
      'Rolled back {count} migrations in {time}'
    );
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
        console.error('❌ Migration validation failed. Check the logs above for details.');
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
 * Handle down command with validation
 */
async function handleDownCommand(cli: MigrationCLI, args: string[]): Promise<void> {
  const steps = args[0] ? parseInt(args[0], 10) : 1;
  if (isNaN(steps) || steps < 1) {
    console.error('❌ Invalid number of steps. Must be a positive integer.');
    process.exit(1);
  }
  await cli.down(steps);
}

/**
 * Handle create command
 */
async function handleCreateCommand(cli: MigrationCLI, args: string[]): Promise<void> {
  const description = args.join(' ');
  await cli.create(description);
}

/**
 * Handle help commands
 */
function handleHelpCommand(cli: MigrationCLI): void {
  cli.help();
}

/**
 * Handle unknown commands
 */
function handleUnknownCommand(command: string | undefined): void {
  console.error(`❌ Unknown command: ${command || '(none)'}`);
  console.log('Run "npm run migrate:help" for usage information.');
  process.exit(1);
}

/**
 * Command mapping for better organization
 */
const COMMAND_HANDLERS = {
  'status': (cli: MigrationCLI, _args: string[]) => cli.status(),
  'up': (cli: MigrationCLI, _args: string[]) => cli.up(),
  'down': handleDownCommand,
  'create': handleCreateCommand,
  'validate': (cli: MigrationCLI, _args: string[]) => cli.validate(),
  'help': handleHelpCommand,
  '--help': handleHelpCommand,
  '-h': handleHelpCommand,
};

/**
 * Execute command if it exists
 */
async function executeCommand(command: string, cli: MigrationCLI, args: string[]): Promise<void> {
  const handler = COMMAND_HANDLERS[command as keyof typeof COMMAND_HANDLERS];
  if (handler) {
    await handler(cli, args);
  } else {
    handleUnknownCommand(command);
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
    await executeCommand(command, cli, args);
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { MigrationCLI, main };