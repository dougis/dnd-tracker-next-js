/**
 * Deployment monitoring and alerting system
 * Tracks deployment metrics, health, and sends alerts for issues
 */

export interface DeploymentMetric {
  timestamp: Date;
  environment: string;
  deploymentId: string;
  phase: 'validation' | 'backup' | 'migration' | 'deployment' | 'verification' | 'rollback';
  status: 'started' | 'success' | 'warning' | 'error' | 'failed';
  duration?: number;
  details?: any;
  error?: string;
}

export interface AlertConfig {
  environment: string;
  channels: AlertChannel[];
  thresholds: {
    deploymentDuration: number; // Max deployment time in ms
    migrationDuration: number;  // Max migration time in ms
    errorRate: number;          // Max error rate (0-1)
    consecutiveFailures: number; // Max consecutive failures
  };
  enabled: boolean;
}

export interface AlertChannel {
  type: 'slack' | 'email' | 'webhook' | 'pagerduty';
  config: any;
  enabled: boolean;
}

export interface Alert {
  id: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  environment: string;
  deploymentId?: string;
  metrics?: DeploymentMetric[];
  resolved?: boolean;
  resolvedAt?: Date;
}

/**
 * Deployment monitoring service
 */
export class DeploymentMonitor {
  private metrics: DeploymentMetric[] = [];

  private alerts: Alert[] = [];

  private config: AlertConfig;

  constructor(config: AlertConfig) {
    this.config = config;
  }

  /**
   * Record a deployment metric
   */
  async recordMetric(metric: DeploymentMetric): Promise<void> {
    this.metrics.push(metric);

    // Check for alerting conditions
    await this.checkAlertConditions(metric);

    // Log metric for debugging
    console.log(`📊 Deployment metric recorded:`, {
      phase: metric.phase,
      status: metric.status,
      duration: metric.duration,
      environment: metric.environment,
    });
  }

  /**
   * Check if any alert conditions are met
   */
  private async checkAlertConditions(metric: DeploymentMetric): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    // Check for deployment timeout
    if (metric.duration && metric.phase === 'deployment' && metric.status === 'success') {
      if (metric.duration > this.config.thresholds.deploymentDuration) {
        await this.createAlert({
          severity: 'warning',
          title: 'Slow Deployment Detected',
          message: `Deployment took ${metric.duration}ms, exceeding threshold of ${this.config.thresholds.deploymentDuration}ms`,
          environment: metric.environment,
          deploymentId: metric.deploymentId,
          metrics: [metric],
        });
      }
    }

    // Check for migration timeout
    if (metric.duration && metric.phase === 'migration' && metric.status === 'success') {
      if (metric.duration > this.config.thresholds.migrationDuration) {
        await this.createAlert({
          severity: 'warning',
          title: 'Slow Migration Detected',
          message: `Migration took ${metric.duration}ms, exceeding threshold of ${this.config.thresholds.migrationDuration}ms`,
          environment: metric.environment,
          deploymentId: metric.deploymentId,
          metrics: [metric],
        });
      }
    }

    // Check for failures
    if (metric.status === 'failed' || metric.status === 'error') {
      await this.createAlert({
        severity: metric.phase === 'migration' ? 'critical' : 'error',
        title: `${metric.phase} Failed`,
        message: `${metric.phase} failed: ${metric.error || 'Unknown error'}`,
        environment: metric.environment,
        deploymentId: metric.deploymentId,
        metrics: [metric],
      });
    }

    // Check for consecutive failures
    const recentFailures = this.getRecentMetrics(5)
      .filter(m => m.status === 'failed' || m.status === 'error')
      .length;

