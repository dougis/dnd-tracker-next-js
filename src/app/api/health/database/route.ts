/**
 * Database health check endpoint
 * Comprehensive database connectivity and performance monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, mongoose } from '@/lib/db';

export async function GET(_request: NextRequest) {
  try {
    const startTime = Date.now();

    // Connect to database and run basic queries
    await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Database connection not established');
    }

    // Test basic operations
    const connectionTime = Date.now() - startTime;

    // Check collections accessibility
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Test a simple query
    const queryStart = Date.now();
    const users = await db.collection('users').countDocuments();
    const queryTime = Date.now() - queryStart;

    // Check for migration collection
    const hasMigrations = collectionNames.includes('migrations');
    let migrationCount = 0;
    if (hasMigrations) {
      migrationCount = await db.collection('migrations').countDocuments();
    }

    const health: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        connectionTime: `${connectionTime}ms`,
        queryTime: `${queryTime}ms`,
        collections: {
          total: collections.length,
          names: collectionNames.slice(0, 10), // Limit to first 10 for brevity
        },
        migrations: {
          collectionExists: hasMigrations,
          count: migrationCount,
        },
        statistics: {
          users: users,
        },
      },
      performance: {
        connectionTime,
        queryTime,
        status: connectionTime < 1000 && queryTime < 500 ? 'good' : 'slow',
      },
    };

    // Add warnings for performance issues
    if (connectionTime > 2000) {
      health.status = 'warning';
      health.warnings = ['Slow database connection'];
    }

    if (queryTime > 1000) {
      health.status = 'warning';
      health.warnings = [...(health.warnings || []), 'Slow query performance'];
    }

    return NextResponse.json(health, {
      status: health.status === 'ok' ? 200 : 503,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Database check failed',
      database: {
        connected: false,
      },
    }, {
      status: 500,
    });
  }
}