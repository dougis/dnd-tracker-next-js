# Deployment Quick Reference

## Common Commands

### Deploy to Staging
```bash
DEPLOY_ENV=staging ./scripts/deploy-with-migrations.sh
```

### Deploy to Production
```bash
DEPLOY_ENV=production ./scripts/deploy-with-migrations.sh
```

### Dry Run Deployment
```bash
DRY_RUN=true DEPLOY_ENV=staging ./scripts/deploy-with-migrations.sh
```

### Create Database Backup
```bash
DEPLOY_ENV=production ./scripts/backup-database.sh
```

### Restore Database
```bash
BACKUP_PATH=/path/to/backup.gz ./scripts/restore-database.sh
```

### Rollback Deployment
```bash
# Automatic rollback
ROLLBACK_TYPE=auto ./scripts/rollback-deployment.sh

# Application only
ROLLBACK_TYPE=app ./scripts/rollback-deployment.sh

# Migration rollback
ROLLBACK_TYPE=migration MIGRATION_STEPS=1 ./scripts/rollback-deployment.sh
```

## Health Check URLs

- **Basic Health**: `/api/health`
- **Database Health**: `/api/health/database`
- **Migration Health**: `/api/health/migrations`
- **Monitoring Stats**: `/api/monitoring/deployment?action=stats`

## Environment Variables

### Required
```bash
MONGODB_URI=mongodb://...
MONGODB_DB_NAME=dnd-tracker
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-app.fly.dev
```

### Optional
```bash
DEPLOY_ENV=staging|production
BACKUP_DIR=/custom/backup/path
BACKUP_RETENTION_DAYS=7
DRY_RUN=true|false
FORCE_ROLLBACK=true|false
```

## Configuration Files

- `fly.toml` - Staging Fly.io configuration
- `fly.production.toml` - Production Fly.io configuration
- `config/migration.{env}.json` - Environment-specific migration settings
- `config/monitoring.json` - Monitoring and alerting configuration

## Troubleshooting

### Check Application Logs
```bash
flyctl logs -a dnd-tracker-staging
flyctl logs -a dnd-tracker-production
```

### Validate Migrations
```bash
npm run migrate:validate
npm run migrate:status
```

### Test Health Endpoints
```bash
curl -f https://dnd-tracker-staging.fly.dev/api/health
curl -f https://dnd-tracker-production.fly.dev/api/health/database
```

### Check Deployment Metrics
```bash
curl "https://your-app.fly.dev/api/monitoring/deployment?action=stats&environment=production"
```

## Emergency Procedures

### Emergency Rollback
```bash
FORCE_ROLLBACK=true ROLLBACK_TYPE=auto ./scripts/rollback-deployment.sh
```

### Emergency Database Restore
```bash
FORCE_RESTORE=true BACKUP_PATH=/path/to/backup.gz ./scripts/restore-database.sh
```

### Skip Migrations (Emergency Only)
```bash
SKIP_MIGRATIONS=true DEPLOY_ENV=production ./scripts/deploy-with-migrations.sh
```