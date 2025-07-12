#!/bin/bash

# restore-database.sh
# Database restoration script from backup files
# Supports different backup formats and safety checks

set -euo pipefail

# Configuration from environment or defaults
ENVIRONMENT="${DEPLOY_ENV:-staging}"
BACKUP_PATH="${BACKUP_PATH:-}"
TARGET_DB="${TARGET_DB:-}"
DRY_RUN="${RESTORE_DRY_RUN:-false}"
FORCE_RESTORE="${FORCE_RESTORE:-false}"
VERIFY_RESTORE="${VERIFY_RESTORE:-true}"
MONGODB_URI="${MONGODB_URI:-}"
MONGODB_DB_NAME="${MONGODB_DB_NAME:-dnd-tracker}"

echo "💾 Database Restoration Tool"
echo "============================"

# Validation
if [[ -z "$MONGODB_URI" ]]; then
    echo "❌ Error: MONGODB_URI environment variable is required"
    exit 1
fi

if [[ -z "$BACKUP_PATH" ]]; then
    echo "❌ Error: BACKUP_PATH must be specified"
    echo "Usage: BACKUP_PATH=/path/to/backup.gz $0"
    exit 1
fi

if [[ ! -f "$BACKUP_PATH" && ! -d "$BACKUP_PATH" ]]; then
    echo "❌ Error: Backup file or directory not found: $BACKUP_PATH"
    exit 1
fi

# Determine target database
if [[ -n "$TARGET_DB" ]]; then
    DB_NAME="$TARGET_DB"
else
    DB_NAME="$MONGODB_DB_NAME"
fi

echo "Source backup: $BACKUP_PATH"
echo "Target database: $DB_NAME"
echo "Environment: $ENVIRONMENT"
echo "Dry run: $DRY_RUN"

# Function to get backup information
get_backup_info() {
    local backup_path="$1"
    
    echo "📊 Analyzing backup..."
    
    if [[ -f "$backup_path" ]]; then
        # File backup (compressed archive)
        BACKUP_TYPE="archive"
        BACKUP_SIZE=$(du -h "$backup_path" | cut -f1)
        
        # Try to determine if it's compressed
        if [[ "$backup_path" == *.gz ]]; then
            COMPRESSED="true"
        else
            COMPRESSED="false"
        fi
        
        echo "Backup type: Compressed archive"
        echo "File size: $BACKUP_SIZE"
        echo "Compressed: $COMPRESSED"
        
    elif [[ -d "$backup_path" ]]; then
        # Directory backup (uncompressed)
        BACKUP_TYPE="directory"
        BACKUP_SIZE=$(du -sh "$backup_path" | cut -f1)
        COMPRESSED="false"
        
        echo "Backup type: Directory"
        echo "Directory size: $BACKUP_SIZE"
        
        # Check for required files
        if [[ ! -d "$backup_path/$DB_NAME" ]]; then
            echo "⚠️  Warning: Expected database directory not found: $backup_path/$DB_NAME"
            echo "Available directories:"
            ls -la "$backup_path/"
        fi
    else
        echo "❌ Error: Invalid backup path type"
        return 1
    fi
}

# Function to create pre-restore backup
create_prerestore_backup() {
    echo "🛡️  Creating pre-restore backup of current database..."
    
    local timestamp=$(date +"%Y%m%d-%H%M%S")
    local prerestore_backup="/tmp/prerestore-backup-${timestamp}.gz"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "🔍 [DRY RUN] Would create pre-restore backup: $prerestore_backup"
        return 0
    fi
    
    if mongodump --uri="$MONGODB_URI" --db="$DB_NAME" --gzip --archive="$prerestore_backup"; then
        echo "✅ Pre-restore backup created: $prerestore_backup"
        export PRERESTORE_BACKUP="$prerestore_backup"
        return 0
    else
        echo "❌ Failed to create pre-restore backup"
        return 1
    fi
}

