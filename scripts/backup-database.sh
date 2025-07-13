#!/bin/bash

# backup-database.sh
# Comprehensive database backup script for MongoDB
# Supports different environments and backup strategies

set -euo pipefail

# Configuration from environment or defaults
ENVIRONMENT="${DEPLOY_ENV:-staging}"
BACKUP_DIR="${BACKUP_DIR:-/tmp/mongodb-backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
COMPRESS="${BACKUP_COMPRESS:-true}"
VERIFY_BACKUP="${BACKUP_VERIFY:-true}"
MONGODB_URI="${MONGODB_URI:-}"
MONGODB_DB_NAME="${MONGODB_DB_NAME:-dnd-tracker}"

# Load environment-specific configuration
CONFIG_FILE="./config/migration.${ENVIRONMENT}.json"
if [[ -f "$CONFIG_FILE" ]]; then
    echo "Loading configuration from $CONFIG_FILE"
    # Extract backup settings from JSON config if available
    if command -v jq &> /dev/null; then
        RETENTION_DAYS=$(jq -r '.backup.retentionDays // 7' "$CONFIG_FILE")
        COMPRESS=$(jq -r '.backup.compression // true' "$CONFIG_FILE")
        VERIFY_BACKUP=$(jq -r '.backup.verifyIntegrity // true' "$CONFIG_FILE")
    fi
fi

# Validation
if [[ -z "$MONGODB_URI" ]]; then
    echo "❌ Error: MONGODB_URI environment variable is required"
    exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_FILENAME="backup-${ENVIRONMENT}-${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

echo "🗃️  Starting MongoDB backup..."
echo "Environment: $ENVIRONMENT"
echo "Database: $MONGODB_DB_NAME"
echo "Backup path: $BACKUP_PATH"

# Perform backup based on compression setting
if [[ "$COMPRESS" == "true" ]]; then
    BACKUP_PATH="${BACKUP_PATH}.gz"
    echo "📦 Creating compressed backup..."
    
    mongodump \
        --uri="$MONGODB_URI" \
        --db="$MONGODB_DB_NAME" \
        --gzip \
        --archive="$BACKUP_PATH" \
        --verbose
else
    echo "📁 Creating uncompressed backup..."
    
    mongodump \
        --uri="$MONGODB_URI" \
        --db="$MONGODB_DB_NAME" \
        --out="$BACKUP_PATH" \
        --verbose
fi

# Verify backup integrity if enabled
if [[ "$VERIFY_BACKUP" == "true" ]]; then
    echo "✅ Verifying backup integrity..."
    
    if [[ "$COMPRESS" == "true" ]]; then
        # Test archive integrity
        if mongorestore --uri="mongodb://localhost:27017/backup-verification-test" --gzip --archive="$BACKUP_PATH" --dryRun 2>/dev/null; then
            echo "✅ Backup verification successful"
        else
            echo "❌ Backup verification failed"
            rm -f "$BACKUP_PATH"
            exit 1
        fi
    else
        # Check directory structure and files
        if [[ -d "$BACKUP_PATH" ]] && [[ -n "$(ls -A "$BACKUP_PATH")" ]]; then
            echo "✅ Backup verification successful"
        else
            echo "❌ Backup verification failed - directory empty or missing"
            rm -rf "$BACKUP_PATH"
            exit 1
        fi
    fi
fi

# Get backup size
if [[ "$COMPRESS" == "true" ]]; then
    BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
else
    BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
fi

echo "📊 Backup completed successfully"
echo "Size: $BACKUP_SIZE"
echo "Location: $BACKUP_PATH"

# Clean up old backups based on retention policy
echo "🧹 Cleaning up backups older than $RETENTION_DAYS days..."

find "$BACKUP_DIR" -name "backup-${ENVIRONMENT}-*" -type f -mtime "+$RETENTION_DAYS" -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "backup-${ENVIRONMENT}-*" -type d -mtime "+$RETENTION_DAYS" -exec rm -rf {} + 2>/dev/null || true

REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "backup-${ENVIRONMENT}-*" | wc -l)
echo "📈 $REMAINING_BACKUPS backup(s) remaining after cleanup"

# Output backup path for use by other scripts
echo "BACKUP_PATH=$BACKUP_PATH"

# For production environment, create additional safety measures
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo "🔒 Production environment detected - implementing additional safety measures"
    
    # Create redundant backup
    REDUNDANT_BACKUP_PATH="${BACKUP_PATH}.redundant"
    cp "$BACKUP_PATH" "$REDUNDANT_BACKUP_PATH"
    echo "🔄 Redundant backup created: $REDUNDANT_BACKUP_PATH"
    
    # Log backup details
    echo "$(date): Backup created - $BACKUP_PATH ($BACKUP_SIZE)" >> "${BACKUP_DIR}/backup.log"
fi

echo "✅ Database backup process completed successfully"