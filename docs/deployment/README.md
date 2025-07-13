# D&D Tracker Deployment Documentation

This directory contains comprehensive documentation for the D&D Tracker deployment system, including setup, operations, monitoring, and troubleshooting procedures.

## Documentation Overview

### 📚 Core Documentation

#### [Deployment Guide](./DEPLOYMENT_GUIDE.md)

Comprehensive guide covering all aspects of the deployment system:

- Architecture overview and components
- Prerequisites and configuration
- Step-by-step deployment procedures
- Monitoring and alerting setup
- Backup and recovery procedures
- API reference and examples

#### [Quick Reference](./QUICK_REFERENCE.md)
Essential commands and URLs for daily operations:
- Common deployment commands
- Health check endpoints
- Environment variables
- Emergency procedures

#### [Operational Runbook](./OPERATIONAL_RUNBOOK.md)
Detailed operational procedures for:
- Daily, weekly, and monthly maintenance
- Incident response protocols
- Troubleshooting procedures
- Emergency contact information

## Quick Start

### First Time Setup

1. **Install Prerequisites**
   ```bash
   # Install required tools
   npm install -g flyctl
   brew install mongodb/brew/mongodb-community-tools
   ```

2. **Configure Environment**
   ```bash
   # Set required environment variables
   export MONGODB_URI="mongodb://..."
   export MONGODB_DB_NAME="dnd-tracker"
   export NEXTAUTH_SECRET="your-secret"
   export FLY_API_TOKEN="your-token"
   ```

3. **Deploy to Staging**
   ```bash
   DEPLOY_ENV=staging ./scripts/deploy-with-migrations.sh
   ```

### Common Operations

```bash
# Deploy to production
DEPLOY_ENV=production ./scripts/deploy-with-migrations.sh

# Create backup
DEPLOY_ENV=production ./scripts/backup-database.sh

# Check health
curl -f https://dnd-tracker-production.fly.dev/api/health

# Emergency rollback
ROLLBACK_TYPE=auto ./scripts/rollback-deployment.sh
```

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Actions   │────│  DeploymentManager  │────│    Fly.io App      │
│   CI/CD Pipeline    │    │   Orchestration     │    │   Next.js Server   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                │                        │
                       ┌─────────────────┐    ┌─────────────────┐
                       │  MongoDB Atlas  │    │  Health Checks  │
                       │   Database      │    │   Monitoring    │
                       └─────────────────┘    └─────────────────┘
                                │                        │
                                │                        │
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Backup System   │    │ Alert System    │
                       │ Scripts & Hooks │    │ Slack/Email/PD  │
                       └─────────────────┘    └─────────────────┘
```

## Key Features

### 🚀 Automated Deployment Pipeline
- Pre-deployment validation
- Automated database migrations
- Health check verification
- Automatic rollback on failure

### 🛡️ Safety Mechanisms
- Environment-specific configurations
- Database backup before migrations
- Multiple rollback strategies
- Dry-run mode for testing

### 📊 Comprehensive Monitoring

- Real-time deployment metrics
- Multi-tier health checks
- Configurable alerting
- Performance tracking

### 🔄 Backup & Recovery
- Automated backup creation
- Integrity verification
- Point-in-time restoration
- Emergency recovery procedures

## File Structure

```
docs/deployment/
├── README.md              # This file - overview and index
├── DEPLOYMENT_GUIDE.md    # Comprehensive deployment guide
├── QUICK_REFERENCE.md     # Quick command reference
└── OPERATIONAL_RUNBOOK.md # Operational procedures

scripts/
├── deploy-with-migrations.sh    # Main deployment script
├── backup-database.sh           # Database backup utility
├── restore-database.sh          # Database restoration utility
└── rollback-deployment.sh       # Rollback automation

config/
├── migration.development.json   # Development migration config
├── migration.staging.json       # Staging migration config
├── migration.production.json    # Production migration config
└── monitoring.json              # Monitoring configuration

src/lib/
├── scripts/
│   └── deploy.ts                # DeploymentManager class
├── monitoring/
│   └── deployment-monitor.ts    # Monitoring system
└── migrations/
    └── runner.ts                # Migration execution

.github/workflows/
├── deploy-staging.yml           # Staging deployment workflow
└── deploy-production.yml        # Production deployment workflow

fly.toml                         # Staging Fly.io configuration
fly.production.toml              # Production Fly.io configuration
```

## Security Considerations

### Environment Variables

- All secrets stored as GitHub secrets
- Environment-specific variable isolation
- Regular credential rotation procedures

### Access Control
- GitHub branch protection enabled
- Required reviews for production deployments
- Audit logging for all deployment actions

### Data Protection
- Encrypted backups
- Secure transmission protocols
- Database access restrictions

## Performance Metrics

### Deployment Targets

- **Staging**: < 3 minutes end-to-end
- **Production**: < 5 minutes end-to-end
- **Success Rate**: > 95%
- **Rollback Time**: < 2 minutes

### Monitoring Thresholds
- **Health Check**: 15-second intervals
- **Alert Response**: < 5 minutes
- **Error Rate**: < 1% for production

## Support and Maintenance

### Regular Tasks
- **Daily**: Health check verification
- **Weekly**: Backup integrity testing
- **Monthly**: Security review and dependency updates
- **Quarterly**: Documentation review and update

### Incident Response
1. **Level 1**: Automated monitoring alerts
2. **Level 2**: Development team notification
3. **Level 3**: Operations escalation
4. **Level 4**: Emergency response protocol

## Contributing

### Documentation Updates
1. Update relevant documentation files
2. Test procedures on staging environment
3. Submit pull request with changes
4. Ensure team review and approval

### Procedure Changes
1. Document current state
2. Test new procedures thoroughly
3. Update all relevant documentation
4. Train team on changes
5. Monitor implementation closely

## Additional Resources

### External Documentation
- [Fly.io Documentation](https://fly.io/docs/)
- [MongoDB Migration Guide](https://docs.mongodb.com/manual/core/schema-validation/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

### Internal Resources

- [Project README](../../README.md)
- [Migration Documentation](../migrations/)
- [API Documentation](../api/)

### Team Resources

- Slack: `#deployments` channel
- GitHub: Issues and Pull Requests
- Monitoring: Deployment dashboard
- Alerts: PagerDuty/Slack notifications

---

**Last Updated**: 2025-01-12
**Next Review**: 2025-04-12
**Maintained By**: Development Team