    if (recentFailures >= this.config.thresholds.consecutiveFailures) {
      await this.createAlert({
        severity: 'critical',
        title: 'Multiple Consecutive Deployment Failures',
        message: `${recentFailures} consecutive deployment failures detected`,
        environment: metric.environment,
        metrics: this.getRecentMetrics(recentFailures),
      });
    }
  }

  /**
   * Create and send an alert
   */
  private async createAlert(alertData: Omit<Alert, 'id' | 'timestamp'>): Promise<void> {
    const alert: Alert = {
      id: this.generateAlertId(),
      timestamp: new Date(),
      ...alertData,
    };

    this.alerts.push(alert);

    // Send alert through configured channels
    for (const channel of this.config.channels) {
      if (channel.enabled) {
        await this.sendAlert(alert, channel);
      }
    }

    console.log(`🚨 Alert created: ${alert.title} (${alert.severity})`);
  }

  /**
   * Send alert through specific channel
   */
  private async sendAlert(alert: Alert, channel: AlertChannel): Promise<void> {
    try {
      switch (channel.type) {
        case 'slack':
          await this.sendSlackAlert(alert, channel.config);
          break;
        case 'email':
          await this.sendEmailAlert(alert, channel.config);
          break;
        case 'webhook':
          await this.sendWebhookAlert(alert, channel.config);
          break;
        case 'pagerduty':
          await this.sendPagerDutyAlert(alert, channel.config);
          break;
        default:
          console.warn(`Unknown alert channel type: ${channel.type}`);
      }
    } catch (error) {
      console.error(`Failed to send alert through ${channel.type}:`, error);
    }
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(alert: Alert, config: any): Promise<void> {
    const color = this.getSeverityColor(alert.severity);
    const emoji = this.getSeverityEmoji(alert.severity);

    const payload = {
      channel: config.channel || '#deployments',
      username: 'D&D Tracker Deploy Bot',
      icon_emoji: ':robot_face:',
      attachments: [{
        color,
        title: `${emoji} ${alert.title}`,
        text: alert.message,
        fields: [
          {
            title: 'Environment',
            value: alert.environment,
            short: true,
          },
          {
            title: 'Severity',
            value: alert.severity.toUpperCase(),
            short: true,
          },
          {
            title: 'Deployment ID',
            value: alert.deploymentId || 'N/A',
            short: true,
          },
          {
            title: 'Timestamp',
            value: alert.timestamp.toISOString(),
            short: true,
          },
        ],
        footer: 'D&D Tracker Deployment Monitor',
        ts: Math.floor(alert.timestamp.getTime() / 1000),
      }],
    };

    // In a real implementation, this would make an HTTP request to Slack webhook
    console.log('📱 Slack alert sent:', payload);
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(alert: Alert, config: any): Promise<void> {
    const subject = `[${alert.severity.toUpperCase()}] ${alert.title} - ${alert.environment}`;
    const body = this.formatEmailBody(alert);

    // In a real implementation, this would use an email service like SendGrid
    console.log('📧 Email alert sent:', {
      to: config.recipients,
      subject,
      body: body.substring(0, 100) + '...',
    });
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(alert: Alert, config: any): Promise<void> {
    const payload = {
      alert,
      environment: alert.environment,
      timestamp: alert.timestamp.toISOString(),
    };

    // In a real implementation, this would make an HTTP POST request
    console.log('🔗 Webhook alert sent:', {
      url: config.url,
      payload: JSON.stringify(payload).substring(0, 100) + '...',
    });
  }

  /**
   * Send PagerDuty alert
   */
  private async sendPagerDutyAlert(alert: Alert, config: any): Promise<void> {
    const eventAction = alert.severity === 'critical' ? 'trigger' : 'acknowledge';

    const payload = {
      routing_key: config.integrationKey,
      event_action: eventAction,
      dedup_key: `deployment-${alert.environment}-${alert.deploymentId}`,
      payload: {
        summary: alert.title,
        source: 'D&D Tracker Deployment Monitor',
        severity: alert.severity,
        component: 'deployment',
        group: alert.environment,
        custom_details: {
          message: alert.message,
          environment: alert.environment,
          deploymentId: alert.deploymentId,
          metrics: alert.metrics,
        },
      },
    };

    // In a real implementation, this would make an HTTP request to PagerDuty Events API
    console.log('📟 PagerDuty alert sent:', payload);
  }

  /**
   * Get recent metrics
   */
  private getRecentMetrics(count: number): DeploymentMetric[] {
    return this.metrics
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, count);
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get color for severity level
   */
  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'info': return '#36a64f';      // Green
      case 'warning': return '#ff9500';   // Orange
      case 'error': return '#ff4444';     // Red
      case 'critical': return '#8b0000';  // Dark red
      default: return '#cccccc';          // Gray
    }
  }

  /**
   * Get emoji for severity level
   */
  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'critical': return '🚨';
      default: return '📊';
    }
  }

  /**
   * Format email body
   */
  private formatEmailBody(alert: Alert): string {
    return `
Deployment Alert: ${alert.title}

Environment: ${alert.environment}
Severity: ${alert.severity.toUpperCase()}
Timestamp: ${alert.timestamp.toISOString()}
Deployment ID: ${alert.deploymentId || 'N/A'}

Message:
${alert.message}

${alert.metrics && alert.metrics.length > 0 ? `
Recent Metrics:
${alert.metrics.map(m => `- ${m.phase}: ${m.status} (${m.duration || 'N/A'}ms)`).join('\n')}
` : ''}

This alert was generated by the D&D Tracker Deployment Monitor.
    `.trim();
  }

  /**
   * Get deployment statistics
   */
  getDeploymentStats(environment?: string): any {
    const filteredMetrics = environment
      ? this.metrics.filter(m => m.environment === environment)
      : this.metrics;

    const deployments = new Map<string, DeploymentMetric[]>();

    // Group metrics by deployment ID
    for (const metric of filteredMetrics) {
      if (!deployments.has(metric.deploymentId)) {
        deployments.set(metric.deploymentId, []);
      }
      deployments.get(metric.deploymentId)!.push(metric);
    }

    const deploymentCount = deployments.size;
    const successfulDeployments = Array.from(deployments.values())
      .filter(metrics => metrics.some(m => m.status === 'success' && m.phase === 'verification'))
      .length;

    const avgDeploymentTime = this.calculateAverageDeploymentTime(deployments);
    const avgMigrationTime = this.calculateAverageMigrationTime(filteredMetrics);

    return {
      environment: environment || 'all',
      deploymentCount,
      successfulDeployments,
      successRate: deploymentCount > 0 ? successfulDeployments / deploymentCount : 0,
      averageDeploymentTime: avgDeploymentTime,
      averageMigrationTime: avgMigrationTime,
      totalAlerts: this.alerts.filter(a => !environment || a.environment === environment).length,
      activeAlerts: this.alerts.filter(a => (!environment || a.environment === environment) && !a.resolved).length,
      lastDeployment: filteredMetrics.length > 0
        ? filteredMetrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0].timestamp
        : null,
    };
  }

  /**
   * Calculate average deployment time
   */
  private calculateAverageDeploymentTime(deployments: Map<string, DeploymentMetric[]>): number {
    const deploymentTimes: number[] = [];

    for (const metrics of Array.from(deployments.values())) {
      const startMetric = metrics.find(m => m.phase === 'validation' && m.status === 'started');
      const endMetric = metrics.find(m => m.phase === 'verification' && (m.status === 'success' || m.status === 'failed'));

      if (startMetric && endMetric) {
        deploymentTimes.push(endMetric.timestamp.getTime() - startMetric.timestamp.getTime());
      }
    }

    return deploymentTimes.length > 0
      ? deploymentTimes.reduce((sum, time) => sum + time, 0) / deploymentTimes.length
      : 0;
  }

  /**
   * Calculate average migration time
   */
  private calculateAverageMigrationTime(metrics: DeploymentMetric[]): number {
    const migrationMetrics = metrics
      .filter(m => m.phase === 'migration' && m.duration)
      .map(m => m.duration!);

    return migrationMetrics.length > 0
      ? migrationMetrics.reduce((sum, time) => sum + time, 0) / migrationMetrics.length
      : 0;
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, resolution?: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);

    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();

      console.log(`✅ Alert resolved: ${alert.title} (${alertId})`);

      // Optionally send resolution notification
      if (resolution) {
        await this.createAlert({
          severity: 'info',
          title: `Alert Resolved: ${alert.title}`,
          message: `Alert ${alertId} has been resolved: ${resolution}`,
          environment: alert.environment,
        });
      }
    }
  }

  /**
   * Export metrics for external analysis
   */
  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'environment', 'deploymentId', 'phase', 'status', 'duration', 'error'];
      const rows = this.metrics.map(m => [
        m.timestamp.toISOString(),
        m.environment,
        m.deploymentId,
        m.phase,
        m.status,
        m.duration || '',
        m.error || '',
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(this.metrics, null, 2);
  }
}