#!/bin/bash

echo "🔍 Zillow Sync Monitoring Dashboard"
echo "===================================="
echo ""

# Check if sync is running
RUNNING=$(ps aux | grep "sync-zillow" | grep -v grep | wc -l)
echo "📊 Sync Status: $([ $RUNNING -gt 0 ] && echo '🟢 RUNNING' || echo '🔴 STOPPED')"
echo "   Processes: $RUNNING"
echo ""

# Show last 15 lines of log
echo "📋 Recent Activity (Last 15 lines):"
echo "---"
tail -15 /tmp/sync-output.log 2>/dev/null || echo "No sync log found"
echo "---"
echo ""

# Show current city being synced
echo "🏙️  Currently Syncing:"
echo "---"
grep "📍 Syncing" /tmp/sync-output.log 2>/dev/null | tail -1 || echo "No active sync"
echo "---"
echo ""

# Show properties synced so far
echo "✅ Properties Synced:"
echo "---"
SYNCED=$(grep "✅" /tmp/sync-output.log 2>/dev/null | wc -l)
SKIPPED=$(grep "⏭️" /tmp/sync-output.log 2>/dev/null | wc -l)
echo "Successfully synced: $SYNCED properties"
echo "Skipped (no images): $SKIPPED properties"
echo "---"
