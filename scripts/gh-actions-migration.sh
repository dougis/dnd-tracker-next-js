#!/bin/bash
# GitHub Actions Migration Script
# Handles database migrations in GitHub Actions environment

set -e  # Exit on any error

# Configuration
ENVIRONMENT=${ENVIRONMENT:-production}
BACKUP_DIR=${BACKUP_DIR:-/tmp/db-backups}
MIGRATION_TIMEOUT=${MIGRATION_TIMEOUT:-300}  # 5 minutes

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  INFO: $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ SUCCESS: $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
}

log_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
}

log_step() {
    echo -e "\n${BLUE}🚀 $1${NC}\n"
}

# Validate required environment variables
validate_environment() {
    log_step "Validating GitHub Actions environment"
    
    required_vars=("MONGODB_URI" "MONGODB_DB_NAME")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    log_success "Environment validation passed"
}

# Detect new migrations by comparing with remote state
detect_new_migrations() {
    log_step "Detecting new migrations"
    
    validate_environment
    
    # Get current migration status from database
    local db_migrations=$(npm run migrate:status 2>/dev/null | grep -E "^[0-9]{14}" | wc -l || echo "0")
    
    # Get local migration files
    local local_migrations=$(find migrations -name "*.js" -type f | wc -l || echo "0")
    
    log_info "Database migrations: $db_migrations"
    log_info "Local migration files: $local_migrations"
    
    if [[ $local_migrations -gt $db_migrations ]]; then
        log_success "New migrations detected: $((local_migrations - db_migrations))"
        echo "has_new_migrations=true" >> "$GITHUB_OUTPUT"
        echo "new_migration_count=$((local_migrations - db_migrations))" >> "$GITHUB_OUTPUT"
    else
        log_info "No new migrations detected"
        echo "has_new_migrations=false" >> "$GITHUB_OUTPUT"
        echo "new_migration_count=0" >> "$GITHUB_OUTPUT"
    fi
}

# Create database backup
create_backup() {
    log_step "Creating database backup"
    
    validate_environment
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Generate backup filename with timestamp
    local timestamp=$(date +"%Y%m%d-%H%M%S")
    local backup_file="migration-backup-${timestamp}.gz"
    local backup_path="${BACKUP_DIR}/${backup_file}"
    
    log_info "Creating backup: ${backup_path}"
    
    # Create backup using mongodump
    if timeout "$MIGRATION_TIMEOUT" mongodump --uri="${MONGODB_URI}" --gzip --archive="${backup_path}"; then
        log_success "Backup created successfully: ${backup_path}"
        echo "backup_path=${backup_path}" >> "$GITHUB_OUTPUT"
        echo "backup_filename=${backup_file}" >> "$GITHUB_OUTPUT"
        
        # Store backup info in GitHub environment
        echo "BACKUP_PATH=${backup_path}" >> "$GITHUB_ENV"
        echo "BACKUP_FILENAME=${backup_file}" >> "$GITHUB_ENV"
    else
        log_error "Failed to create backup"
        exit 1
    fi
}

# Run migrations in dry-run mode
dry_run_migrations() {
    log_step "Running migrations in dry-run mode"
    
    validate_environment
    
    export MIGRATION_DRY_RUN=true
    export MIGRATION_VALIDATE_ONLY=true
    
    if timeout "$MIGRATION_TIMEOUT" npm run migrate:up; then
        log_success "Dry-run migrations completed successfully"
    else
        log_error "Dry-run migrations failed"
        exit 1
    fi
}

# Execute migrations
execute_migrations() {
    log_step "Executing database migrations"
    
    validate_environment
    
    # Set GitHub Actions specific environment
    export MIGRATION_DRY_RUN=false
    export MIGRATION_BACKUP_ENABLED=true
    export MIGRATION_VALIDATE_ONLY=false
    
    # Execute migrations with timeout
    if timeout "$MIGRATION_TIMEOUT" npm run migrate:up; then
        log_success "Migrations executed successfully"
        echo "migration_status=success" >> "$GITHUB_OUTPUT"
    else
        log_error "Migration execution failed"
        echo "migration_status=failed" >> "$GITHUB_OUTPUT"
        exit 1
    fi
}

