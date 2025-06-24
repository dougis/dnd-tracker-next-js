import { NextResponse } from 'next/server';
import { checkDatabaseHealth, validateDatabaseConfig } from '@/lib/db-utils';

/**
 * Database Health Check API Endpoint
 * GET /api/health/db
 *
 * Returns the current status of the database connection
 */
export async function GET() {
  try {
    // First validate configuration
    const configValidation = validateDatabaseConfig();

    if (!configValidation.isValid) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          connected: false,
          timestamp: new Date().toISOString(),
          error: `Missing required environment variables: ${configValidation.missingVars.join(', ')}`,
        },
        { status: 500 }
      );
    }

    // Perform health check
    const healthCheck = await checkDatabaseHealth();

    // Return appropriate HTTP status based on health
    const httpStatus = healthCheck.status === 'healthy' ? 200 : 503;

    return NextResponse.json(healthCheck, { status: httpStatus });
  } catch (error) {
    console.error('Database health check endpoint error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        connected: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
