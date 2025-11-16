#!/bin/bash

# Zillow Property Sync Cron Wrapper
# Runs daily to keep property listings current
# Scheduled: 2 AM UTC daily

set -e

# Set up environment
PROJECT_DIR="/home/ubuntu/business-conector-website"
LOG_DIR="/var/log/zillow-sync"
LOG_FILE="$LOG_DIR/sync-$(date +%Y-%m-%d_%H-%M-%S).log"
ERROR_LOG="$LOG_DIR/sync-errors.log"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Load environment variables
if [ -f "$PROJECT_DIR/.env.local" ]; then
  export $(cat "$PROJECT_DIR/.env.local" | grep -v '^#' | xargs)
fi

# Source Manus environment
if [ -f /opt/.manus/webdev.sh.env ]; then
  source /opt/.manus/webdev.sh.env
fi

# Function to log messages
log_message() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to send error notification
send_error_notification() {
  local error_msg="$1"
  log_message "ERROR: $error_msg"
  echo "$error_msg" >> "$ERROR_LOG"
  
  # Optional: Send to monitoring/alerting service
  # curl -X POST https://your-monitoring-service.com/alerts \
  #   -d "message=Zillow sync failed: $error_msg"
}

# Main sync function
run_sync() {
  log_message "=== Starting Zillow Property Sync ==="
  log_message "Project: $PROJECT_DIR"
  log_message "Database: ${DATABASE_URL:0:50}..."
  
  cd "$PROJECT_DIR"
  
  # Run the sync script
  if node scripts/sync-zillow-properties.mjs >> "$LOG_FILE" 2>&1; then
    log_message "=== Sync completed successfully ==="
    
    # Log sync statistics
    SYNC_STATS=$(tail -20 "$LOG_FILE" | grep -E "Synced|properties found|inserted")
    log_message "Summary: $SYNC_STATS"
    
    return 0
  else
    local exit_code=$?
    send_error_notification "Sync script failed with exit code $exit_code"
    return $exit_code
  fi
}

# Cleanup old logs (keep last 30 days)
cleanup_old_logs() {
  log_message "Cleaning up old logs (older than 30 days)..."
  find "$LOG_DIR" -name "sync-*.log" -mtime +30 -delete
}

# Main execution
{
  run_sync
  cleanup_old_logs
  log_message "=== Cron job completed ==="
} >> "$LOG_FILE" 2>&1

exit $?