# Function to verify database before restoration
verify_database_state() {
    echo "🔍 Verifying current database state..."
    
    # Check if database exists and get collection count
    if mongo "$MONGODB_URI/$DB_NAME" --eval "db.stats()" >/dev/null 2>&1; then
        local collections=$(mongo "$MONGODB_URI/$DB_NAME" --quiet --eval "db.getCollectionNames().length")
        local total_docs=$(mongo "$MONGODB_URI/$DB_NAME" --quiet --eval "
            var total = 0;
            db.getCollectionNames().forEach(function(name) {
                total += db.getCollection(name).count();
            });
            print(total);
        ")
        
        echo "Current database stats:"
        echo "  Collections: $collections"
        echo "  Total documents: $total_docs"
        
        if [[ "$collections" -gt 0 && "$FORCE_RESTORE" != "true" ]]; then
            echo "⚠️  WARNING: Target database '$DB_NAME' contains data!"
            echo "This restoration will REPLACE all existing data."
            
            if [[ "$ENVIRONMENT" == "production" ]]; then
                echo "🚨 PRODUCTION DATABASE DETECTED"
                echo "Are you absolutely sure you want to proceed? (type 'CONFIRM' to continue)"
                read -r confirmation
                if [[ "$confirmation" != "CONFIRM" ]]; then
                    echo "❌ Restoration cancelled by user"
                    exit 1
                fi
            else
                echo "Press Ctrl+C to cancel or any key to continue..."
                read -n 1 -s
            fi
        fi
    else
        echo "Target database does not exist or is empty"
    fi
}

# Function to perform the restoration
perform_restoration() {
    local backup_path="$1"
    
    echo "🔄 Starting database restoration..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        if [[ "$BACKUP_TYPE" == "archive" ]]; then
            echo "🔍 [DRY RUN] Would execute: mongorestore --uri=\"$MONGODB_URI\" --db=\"$DB_NAME\" --gzip --archive=\"$backup_path\" --drop"
        else
            echo "🔍 [DRY RUN] Would execute: mongorestore --uri=\"$MONGODB_URI\" --db=\"$DB_NAME\" \"$backup_path/$DB_NAME\" --drop"
        fi
        return 0
    fi
    
    # Perform actual restoration
    local start_time=$(date +%s)
    
    if [[ "$BACKUP_TYPE" == "archive" ]]; then
        if [[ "$COMPRESSED" == "true" ]]; then
            mongorestore --uri="$MONGODB_URI" --db="$DB_NAME" --gzip --archive="$backup_path" --drop --verbose
        else
            mongorestore --uri="$MONGODB_URI" --db="$DB_NAME" --archive="$backup_path" --drop --verbose
        fi
    else
        mongorestore --uri="$MONGODB_URI" --db="$DB_NAME" "$backup_path/$DB_NAME" --drop --verbose
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo "✅ Restoration completed in ${duration} seconds"
}

# Function to verify restoration
verify_restoration() {
    echo "🔍 Verifying restoration..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "🔍 [DRY RUN] Would verify restoration"
        return 0
    fi
    
    # Check if database is accessible
    if ! mongo "$MONGODB_URI/$DB_NAME" --eval "db.stats()" >/dev/null 2>&1; then
        echo "❌ Database verification failed - cannot connect"
        return 1
    fi
    
    # Get restored data stats
    local collections=$(mongo "$MONGODB_URI/$DB_NAME" --quiet --eval "db.getCollectionNames().length")
    local total_docs=$(mongo "$MONGODB_URI/$DB_NAME" --quiet --eval "
        var total = 0;
        db.getCollectionNames().forEach(function(name) {
            total += db.getCollection(name).count();
        });
        print(total);
    ")
    
    echo "Restored database stats:"
    echo "  Collections: $collections"
    echo "  Total documents: $total_docs"
    
    if [[ "$collections" -eq 0 ]]; then
        echo "⚠️  Warning: No collections found in restored database"
        return 1
    fi
    
    # Test basic query
    if mongo "$MONGODB_URI/$DB_NAME" --eval "db.getCollectionNames()[0] && db.getCollection(db.getCollectionNames()[0]).findOne()" >/dev/null 2>&1; then
        echo "✅ Database verification successful"
        return 0
    else
        echo "❌ Database verification failed - query test failed"
        return 1
    fi
}

# Function to cleanup temporary files
cleanup() {
    echo "🧹 Cleaning up temporary files..."
    # Add cleanup logic if needed
}

# Main restoration process
main() {
    echo "Starting restoration process..."
    
    # Get backup information
    get_backup_info "$BACKUP_PATH"
    
    # Verify current database state
    verify_database_state
    
    # Create pre-restore backup for safety
    if [[ "$VERIFY_RESTORE" == "true" && "$ENVIRONMENT" == "production" ]]; then
        create_prerestore_backup
    fi
    
    # Perform the restoration
    if perform_restoration "$BACKUP_PATH"; then
        echo "✅ Database restoration completed"
    else
        echo "❌ Database restoration failed"
        
        # If we have a pre-restore backup, offer to restore it
        if [[ -n "${PRERESTORE_BACKUP:-}" ]]; then
            echo "🔄 Pre-restore backup available: $PRERESTORE_BACKUP"
            echo "Would you like to restore the original state? (y/n)"
            read -r response
            if [[ "$response" =~ ^[Yy]$ ]]; then
                echo "🔄 Restoring original database state..."
                mongorestore --uri="$MONGODB_URI" --db="$DB_NAME" --gzip --archive="$PRERESTORE_BACKUP" --drop
            fi
        fi
        
        exit 1
    fi
    
    # Verify restoration if enabled
    if [[ "$VERIFY_RESTORE" == "true" ]]; then
        if verify_restoration; then
            echo "✅ Restoration verification passed"
        else
            echo "❌ Restoration verification failed"
            exit 1
        fi
    fi
    
    echo "🎉 Database restoration process completed successfully!"
}

# Error handling
trap 'echo "❌ Restoration script failed"; cleanup; exit 1' ERR
trap 'cleanup' EXIT

# Help message
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
    echo "Usage: BACKUP_PATH=/path/to/backup $0"
    echo ""
    echo "Environment Variables:"
    echo "  BACKUP_PATH           Path to backup file or directory (required)"
    echo "  DEPLOY_ENV            Environment (staging, production) [default: staging]"
    echo "  TARGET_DB             Target database name [default: from MONGODB_DB_NAME]"
    echo "  RESTORE_DRY_RUN       Dry run mode (true/false) [default: false]"
    echo "  FORCE_RESTORE         Skip confirmations (true/false) [default: false]"
    echo "  VERIFY_RESTORE        Verify restoration (true/false) [default: true]"
    echo ""
    echo "Examples:"
    echo "  BACKUP_PATH=/tmp/backup.gz $0"
    echo "  BACKUP_PATH=/tmp/backup-dir TARGET_DB=test-db $0"
    echo "  RESTORE_DRY_RUN=true BACKUP_PATH=/tmp/backup.gz $0"
    exit 0
fi

# Execute main function
main "$@"