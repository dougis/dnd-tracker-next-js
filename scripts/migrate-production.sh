#!/bin/bash
# Production migration script with enhanced safety measures
# This script is called by Fly.io release_command

set -e  # Exit on any error

# Configuration
MIGRATION_TIMEOUT=${MIGRATION_TIMEOUT:-600000}
BACKUP_ENABLED=${MIGRATION_BACKUP_ENABLED:-true}
DRY_RUN=${MIGRATION_DRY_RUN:-false}
REQUIRE_CONFIRMATION=${MIGRATION_REQUIRE_CONFIRMATION:-false}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  [$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ [$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  [$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

log_error() {
    echo -e "${RED}❌ [$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Validate environment
validate_environment() {
    log_info "Validating production migration environment"
    
    # Check required environment variables
    required_vars=("MONGODB_URI")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    log_success "Environment validation passed"
}

# Check migration prerequisites
check_prerequisites() {
    log_info "Checking migration prerequisites"
    
    # Check if npm and node are available
    if ! command -v npm &> /dev/null; then
        log_error "npm is not available"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        log_error "node is not available"
        exit 1
    fi
    
    # Check if migration scripts exist
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found"
        exit 1
    fi
    
    # Verify migration command exists
    if ! npm run migrate:help &> /dev/null; then
        log_error "Migration commands not available"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Validate migrations before execution
validate_migrations() {
    log_info "Validating migration files"
    
    if npm run migrate:validate; then
        log_success "Migration validation passed"
    else
        log_error "Migration validation failed"
        exit 1
    fi
}

# Check migration status
check_migration_status() {
    log_info "Checking current migration status"
    
    # Get migration status
    npm run migrate:status
    
    # Check for pending migrations
    if npm run migrate:status | grep -q "pending"; then
        log_info "Pending migrations found"
        return 0
    else
        log_info "No pending migrations found"
        return 1
    fi
}

# Create backup before migration
create_backup() {
    if [[ "$BACKUP_ENABLED" != "true" ]]; then
        log_info "Backup creation disabled"
        return 0
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Skipping backup creation (dry run mode)"
        return 0
    fi
    
    log_info "Creating pre-migration backup"
    
    timestamp=$(date +"%Y%m%d-%H%M%S")
    backup_file="prod-backup-${timestamp}.gz"
    backup_path="/tmp/${backup_file}"
    
    if mongodump --uri="${MONGODB_URI}" --gzip --archive="${backup_path}"; then
        log_success "Backup created: ${backup_path}"
        export BACKUP_PATH="${backup_path}"
    else
        log_error "Failed to create backup"
        exit 1
    fi
}

# Execute migrations with timeout
execute_migrations() {
    log_info "Executing database migrations"
    
    migration_cmd="npm run migrate:up"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Running migrations in dry-run mode"
        migration_cmd="MIGRATION_DRY_RUN=true npm run migrate:up"
    fi
    
    log_info "Migration timeout: ${MIGRATION_TIMEOUT}ms"
    log_info "Executing: ${migration_cmd}"
    
    # Execute with timeout
    if timeout $((MIGRATION_TIMEOUT / 1000)) bash -c "$migration_cmd"; then
        log_success "Migrations executed successfully"
    else
        exit_code=$?
        
        if [[ $exit_code -eq 124 ]]; then
            log_error "Migration execution timed out after ${MIGRATION_TIMEOUT}ms"
        else
            log_error "Migration execution failed with exit code: $exit_code"
        fi
        
        # Attempt to rollback on failure
        log_warning "Attempting migration rollback..."
        if npm run migrate:down 1; then
            log_success "Migration rollback completed"
        else
            log_error "Migration rollback failed"
        fi
        
        exit 1
    fi
}

# Verify migration completion
verify_migrations() {
    log_info "Verifying migration completion"
    
    # Check final migration status
    if npm run migrate:status | grep -q "pending"; then
        log_error "Migrations incomplete - pending migrations still exist"
        exit 1
    else
        log_success "All migrations completed successfully"
    fi
}

# Send notification (placeholder for actual notification system)
send_notification() {
    local status=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    log_info "NOTIFICATION [$status]: $message"
    
    # Here you would integrate with your actual notification system
    # Examples:
    # - Slack webhook
    # - Email notification
    # - PagerDuty alert
    # - Custom monitoring dashboard
    
    # Example webhook call:
    # curl -X POST "$SLACK_WEBHOOK_URL" \
    #   -H 'Content-Type: application/json' \
    #   -d "{\"text\":\"🚀 Production Migration [$status] - $message (${timestamp})\"}"
}

# Main migration function
main() {
    log_info "Starting production migration process"
    
    start_time=$(date +%s)
    
    # Send start notification
    send_notification "STARTED" "Production migration process initiated"
    
    # Execute migration steps
    validate_environment
    check_prerequisites
    validate_migrations
    
    # Check if migrations are needed
    if check_migration_status; then
        log_info "Proceeding with migration execution"
        
        # Require confirmation for production if configured
        if [[ "$REQUIRE_CONFIRMATION" == "true" ]]; then
            log_warning "Production migration requires manual confirmation"
            log_info "Set MIGRATION_REQUIRE_CONFIRMATION=false to disable this check"
            exit 1
        fi
        
        create_backup
        execute_migrations
        verify_migrations
        
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        
        log_success "Production migration completed successfully in ${duration} seconds"
        send_notification "SUCCESS" "All migrations completed successfully in ${duration}s"
    else
        log_info "No migrations needed, skipping execution"
        send_notification "SKIPPED" "No pending migrations found"
    fi
}

# Handle script interruption
cleanup() {
    log_warning "Migration process interrupted"
    send_notification "INTERRUPTED" "Migration process was interrupted"
    exit 1
}

# Trap cleanup on interruption
trap cleanup INT TERM

# Execute main function
main "$@"