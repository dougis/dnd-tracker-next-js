#!/bin/bash
# Deployment script with integrated migration support
# This script handles the complete deployment pipeline with safety measures

set -e  # Exit on any error

# Configuration
ENVIRONMENT=${1:-staging}
DRY_RUN=${2:-false}
SKIP_MIGRATIONS=${3:-false}

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

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    # Add cleanup logic here if needed
}

# Trap cleanup on exit
trap cleanup EXIT

# Validate environment
validate_environment() {
    log_step "Validating deployment environment"
    
    case $ENVIRONMENT in
        development|staging|production)
            log_success "Environment '$ENVIRONMENT' is valid"
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT. Must be one of: development, staging, production"
            exit 1
            ;;
    esac
    
    # Check required environment variables
    required_vars=("MONGODB_URI" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    log_success "Environment validation passed"
}

# Pre-deployment validation
validate_pre_deployment() {
    log_step "Running pre-deployment validation"
    
    # Validate migration files
    log_info "Validating migration files..."
    if npm run migrate:validate; then
        log_success "Migration validation passed"
    else
        log_error "Migration validation failed"
        exit 1
    fi
    
    # Check for pending migrations
    log_info "Checking migration status..."
    npm run migrate:status
    
    # Run build test
    log_info "Testing build process..."
    if npm run build; then
        log_success "Build test passed"
    else
        log_error "Build test failed"
        exit 1
    fi
    
    # Run tests
    log_info "Running test suite..."
    if npm run test:ci; then
        log_success "Test suite passed"
    else
        log_error "Test suite failed"
        exit 1
    fi
    
    log_success "Pre-deployment validation completed"
}

# Create backup
create_backup() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Skipping backup creation (dry run mode)"
        return 0
    fi
    
    if [[ "$ENVIRONMENT" == "development" ]]; then
        log_info "Skipping backup for development environment"
        return 0
    fi
    
    log_step "Creating database backup"
    
    timestamp=$(date +"%Y%m%d-%H%M%S")
    backup_file="backup-${ENVIRONMENT}-${timestamp}.gz"
    backup_path="/tmp/${backup_file}"
    
    log_info "Creating backup: ${backup_path}"
    
    if mongodump --uri="${MONGODB_URI}" --gzip --archive="${backup_path}"; then
        log_success "Backup created successfully: ${backup_path}"
        echo "BACKUP_PATH=${backup_path}" >> $GITHUB_ENV || true  # For GitHub Actions
    else
        log_error "Failed to create backup"
        exit 1
    fi
}

# Run migrations
run_migrations() {
    if [[ "$SKIP_MIGRATIONS" == "true" ]]; then
        log_info "Skipping migrations (SKIP_MIGRATIONS=true)"
        return 0
    fi
    
    log_step "Running database migrations"
    
    migration_cmd="npm run migrate:up"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Running migrations in dry-run mode"
        migration_cmd="MIGRATION_DRY_RUN=true npm run migrate:up"
    fi
    
    log_info "Executing: ${migration_cmd}"
    
    if eval "$migration_cmd"; then
        log_success "Migrations completed successfully"
    else
        log_error "Migration execution failed"
        
        # Attempt rollback for non-dry-run deployments
        if [[ "$DRY_RUN" != "true" && "$ENVIRONMENT" != "development" ]]; then
            log_warning "Attempting migration rollback..."
            if npm run migrate:down 1; then
                log_success "Migration rollback completed"
            else
                log_error "Migration rollback failed"
            fi
        fi
        
        exit 1
    fi
}

