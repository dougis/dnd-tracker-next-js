# Deployment Documentation

This document describes the deployment process for the D&D Tracker application, including the database migrations workflow.

## Overview

The application uses a decoupled deployment strategy where database migrations are handled separately from application deployment through GitHub Actions.

## Database Migrations

### GitHub Actions Migration Workflow

Database migrations are now handled by a dedicated GitHub Actions workflow that runs automatically when changes are pushed to the main branch. This provides better isolation, monitoring, and error handling compared to running migrations during application deployment.

#### Key Features

- **Automatic Migration Detection**: Detects new migration files and skips execution if none are found
- **Backup Creation**: Creates database backups before executing migrations
- **Rollback Capability**: Automatic rollback on failure with backup restore as fallback
- **Dry Run Support**: Supports dry-run mode for testing migrations
- **Health Checks**: Post-migration validation and health checks
- **Notifications**: Slack notifications for migration status

#### Workflow Triggers

The migration workflow is triggered by:
- Push to main branch with changes to migration-related files
- Manual dispatch for emergency migrations
- Changes to:
  - `migrations/**`
  - `src/lib/migrations/**`
  - `src/lib/scripts/migrate.ts`
  - `config/migration.*.json`

#### Required GitHub Secrets

The following secrets must be configured in the GitHub repository:

- `MONGODB_URI_PROD`: Production MongoDB connection string
- `MONGODB_DB_NAME`: Database name for migrations
- `DB_MIGRATION_USER`: Dedicated database user for migrations
- `DB_MIGRATION_PASSWORD`: Password for migration user
- `MIGRATION_ENCRYPTION_KEY`: For sensitive migration data
- `SLACK_WEBHOOK_URL`: For migration status notifications

#### MongoDB Atlas Configuration

1. **Database User Setup**:
   - Create a dedicated user for GitHub Actions migrations
   - Grant `readWrite` and `dbAdmin` roles
   - Restrict to specific IP ranges (GitHub Actions IPs)

2. **Network Access**:
   - Add GitHub Actions IP ranges to Atlas IP whitelist
   - Configure connection limits and timeouts

3. **Security Settings**:
   - Enable authentication
   - Configure SSL/TLS settings
   - Set up monitoring and alerting

### Migration Commands

#### Local Development

```bash
# Check migration status
npm run migrate:status

# Run pending migrations
npm run migrate:up

# Rollback migrations
npm run migrate:down [steps]

# Create new migration
npm run migrate:create "Description of migration"

# Validate migration files
npm run migrate:validate
```

#### GitHub Actions

```bash
# GitHub Actions migration script
npm run migrate:github-actions [command]

# Available commands:
# - detect_new_migrations
# - create_backup
# - dry_run_migrations
# - execute_migrations
# - rollback_migrations
# - health_check
```

### Manual Migration Execution

For emergency situations, migrations can be triggered manually:

1. Go to the GitHub Actions tab
2. Select the "Database Migrations" workflow
3. Click "Run workflow"
4. Choose options:
   - **migration_steps**: Number of migrations to run (default: all)
   - **dry_run**: Run in dry-run mode (default: false)

### Monitoring and Troubleshooting

#### Migration Logs

All migration logs are available in the GitHub Actions workflow run. Each step provides detailed output including:
- Migration detection results
- Backup creation status
- Migration execution progress
- Health check results
- Error details and stack traces

#### Common Issues

1. **Connection Timeouts**: Check MongoDB Atlas IP whitelist and connection limits
2. **Permission Errors**: Verify database user roles and permissions
3. **Backup Failures**: Ensure sufficient disk space and proper credentials
4. **Migration Syntax Errors**: Run `npm run migrate:validate` locally first

#### Rollback Procedures

1. **Automatic Rollback**: Failed migrations trigger automatic rollback
2. **Manual Rollback**: Use the GitHub Actions workflow with rollback command
3. **Backup Restore**: As last resort, restore from the pre-migration backup

### Security Considerations

- All migration credentials are stored as GitHub Secrets
- Database backups are created with encryption
- Migration user has minimal required permissions
- Audit logging is enabled for all migration operations
- Network access is restricted to GitHub Actions IP ranges

### Best Practices

1. **Always Test Locally**: Run migrations in development environment first
2. **Use Dry Run**: Test migrations with dry-run mode before production
3. **Monitor Execution**: Check GitHub Actions logs for migration progress
4. **Backup Verification**: Ensure backups are created successfully
5. **Rollback Testing**: Test rollback procedures in staging environment

## Application Deployment

Application deployment to Fly.io is now separate from database migrations. The deployment process focuses solely on deploying the application code without migration concerns.

### Deployment Process

1. **GitHub Actions Migration**: Runs automatically on push to main
2. **Application Deployment**: Deploys to Fly.io after successful migrations
3. **Health Checks**: Validates both database and application health
4. **Notifications**: Status updates via Slack and email

For detailed deployment instructions, see the [Fly.io Deployment Guide](./flyio-deployment.md).

## Configuration Files

- `.github/workflows/db-migrations.yml`: GitHub Actions migration workflow
- `config/migration.github-actions.json`: GitHub Actions migration configuration
- `scripts/gh-actions-migration.sh`: GitHub Actions migration script
- `scripts/deploy-with-migrations.sh`: Legacy deployment script (migrations removed)

## Migration History

All migration records are stored in the `migrations` collection in MongoDB. Each record includes:
- Version timestamp
- Description
- Execution time
- Git commit hash
- Rollback availability

## Support

For migration-related issues:
1. Check GitHub Actions workflow logs
2. Review MongoDB Atlas metrics
3. Verify GitHub Secrets configuration
4. Contact the development team for assistance