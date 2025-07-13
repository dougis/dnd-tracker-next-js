# Operational Runbook: D&D Tracker Deployment System

## Overview

This runbook provides step-by-step procedures for operating the D&D Tracker deployment system, including routine operations, incident response, and maintenance procedures.

## Routine Operations

### Daily Checks

#### Morning Health Check (5 minutes)

1. **Check Application Health**

   ```bash
   curl -f https://dnd-tracker-production.fly.dev/api/health
   curl -f https://dnd-tracker-staging.fly.dev/api/health
   ```

2. **Verify Database Connectivity**

   ```bash
   curl -f https://dnd-tracker-production.fly.dev/api/health/database
   ```

3. **Check Migration Status**

   ```bash
   curl -f https://dnd-tracker-production.fly.dev/api/health/migrations
   ```

4. **Review Deployment Metrics**

   ```bash
   curl "https://dnd-tracker-production.fly.dev/api/monitoring/deployment?action=stats"
   ```

#### Response to Issues

- **Health Check Failures**: Proceed to [Incident Response](#incident-response)
- **Database Issues**: Check [Database Troubleshooting](#database-troubleshooting)
- **Migration Issues**: Check [Migration Troubleshooting](#migration-troubleshooting)

### Weekly Operations

#### Backup Verification (15 minutes)

1. **Create Test Backup**

   ```bash
   DEPLOY_ENV=staging ./scripts/backup-database.sh
   ```

2. **Verify Backup Integrity**

   ```bash
   # Check backup was created
   ls -la /tmp/mongodb-backups/

   # Test restoration (dry run)
   RESTORE_DRY_RUN=true \
   BACKUP_PATH=/tmp/mongodb-backups/backup-staging-latest.gz \
   ./scripts/restore-database.sh
   ```

3. **Clean Up Test Files**

   ```bash
   rm /tmp/mongodb-backups/backup-staging-*
   ```

#### Deployment Metrics Review (10 minutes)

1. **Export Weekly Metrics**

   ```bash
   curl "https://dnd-tracker-production.fly.dev/api/monitoring/deployment?action=metrics&format=csv" > weekly-metrics.csv
   ```

2. **Review Key Metrics**
   - Success rate (target: >95%)
   - Average deployment time (target: <5 minutes)
   - Alert count (target: <5 per week)

3. **Document Issues**
   - Create GitHub issues for recurring problems
   - Update configuration if thresholds need adjustment

### Monthly Operations

#### Security Review (30 minutes)

1. **Rotate API Keys**
   - Update Fly.io API tokens
   - Refresh database credentials
   - Update monitoring service keys

2. **Review Access Logs**

   ```bash
   flyctl logs -a dnd-tracker-production --since 30d | grep -i "error\|warn\|fail"
   ```

3. **Update Dependencies**

   ```bash
   npm audit
   npm update
   npm run test
   ```

#### Configuration Audit (20 minutes)

1. **Review Environment Variables**
   - Verify all required variables are set
   - Check for deprecated settings
   - Update staging to match production

2. **Validate Configuration Files**

   ```bash
   # Validate JSON syntax
   jq empty config/migration.production.json
   jq empty config/monitoring.json
   ```

3. **Test Backup Restoration**

   ```bash
   # Full restoration test on staging
   BACKUP_PATH=/path/to/production-backup.gz \
   TARGET_DB=staging-restore-test \
   ./scripts/restore-database.sh
   ```

## Incident Response

### Deployment Failure

#### Severity: High

**Time to Resolution Target: 15 minutes**

#### Immediate Response (0-5 minutes)

1. **Check Current Status**

   ```bash
   flyctl status -a dnd-tracker-production
   curl -f https://dnd-tracker-production.fly.dev/api/health
   ```

2. **Identify Failure Point**

   ```bash
   # Check deployment logs
   flyctl logs -a dnd-tracker-production --since 1h

   # Check monitoring for recent failures
   curl "https://dnd-tracker-production.fly.dev/api/monitoring/deployment?action=stats"
   ```

3. **Determine Impact**
   - Is the application responsive?
   - Are users affected?
   - What functionality is impacted?

#### Escalation Decision (5 minutes)

- **High Impact**: Proceed with immediate rollback
- **Low Impact**: Investigate root cause first

#### Immediate Rollback (5-15 minutes)

1. **Execute Automatic Rollback**

   ```bash
   ROLLBACK_TYPE=auto ./scripts/rollback-deployment.sh
   ```

2. **Verify Rollback Success**

   ```bash
   curl -f https://dnd-tracker-production.fly.dev/api/health
   flyctl status -a dnd-tracker-production
   ```

3. **Notify Stakeholders**
   - Update status page
   - Notify team in Slack
   - Document incident

#### Post-Incident (Within 24 hours)

1. **Root Cause Analysis**
   - Review deployment logs
   - Identify failure cause
   - Create improvement plan

2. **Documentation**
   - Update runbook if needed
   - Create post-mortem document
   - Update prevention measures

### Database Issues

#### Severity: Critical

**Time to Resolution Target: 30 minutes**

#### Connection Failures (0-10 minutes)

1. **Check Database Status**

   ```bash
   curl -f https://dnd-tracker-production.fly.dev/api/health/database
   ```

2. **Verify Connection String**

   ```bash
   # Test connection directly
   mongo "$MONGODB_URI" --eval "db.runCommand('ping')"
   ```

3. **Check Resource Usage**

   ```bash
   # Monitor database metrics
   flyctl metrics -a dnd-tracker-production
   ```

#### Data Corruption (10-30 minutes)

1. **Stop Application**

   ```bash
   flyctl scale count 0 -a dnd-tracker-production
   ```

2. **Create Emergency Backup**

   ```bash
   DEPLOY_ENV=production ./scripts/backup-database.sh
   ```

3. **Restore from Latest Good Backup**

   ```bash
   FORCE_RESTORE=true \
   BACKUP_PATH=/path/to/last-good-backup.gz \
   ./scripts/restore-database.sh
   ```

4. **Restart Application**

   ```bash
   flyctl scale count 2 -a dnd-tracker-production
   ```

### Migration Failures

#### Severity: High

**Time to Resolution Target: 20 minutes**

#### Migration Stuck (0-10 minutes)

1. **Check Migration Status**

   ```bash
   npm run migrate:status
   curl -f https://dnd-tracker-production.fly.dev/api/health/migrations
   ```

2. **Identify Stuck Migration**

   ```bash
   # Check database directly
   mongo "$MONGODB_URI/dnd-tracker" --eval "db.migrations.find().sort({executedAt: -1})"
   ```

3. **Force Migration Reset** (if safe)

   ```bash
   # Rollback problematic migration
   ROLLBACK_TYPE=migration MIGRATION_STEPS=1 ./scripts/rollback-deployment.sh
   ```

#### Migration Data Loss (10-20 minutes)

1. **Immediate Application Stop**

   ```bash
   flyctl scale count 0 -a dnd-tracker-production
   ```

2. **Restore Pre-Migration Backup**

   ```bash
   FORCE_RESTORE=true \
   BACKUP_PATH=/path/to/pre-migration-backup.gz \
   ./scripts/restore-database.sh
   ```

3. **Fix Migration Script**
   - Identify and fix migration issue
   - Test on staging environment
   - Deploy corrected version

## Maintenance Procedures

### Planned Maintenance Window

#### Preparation (1 hour before)

1. **Notify Users**
   - Update status page
   - Send notification emails
   - Post in application

2. **Create Maintenance Backup**

   ```bash
   DEPLOY_ENV=production ./scripts/backup-database.sh
   ```

3. **Verify Team Availability**
   - On-call engineer ready
   - Rollback plan confirmed
   - Communication channels open

#### During Maintenance

1. **Enable Maintenance Mode**

   ```bash
   # Deploy maintenance page
   flyctl deploy --build-arg MAINTENANCE_MODE=true
   ```

2. **Perform Updates**

   ```bash
   DEPLOY_ENV=production ./scripts/deploy-with-migrations.sh
   ```

3. **Verify Deployment**

   ```bash
   # Run full health check suite
   curl -f https://dnd-tracker-production.fly.dev/api/health
   curl -f https://dnd-tracker-production.fly.dev/api/health/database
   curl -f https://dnd-tracker-production.fly.dev/api/health/migrations
   ```

4. **Disable Maintenance Mode**

   ```bash
   flyctl deploy
   ```

#### Post-Maintenance

1. **Monitor for Issues**
   - Watch error rates for 1 hour
   - Check user feedback
   - Monitor performance metrics

2. **Update Documentation**
   - Record changes made
   - Update configuration docs
   - Note any issues encountered

### Database Maintenance

#### Index Optimization (Monthly)

1. **Analyze Index Usage**

   ```bash
   mongo "$MONGODB_URI/dnd-tracker" --eval "
     db.users.getIndexes();
     db.characters.getIndexes();
     db.encounters.getIndexes();
   "
   ```

2. **Rebuild Indexes if Needed**

   ```bash
   mongo "$MONGODB_URI/dnd-tracker" --eval "
     db.users.reIndex();
     db.characters.reIndex();
     db.encounters.reIndex();
   "
   ```

#### Backup Cleanup (Weekly)

1. **Review Backup Storage**

   ```bash
   ls -la /tmp/mongodb-backups/
   du -sh /tmp/mongodb-backups/
   ```

2. **Clean Old Backups**

   ```bash
   # Remove backups older than retention period
   find /tmp/mongodb-backups/ -name "backup-*" -mtime +7 -delete
   ```

## Monitoring and Alerting

### Alert Response Procedures

#### Deployment Timeout Alert

1. **Check Current Status**

   ```bash
   flyctl status -a dnd-tracker-production
   ```

2. **Review Deployment Logs**

   ```bash
   flyctl logs -a dnd-tracker-production --since 1h
   ```

3. **Cancel if Necessary**

   ```bash
   # If deployment is truly stuck
   ROLLBACK_TYPE=app ./scripts/rollback-deployment.sh
   ```

#### High Error Rate Alert

1. **Identify Error Source**

   ```bash
   flyctl logs -a dnd-tracker-production --since 15m | grep -i error
   ```

2. **Check Application Health**

   ```bash
   curl -f https://dnd-tracker-production.fly.dev/api/health
   ```

3. **Scale if Needed**

   ```bash
   # Temporarily increase capacity
   flyctl scale count 4 -a dnd-tracker-production
   ```

#### Database Performance Alert

1. **Check Connection Pool**

   ```bash
   curl -f https://dnd-tracker-production.fly.dev/api/health/database
   ```

2. **Monitor Query Performance**

   ```bash
   # Check slow queries in database
   mongo "$MONGODB_URI/dnd-tracker" --eval "db.runCommand({profile: 2, slowms: 100})"
   ```

3. **Scale Database if Needed**
   - Contact database provider
   - Increase connection limits
   - Optimize queries

## Contact Information

### Escalation Contacts

- **Primary On-Call**: [Phone/Slack]
- **Secondary On-Call**: [Phone/Slack]
- **Database Admin**: [Contact Info]
- **Infrastructure Team**: [Contact Info]

### External Services

- **Fly.io Support**: [Support Details]
- **MongoDB Atlas**: [Support Details]
- **Monitoring Service**: [Support Details]

## Documentation Updates

This runbook should be updated:

- After each incident (within 48 hours)
- When procedures change
- During quarterly reviews
- When new team members join

**Last Updated**: [Date]
**Next Review**: [Date]