# Deploy to Fly.io
deploy_application() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Skipping deployment (dry run mode)"
        return 0
    fi
    
    log_step "Deploying application to Fly.io"
    
    # Select configuration file based on environment
    config_flag=""
    if [[ "$ENVIRONMENT" == "production" ]]; then
        config_flag="--config fly.production.toml"
        log_info "Using production configuration"
    else
        log_info "Using default configuration"
    fi
    
    deploy_cmd="flyctl deploy --remote-only ${config_flag}"
    log_info "Executing: ${deploy_cmd}"
    
    if eval "$deploy_cmd"; then
        log_success "Application deployed successfully"
    else
        log_error "Application deployment failed"
        
        # Attempt rollback
        log_warning "Attempting application rollback..."
        if flyctl rollback; then
            log_success "Application rollback completed"
        else
            log_error "Application rollback failed"
        fi
        
        exit 1
    fi
}

# Verify deployment
verify_deployment() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Skipping deployment verification (dry run mode)"
        return 0
    fi
    
    log_step "Verifying deployment"
    
    # Determine app URL based on environment
    case $ENVIRONMENT in
        production)
            app_url="https://dnd-tracker.fly.dev"
            ;;
        staging)
            app_url="https://dnd-tracker-staging.fly.dev"
            ;;
        *)
            app_url="https://dnd-tracker-dev.fly.dev"
            ;;
    esac
    
    log_info "Application URL: ${app_url}"
    
    # Wait for application to start
    log_info "Waiting for application to start..."
    sleep 30
    
    # Health check
    log_info "Running health checks..."
    
    max_attempts=10
    attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log_info "Health check attempt ${attempt}/${max_attempts}"
        
        if curl -f -s "${app_url}/api/health" > /dev/null; then
            log_success "Health check passed"
            break
        else
            if [[ $attempt -eq $max_attempts ]]; then
                log_error "Health check failed after ${max_attempts} attempts"
                exit 1
            fi
            
            log_warning "Health check failed, retrying in 10 seconds..."
            sleep 10
            ((attempt++))
        fi
    done
    
    # Migration status check
    log_info "Checking migration status..."
    if curl -f -s "${app_url}/api/health/migrations" > /dev/null; then
        log_success "Migration status check passed"
    else
        log_error "Migration status check failed"
        exit 1
    fi
    
    # Database connectivity check
    log_info "Checking database connectivity..."
    if curl -f -s "${app_url}/api/health/database" > /dev/null; then
        log_success "Database connectivity check passed"
    else
        log_error "Database connectivity check failed"
        exit 1
    fi
    
    log_success "Deployment verification completed successfully"
}

# Send notification
send_notification() {
    local status=$1
    local message=$2
    
    # This would integrate with your notification service (Slack, email, etc.)
    log_info "Notification: [$status] $message"
    
    # Example: Send to webhook or notification service
    # curl -X POST "$WEBHOOK_URL" -d "{\"text\":\"Deployment $status: $message\"}"
}

# Main deployment function
main() {
    log_step "Starting deployment pipeline"
    log_info "Environment: $ENVIRONMENT"
    log_info "Dry Run: $DRY_RUN"
    log_info "Skip Migrations: $SKIP_MIGRATIONS"
    
    start_time=$(date +%s)
    
    # Send start notification
    send_notification "STARTED" "Deployment to $ENVIRONMENT environment initiated"
    
    # Execute deployment steps
    validate_environment
    validate_pre_deployment
    create_backup
    run_migrations
    deploy_application
    verify_deployment
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    log_success "Deployment pipeline completed successfully in ${duration} seconds"
    send_notification "SUCCESS" "Deployment to $ENVIRONMENT completed successfully in ${duration}s"
}

# Handle script arguments
case "$1" in
    --help|-h)
        echo "Usage: $0 [environment] [dry_run] [skip_migrations]"
        echo ""
        echo "Arguments:"
        echo "  environment     Target environment (development|staging|production)"
        echo "  dry_run         Skip actual deployment (true|false)"
        echo "  skip_migrations Skip migration execution (true|false)"
        echo ""
        echo "Examples:"
        echo "  $0 staging false false    # Normal staging deployment"
        echo "  $0 production true false  # Production dry run"
        echo "  $0 staging false true     # Staging deployment without migrations"
        exit 0
        ;;
    *)
        main
        ;;
esac