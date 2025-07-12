/**
 * Health check endpoint for application monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(_request: NextRequest) {
  try {
    // Basic health check
    const health: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || 'unknown',
    };

    // Test database connection
    try {
      await connectToDatabase();
      health.database = 'connected';
    } catch {
      health.database = 'error';
      health.status = 'degraded';
    }

    return NextResponse.json(health, {
      status: health.status === 'ok' ? 200 : 503,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, {
      status: 500,
    });
  }
}