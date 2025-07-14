# D&D Tracker Deployment Guide

## Overview

This guide provides comprehensive documentation for deploying the D&D Tracker application to Fly.io with integrated MongoDB migrations. The deployment system includes automated pipelines, backup procedures, monitoring, and rollback capabilities.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Configuration](#configuration)
4. [Deployment Process](#deployment-process)
5. [Monitoring and Alerting](#monitoring-and-alerting)
6. [Backup and Recovery](#backup-and-recovery)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)
9. [API Reference](#api-reference)

## Architecture Overview

### Deployment Pipeline

The deployment pipeline consists of the following stages:

1. **Validation**: Pre-deployment checks and environment validation
2. **Backup**: Database backup creation (production/staging only)
3. **Migration**: MongoDB schema migrations execution
4. **Deployment**: Application deployment to Fly.io
5. **Verification**: Post-deployment health checks and validation
6. **Monitoring**: Continuous monitoring and alerting

### Components

- **DeploymentManager**: Core deployment orchestration class
- **Migration System**: MongoDB schema migration management
- **Health Checks**: Multi-tier application health monitoring
- **Monitoring System**: Deployment metrics and alerting
- **Backup System**: Database backup and restoration

## Prerequisites

### Required Tools

- **Node.js**: v18 or higher
- **MongoDB Tools**: `mongodump`, `mongorestore`
- **Fly.io CLI**: `flyctl` installed and authenticated
- **GitHub CLI**: `gh` for pull request management

### Environment Variables

```bash
# Database
MONGODB_URI=mongodb://...
MONGODB_DB_NAME=dnd-tracker

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-app.fly.dev

# Monitoring (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
SMTP_HOST=smtp.example.com
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
PAGERDUTY_INTEGRATION_KEY=your-key

# Deployment
DEPLOY_ENV=staging|production
FLY_API_TOKEN=your-token
```

## Configuration

### Environment-Specific Configuration

The deployment system uses environment-specific configuration files:

- `config/migration.development.json`
- `config/migration.staging.json`
- `config/migration.production.json`
- `config/monitoring.json`

### Fly.io Configuration

- `fly.toml`: Base configuration for staging
- `fly.production.toml`: Production-specific configuration with enhanced safety

### Example Production Configuration

```toml
app = "dnd-tracker-production"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 2

[[http_service.checks]]
  interval = "15s"
  timeout = "5s"
  grace_period = "10s"
  method = "GET"
  path = "/api/health"

[deploy]
  release_command = "npm run migrate:up"
  strategy = "canary"

[[vm]]
  size = "shared-cpu-2x"
  memory = 2048
  cpu_kind = "shared"
```

## Deployment Process

### Manual Deployment

#### Using Scripts

```bash
# Deploy to staging
DEPLOY_ENV=staging ./scripts/deploy-with-migrations.sh

# Deploy to production
DEPLOY_ENV=production ./scripts/deploy-with-migrations.sh

# Dry run (staging)
DEPLOY_ENV=staging DRY_RUN=true ./scripts/deploy-with-migrations.sh
```

#### Using Node.js API

```typescript
import { DeploymentManager } from '@/lib/scripts/deploy';

const deploymentManager = new DeploymentManager({
  environment: 'staging',
  dryRun: false,
  skipMigrations: false,
  timeout: 300000,
});

const result = await deploymentManager.deploy();
console.log('Deployment result:', result);
```

### GitHub Actions Deployment

#### Staging Deployment

Triggered automatically on pushes to `main` branch:

```yaml
name: Deploy to Staging
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Deploy to staging
        run: |
          DEPLOY_ENV=staging ./scripts/deploy-with-migrations.sh
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI_STAGING }}
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

#### Production Deployment

Triggered manually with required approvals:

```yaml
name: Deploy to Production
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to deploy'
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.version }}
      - name: Deploy to production
        run: |
          DEPLOY_ENV=production ./scripts/deploy-with-migrations.sh
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI_PRODUCTION }}
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## Monitoring and Alerting

### Health Check Endpoints

#### `/api/health`

Basic application health check

- Database connectivity
- Application status
- Environment information

#### `/api/health/database`

Comprehensive database health monitoring

- Connection performance
- Query performance
- Collection accessibility
- Migration status

#### `/api/health/migrations`

Migration-specific health validation

- Migration system status
- Pending migrations
- Schema validation

### Monitoring API

#### `/api/monitoring/deployment`

Deployment monitoring and metrics endpoint

**GET Parameters:**

- `environment`: Filter by environment
- `action`: `stats`, `metrics`, `health`
- `format`: `json`, `csv` (for metrics export)

**POST Actions:**

- `metric`: Record deployment metric
- `resolve-alert`: Resolve monitoring alert

### Alert Channels

#### Slack Integration

```json
{
  "type": "slack",
  "config": {
    "webhook": "https://hooks.slack.com/...",
    "channel": "#deployments",
    "username": "D&D Tracker Deploy Bot"
  }
}
```

#### Email Alerts

```json
{
  "type": "email",
  "config": {
    "recipients": ["team@example.com"],
    "from": "alerts@example.com"
  }
}
```

#### PagerDuty Integration

```json
{
  "type": "pagerduty",
  "config": {
    "integrationKey": "your-key",
    "urgency": "high"
  }
}
```

## Backup and Recovery

### Creating Backups

#### Manual Backup

```bash
# Create backup
DEPLOY_ENV=production ./scripts/backup-database.sh

# With custom settings
BACKUP_DIR=/custom/path \
BACKUP_RETENTION_DAYS=30 \
./scripts/backup-database.sh
```

#### Automated Backups

Backups are automatically created during deployments when:

- Environment is `staging` or `production`
- `backupEnabled` configuration is `true`
- Not running in dry-run mode

### Backup Storage

- **Local**: Stored in `/tmp/mongodb-backups` by default
- **Retention**: Configurable per environment (default: 7 days)
- **Compression**: gzip compression enabled by default
- **Verification**: Backup integrity verification included

### Restoration Process

#### From Backup File

```bash
# Restore from specific backup
BACKUP_PATH=/path/to/backup.gz ./scripts/restore-database.sh

# Restore to different database
BACKUP_PATH=/path/to/backup.gz \
TARGET_DB=test-database \
./scripts/restore-database.sh

# Dry run restoration
RESTORE_DRY_RUN=true \
BACKUP_PATH=/path/to/backup.gz \
./scripts/restore-database.sh
```

#### Emergency Restoration

```bash
# Force restore without confirmations
FORCE_RESTORE=true \
BACKUP_PATH=/path/to/backup.gz \
./scripts/restore-database.sh
```

## Rollback Procedures

### Automatic Rollback

Automatic rollback is triggered when:

- Deployment validation fails
- Migration execution fails
- Post-deployment verification fails
- `autoRollback` configuration is enabled

### Manual Rollback

#### Application Rollback

```bash
# Rollback application only
ROLLBACK_TYPE=app ./scripts/rollback-deployment.sh
```

#### Migration Rollback

```bash
# Rollback last migration
ROLLBACK_TYPE=migration ./scripts/rollback-deployment.sh

# Rollback specific number of migrations
ROLLBACK_TYPE=migration \
MIGRATION_STEPS=3 \
./scripts/rollback-deployment.sh
```

#### Database Restoration

```bash
# Restore from backup
ROLLBACK_TYPE=database \
BACKUP_PATH=/path/to/backup.gz \
./scripts/rollback-deployment.sh
```

#### Emergency Rollback

```bash
# Force rollback without confirmations
FORCE_ROLLBACK=true \
ROLLBACK_TYPE=auto \
./scripts/rollback-deployment.sh
```

## Troubleshooting

### Common Issues

#### Deployment Timeout

```bash
# Increase timeout
DEPLOY_TIMEOUT=600000 ./scripts/deploy-with-migrations.sh
```

#### Migration Failures

```bash
# Skip migrations temporarily
SKIP_MIGRATIONS=true ./scripts/deploy-with-migrations.sh

# Validate migrations without executing
npm run migrate:validate
```

#### Health Check Failures

```bash
# Check specific health endpoint
curl -f https://your-app.fly.dev/api/health/database

# Check migration status
curl -f https://your-app.fly.dev/api/health/migrations
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=true ./scripts/deploy-with-migrations.sh

# Dry run for testing
DRY_RUN=true ./scripts/deploy-with-migrations.sh
```

### Log Analysis

#### Deployment Logs

```bash
# View deployment logs
flyctl logs -a your-app-name

# View specific timeframe
flyctl logs -a your-app-name --since 1h
```

#### Monitoring Logs

```bash
# Export deployment metrics
curl "https://your-app.fly.dev/api/monitoring/deployment?action=metrics&format=csv"

# Get deployment statistics
curl "https://your-app.fly.dev/api/monitoring/deployment?action=stats"
```

## API Reference

### Deployment Manager API

#### Constructor Options

```typescript
interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  dryRun?: boolean;
  skipMigrations?: boolean;
  timeout?: number;
  backupEnabled?: boolean;
  requireConfirmation?: boolean;
  autoRollback?: boolean;
}
```

#### Methods

##### `deploy(): Promise<FullDeploymentResult>`

Execute complete deployment pipeline

##### `validatePreDeployment(): Promise<ValidationResult>`

Validate pre-deployment requirements

##### `createBackup(): Promise<BackupResult>`

Create database backup

##### `runMigrations(): Promise<MigrationResult>`

Execute database migrations

##### `deployToFlyio(): Promise<DeploymentResult>`

Deploy application to Fly.io

##### `verifyDeployment(): Promise<VerificationResult>`

Verify deployment success

##### `rollback(options?: RollbackOptions): Promise<RollbackResult>`

Rollback deployment

### Health Check API

#### Basic Health Check

```http
GET /api/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2025-01-12T12:00:00.000Z",
  "environment": "production",
  "version": "1.0.0",
  "database": "connected"
}
```

#### Database Health Check

```http
GET /api/health/database
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2025-01-12T12:00:00.000Z",
  "database": {
    "connected": true,
    "connectionTime": "50ms",
    "queryTime": "25ms",
    "collections": {
      "total": 8,
      "names": ["users", "characters", "encounters"]
    }
  }
}
```

#### Migration Health Check

```http
GET /api/health/migrations
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2025-01-12T12:00:00.000Z",
  "migrations": {
    "total": 5,
    "executed": 5,
    "pending": 0,
    "valid": true
  }
}
```

### Monitoring API

#### Get Deployment Statistics

```http
GET /api/monitoring/deployment?action=stats&environment=production
```

Response:

```json
{
  "success": true,
  "data": {
    "environment": "production",
    "deploymentCount": 25,
    "successfulDeployments": 24,
    "successRate": 0.96,
    "averageDeploymentTime": 180000,
    "averageMigrationTime": 15000,
    "totalAlerts": 3,
    "activeAlerts": 0,
    "lastDeployment": "2025-01-12T10:30:00.000Z"
  }
}
```

#### Record Deployment Metric

```http
POST /api/monitoring/deployment
Content-Type: application/json

{
  "action": "metric",
  "data": {
    "environment": "staging",
    "deploymentId": "deploy-staging-20250112-1200",
    "phase": "deployment",
    "status": "success",
    "duration": 120000
  }
}
```

## Best Practices

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Migration files validated
- [ ] Environment variables configured
- [ ] Backup verification completed
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented

### Production Deployment

- [ ] Deploy to staging first
- [ ] Verify staging deployment
- [ ] Schedule maintenance window
- [ ] Notify stakeholders
- [ ] Monitor deployment metrics
- [ ] Verify all health checks
- [ ] Confirm application functionality

### Security Considerations

- [ ] Environment variables secured
- [ ] Database credentials rotated regularly
- [ ] Backup encryption enabled
- [ ] Access logs monitored
- [ ] Deployment approvals required

### Performance Optimization

- [ ] Migration performance tested
- [ ] Database connections optimized
- [ ] Health check timeouts configured
- [ ] Monitoring thresholds set
- [ ] Resource limits defined

## Support and Maintenance

### Regular Maintenance Tasks

- **Weekly**: Review deployment metrics and alerts
- **Monthly**: Validate backup integrity and restoration procedures
- **Quarterly**: Update deployment configurations and thresholds
- **Annually**: Review and update disaster recovery procedures

### Escalation Procedures

1. **Level 1**: Automatic monitoring alerts
2. **Level 2**: Development team notification
3. **Level 3**: Operations team escalation
4. **Level 4**: Emergency response protocol

### Documentation Updates

Keep this documentation updated when:

- Configuration changes are made
- New environments are added
- Monitoring thresholds are adjusted
- Backup procedures are modified
- Rollback processes are updated
