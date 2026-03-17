#!/bin/bash
# Database backup script - run daily with cron
# Add to crontab: 0 2 * * * /path/to/backup.sh

set -e

BACKUP_DIR="/var/backups/saas_platform"
RETENTION_DAYS=30
CONTAINER_NAME="saas_postgres"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/saas_db_$(date +%Y%m%d_%H%M%S).sql"

echo "📅 Starting backup: $BACKUP_FILE"

# Backup database
docker exec "$CONTAINER_NAME" pg_dump -U saas_user saas_db | gzip > "$BACKUP_FILE.gz"

# Verify backup
if [ -f "$BACKUP_FILE.gz" ]; then
  SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
  echo "✅ Backup successful: $SIZE"
else
  echo "❌ Backup failed"
  exit 1
fi

# Clean old backups (keep last 30 days)
echo "🧹 Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete

# Optional: Upload to S3
if [ -n "$AWS_BACKUP_BUCKET" ]; then
  echo "☁️  Uploading to S3..."
  aws s3 cp "$BACKUP_FILE.gz" "s3://$AWS_BACKUP_BUCKET/saas_db/" --region us-east-1
  echo "✅ S3 upload complete"
fi

echo "✨ Backup complete!"
