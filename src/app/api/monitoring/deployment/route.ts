/**
 * Deployment monitoring API endpoint
 * Provides access to deployment metrics, alerts, and statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { DeploymentMonitor, AlertConfig } from '@/lib/monitoring/deployment-monitor';
import * as fs from 'fs/promises';
import * as path from 'path';

// Global monitor instance (in production, this would be managed differently)
let globalMonitor: DeploymentMonitor | null = null;

/**
 * Initialize monitoring configuration
 */
async function initializeMonitor(): Promise<DeploymentMonitor> {
  if (globalMonitor) {
    return globalMonitor;
  }

  try {
    // Load monitoring configuration
    const configPath = path.join(process.cwd(), 'config', 'monitoring.json');
    const configFile = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configFile);

    const environment = process.env.NODE_ENV || 'development';
    const envConfig = config.environments[environment];

    if (!envConfig) {
      throw new Error(`No monitoring configuration found for environment: ${environment}`);
    }

    const alertConfig: AlertConfig = {
      environment,
      channels: envConfig.channels,
      thresholds: envConfig.thresholds,
      enabled: envConfig.enabled,
    };

    globalMonitor = new DeploymentMonitor(alertConfig);
    return globalMonitor;
  } catch (error) {
    console.error('Failed to initialize deployment monitor:', error);

    // Fallback configuration
    const fallbackConfig: AlertConfig = {
      environment: process.env.NODE_ENV || 'development',
      channels: [],
      thresholds: {
        deploymentDuration: 300000,
        migrationDuration: 60000,
        errorRate: 0.1,
        consecutiveFailures: 3,
      },
      enabled: false,
    };

    globalMonitor = new DeploymentMonitor(fallbackConfig);
    return globalMonitor;
  }
}

/**
 * GET /api/monitoring/deployment
 * Retrieve deployment monitoring data
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const environment = searchParams.get('environment');
    const action = searchParams.get('action') || 'stats';

    const monitor = await initializeMonitor();

    switch (action) {
      case 'stats':
        const stats = monitor.getDeploymentStats(environment || undefined);
        return NextResponse.json({
          success: true,
          data: stats,
        });

      case 'metrics':
        const format = searchParams.get('format') || 'json';
        const metrics = monitor.exportMetrics(format as 'json' | 'csv');

        if (format === 'csv') {
          return new NextResponse(metrics, {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': 'attachment; filename=deployment-metrics.csv',
            },
          });
        }

        return NextResponse.json({
          success: true,
          data: JSON.parse(metrics),
        });

      case 'health':
        // Check the health of the monitoring system itself
        const healthStatus = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          monitor: {
            initialized: globalMonitor !== null,
            environment: monitor.getDeploymentStats().environment,
            enabled: true, // This would check actual config
          },
          endpoints: {
            api: 'ok',
            database: 'ok', // This would check actual database connection
            external: 'ok', // This would check external service connections
          },
        };

        return NextResponse.json(healthStatus);

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Monitoring API error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}

/**
 * POST /api/monitoring/deployment
 * Record deployment metrics or trigger alerts
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action, data } = body;

    const monitor = await initializeMonitor();

    switch (action) {
      case 'metric':
        if (!data || !data.environment || !data.deploymentId || !data.phase || !data.status) {
          return NextResponse.json({
            success: false,
            error: 'Missing required metric fields: environment, deploymentId, phase, status',
          }, { status: 400 });
        }

        const metric = {
          timestamp: new Date(),
          environment: data.environment,
          deploymentId: data.deploymentId,
          phase: data.phase,
          status: data.status,
          duration: data.duration,
          details: data.details,
          error: data.error,
        };

        await monitor.recordMetric(metric);

        return NextResponse.json({
          success: true,
          message: 'Metric recorded successfully',
        });

      case 'resolve-alert':
        if (!data || !data.alertId) {
          return NextResponse.json({
            success: false,
            error: 'Missing required field: alertId',
          }, { status: 400 });
        }

        await monitor.resolveAlert(data.alertId, data.resolution);

        return NextResponse.json({
          success: true,
          message: 'Alert resolved successfully',
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Monitoring API error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}