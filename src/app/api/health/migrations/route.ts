/**
 * Migration health check endpoint
 * Verifies migration system status and database schema integrity
 */

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { MigrationRunner } from '@/lib/migrations/runner';

// Shared MongoDB client for health checks to avoid connection overhead
let cachedClient: MongoClient | null = null;
let connectionPromise: Promise<MongoClient> | null = null;

async function getMongoClient(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI not configured');
  }

  connectionPromise = MongoClient.connect(mongoUri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  cachedClient = await connectionPromise;
  connectionPromise = null;
  
  return cachedClient;
}

export async function GET(_request: NextRequest) {
  try {
    // Use cached/shared connection
    const client = await getMongoClient();

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
  }
  // Note: We don't close the cached client as it's shared across requests
}