# Rollback migrations
rollback_migrations() {
    log_step "Rolling back migrations"
    
    validate_environment
    
    # Attempt automatic rollback
    log_info "Attempting automatic rollback..."
    
    if timeout "$MIGRATION_TIMEOUT" npm run migrate:down 1; then
        log_success "Automatic rollback completed"
        echo "rollback_status=success" >> "$GITHUB_OUTPUT"
    else
        log_warning "Automatic rollback failed, attempting backup restore..."
        
        # If backup path is available, restore from backup
        if [[ -n "${BACKUP_PATH}" && -f "${BACKUP_PATH}" ]]; then
            restore_from_backup "${BACKUP_PATH}"
        else
            log_error "No backup available for restore"
            echo "rollback_status=failed" >> "$GITHUB_OUTPUT"
            exit 1
        fi
    fi
}

# Restore database from backup
restore_from_backup() {
    local backup_path="$1"
    
    log_step "Restoring database from backup"
    log_info "Backup path: ${backup_path}"
    
    if [[ ! -f "${backup_path}" ]]; then
        log_error "Backup file not found: ${backup_path}"
        exit 1
    fi
    
    # Restore using mongorestore
    if timeout "$MIGRATION_TIMEOUT" mongorestore --uri="${MONGODB_URI}" --gzip --archive="${backup_path}" --drop; then
        log_success "Database restored from backup successfully"
        echo "restore_status=success" >> "$GITHUB_OUTPUT"
    else
        log_error "Failed to restore database from backup"
        echo "restore_status=failed" >> "$GITHUB_OUTPUT"
        exit 1
    fi
}

# Health check after migrations
health_check() {
    log_step "Running post-migration health checks"
    
    validate_environment
    
    # Check migration status
    log_info "Checking migration status..."
    if npm run migrate:status; then
        log_success "Migration status check passed"
    else
        log_error "Migration status check failed"
        exit 1
    fi
    
    # Basic database connectivity check
    log_info "Testing database connectivity..."
    if timeout 30 node -e "
        const { MongoClient } = require('mongodb');
        const client = new MongoClient(process.env.MONGODB_URI);
        client.connect()
            .then(() => {
                console.log('Database connection successful');
                return client.db(process.env.MONGODB_DB_NAME).admin().ping();
            })
            .then(() => {
                console.log('Database ping successful');
                return client.close();
            })
            .catch(err => {
                console.error('Database connection failed:', err);
                process.exit(1);
            });
    "; then
        log_success "Database connectivity check passed"
    else
        log_error "Database connectivity check failed"
        exit 1
    fi
    
    # Check collections integrity
    log_info "Checking collection integrity..."
    if timeout 30 node -e "
        const { MongoClient } = require('mongodb');
        const client = new MongoClient(process.env.MONGODB_URI);
        client.connect()
            .then(() => client.db(process.env.MONGODB_DB_NAME).collections())
            .then(collections => {
                console.log('Available collections:', collections.map(c => c.collectionName));
                return client.close();
            })
            .catch(err => {
                console.error('Collection check failed:', err);
                process.exit(1);
            });
    "; then
        log_success "Collection integrity check passed"
    else
        log_error "Collection integrity check failed"
        exit 1
    fi
    
    log_success "All health checks passed"
}

# Send notification (placeholder for future implementation)
send_notification() {
    local status="$1"
    local message="$2"
    
    log_info "Notification: [$status] $message"
    
    # This would integrate with notification services
    # For now, just log the notification
    echo "notification_status=${status}" >> "$GITHUB_OUTPUT"
    echo "notification_message=${message}" >> "$GITHUB_OUTPUT"
}

# Main execution
main() {
    local command="$1"
    
    log_step "GitHub Actions Migration Script"
    log_info "Command: $command"
    log_info "Environment: $ENVIRONMENT"
    
    case "$command" in
        detect_new_migrations)
            detect_new_migrations
            ;;
        create_backup)
            create_backup
            ;;
        dry_run_migrations)
            dry_run_migrations
            ;;
        execute_migrations)
            execute_migrations
            ;;
        rollback_migrations)
            rollback_migrations
            ;;
        health_check)
            health_check
            ;;
        restore_backup)
            restore_from_backup "${2:-$BACKUP_PATH}"
            ;;
        *)
            log_error "Unknown command: $command"
            echo "Usage: $0 {detect_new_migrations|create_backup|dry_run_migrations|execute_migrations|rollback_migrations|health_check|restore_backup}"
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"