/**
 * Migration health check endpoint
 * Verifies migration system status and database schema integrity
 */

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { MigrationRunner } from '@/lib/migrations/runner';

export async function GET(_request: NextRequest) {
  let client: MongoClient | null = null;

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return NextResponse.json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'MONGODB_URI not configured',
      }, { status: 500 });
    }

    // Connect to database
    client = new MongoClient(mongoUri);
    await client.connect();

    // Initialize migration runner
    const runner = new MigrationRunner(client, {
      migrationsPath: './migrations',
      collectionName: 'migrations',
      timeout: 30000,
      backupEnabled: false,
      dryRun: false,
      validateOnly: true,
    });

    // Check migration status
    const migrationStatus = await runner.getStatus();
    const pendingMigrations = migrationStatus.filter(m => m.status === 'pending');
    const executedMigrations = migrationStatus.filter(m => m.status === 'executed');

    // Validate migrations
    const isValid = await runner.validateMigrations();

    const health: any = {
      status: pendingMigrations.length === 0 && isValid ? 'ok' : 'warning',
      timestamp: new Date().toISOString(),
      migrations: {
        total: migrationStatus.length,
        executed: executedMigrations.length,
        pending: pendingMigrations.length,
        valid: isValid,
      },
      database: {
        connected: true,
        migrationsCollection: 'accessible',
      },
    };

    if (pendingMigrations.length > 0) {
      health.pendingMigrations = pendingMigrations.map(m => ({
        version: m.version,
        description: m.description,
        filename: m.filename,
      }));
    }

    return NextResponse.json(health, {
      status: health.status === 'ok' ? 200 : 503,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Migration check failed',
      database: {
        connected: false,
      },
    }, {
      status: 500,
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
}