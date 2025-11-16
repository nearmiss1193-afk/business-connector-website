# Zillow Sync Monitoring Guide

This guide shows you how to monitor the real-time progress of your automated Zillow property sync.

## Quick Status Check

### 1. **Check if Sync is Running**

```bash
ps aux | grep "sync-zillow" | grep -v grep
```

**Output example:**
```
ubuntu     14281  0.6  1.9 11801364 79492 pts/19 Sl   16:13   0:02 node scripts/sync-zillow-properties.mjs
```

If you see output, the sync is running. If nothing appears, the sync has completed.

### 2. **Check Real-Time Sync Progress**

Watch the sync log as it runs:

```bash
tail -f /tmp/sync-output.log
```

This shows live updates as properties are being synced. Press `Ctrl+C` to stop watching.

**Example output:**
```
📍 Syncing Tampa, FL...
  📄 Fetching page 1...
  ✅ 3303 W Lawn Ave, Tampa, FL 33611 (77 images)
  ✅ 16407 Lake Byrd Dr, Tampa, FL 33618 (58 images)
  ⏭️  Skipping 220 S Glen Ave, Tampa, FL 33609 (no images)
  📄 Fetching page 2...
  ✅ 2223 Gordon St, Tampa, FL 33605 (25 images)
```

### 3. **Get Property Count from Database**

Check how many properties have been synced so far:

```bash
mysql -h gateway02.us-east-1.prod.aws.tidbcloud.com \
  -u <username> \
  -p<password> \
  -D <database> \
  -e "SELECT city, COUNT(*) as properties FROM properties WHERE source='zillow' GROUP BY city ORDER BY properties DESC;"
```

**Or use the simpler query:**

```bash
# Count total properties
mysql -e "SELECT COUNT(*) FROM properties WHERE source='zillow';"

# Count properties with images
mysql -e "SELECT COUNT(DISTINCT property_id) FROM property_images WHERE property_id IN (SELECT id FROM properties WHERE source='zillow');"

# Count by city
mysql -e "SELECT city, COUNT(*) as count FROM properties WHERE source='zillow' GROUP BY city ORDER BY count DESC;"
```

## Detailed Monitoring Dashboard

### Create a Real-Time Monitoring Script

Save this as `monitor-sync.sh`:

```bash
#!/bin/bash

echo "🔍 Zillow Sync Monitoring Dashboard"
echo "===================================="
echo ""

# Check if sync is running
RUNNING=$(ps aux | grep "sync-zillow" | grep -v grep | wc -l)
echo "📊 Sync Status: $([ $RUNNING -gt 0 ] && echo '🟢 RUNNING' || echo '🔴 STOPPED')"
echo "   Processes: $RUNNING"
echo ""

# Show last 20 lines of log
echo "📋 Recent Activity:"
echo "---"
tail -20 /tmp/sync-output.log
echo "---"
echo ""

# Database stats
echo "📈 Database Statistics:"
echo "---"
TOTAL=$(mysql -e "SELECT COUNT(*) FROM properties WHERE source='zillow';" 2>/dev/null | tail -1)
CITIES=$(mysql -e "SELECT COUNT(DISTINCT city) FROM properties WHERE source='zillow';" 2>/dev/null | tail -1)
IMAGES=$(mysql -e "SELECT COUNT(*) FROM property_images WHERE property_id IN (SELECT id FROM properties WHERE source='zillow');" 2>/dev/null | tail -1)

echo "Total Properties: $TOTAL"
echo "Cities Covered: $CITIES"
echo "Total Images: $IMAGES"
echo "Avg Images/Property: $([ $TOTAL -gt 0 ] && echo "scale=1; $IMAGES / $TOTAL" | bc || echo "0")"
echo "---"
echo ""

# Show properties by city
echo "🏙️  Properties by City:"
echo "---"
mysql -e "SELECT city, COUNT(*) as count FROM properties WHERE source='zillow' GROUP BY city ORDER BY count DESC LIMIT 10;" 2>/dev/null
echo "---"
```

Make it executable:
```bash
chmod +x monitor-sync.sh
```

Run it:
```bash
./monitor-sync.sh
```

Or watch it continuously:
```bash
watch -n 10 ./monitor-sync.sh
```

## Understanding the Sync Output

### Success Indicators

| Symbol | Meaning | Example |
|--------|---------|---------|
| ✅ | Property synced successfully | `✅ 3303 W Lawn Ave, Tampa, FL 33611 (77 images)` |
| ⏭️ | Property skipped (no images) | `⏭️ Skipping 220 S Glen Ave (no images)` |
| 📄 | Fetching next page | `📄 Fetching page 2...` |
| 📍 | Starting new city | `📍 Syncing Tampa, FL...` |
| ⚠️ | API rate limit hit | `⚠️ Search failed for Tampa, FL: 429` |

### What Each Number Means

- **Images count**: Number of photos available for that property
  - `(77 images)` = Property has 77 photos from Zillow
  - Properties with 0 images are automatically skipped
- **Page number**: Which page of results from Zillow API
  - Each page typically has 40-50 properties
  - Sync fetches ALL pages until API returns no more results

## Monitoring Different Aspects

### 1. **Monitor Specific City**

```bash
grep "Syncing Tampa" -A 50 /tmp/sync-output.log | tail -40
```

### 2. **Count Properties Added Today**

```bash
# Check log file modification time
ls -lh /tmp/sync-output.log

# Count successful syncs
grep "✅" /tmp/sync-output.log | wc -l
```

### 3. **Find API Rate Limit Issues**

```bash
grep "429\|rate\|throttle" /tmp/sync-output.log
```

### 4. **Check for Errors**

```bash
grep "Error\|Failed\|❌" /tmp/sync-output.log
```

### 5. **See Final Summary**

```bash
tail -50 /tmp/sync-output.log | grep -E "Synced|Summary|Total"
```

## Expected Timeline

**For a full sync of all 20 cities:**

| Phase | Duration | What's Happening |
|-------|----------|------------------|
| Tampa, Orlando | 30-40 min | Initial cities, many properties |
| Lakeland, Clearwater | 20-30 min | Medium-sized cities |
| St. Petersburg, Winter Park | 15-20 min | Smaller cities |
| Sarasota, Naples, Fort Myers | 40-50 min | Larger regions, many listings |
| Remaining cities | 30-40 min | Final cities |
| **Total** | **2.5-3.5 hours** | Complete sync of all regions |

## Database Query Examples

### Get Properties Added in Last Hour

```sql
SELECT city, COUNT(*) as count 
FROM properties 
WHERE source='zillow' AND createdAt > DATE_SUB(NOW(), INTERVAL 1 HOUR)
GROUP BY city;
```

### Get Properties with Most Images

```sql
SELECT 
  p.address, 
  p.city, 
  COUNT(pi.id) as image_count
FROM properties p
LEFT JOIN property_images pi ON p.id = pi.property_id
WHERE p.source='zillow'
GROUP BY p.id
ORDER BY image_count DESC
LIMIT 20;
```

### Get Properties by Price Range

```sql
SELECT city, COUNT(*) as count, AVG(CAST(price AS DECIMAL)) as avg_price
FROM properties
WHERE source='zillow'
GROUP BY city
ORDER BY avg_price DESC;
```

## Automated Monitoring

### Set Up Email Alerts (Optional)

Create a cron job that sends you a summary email:

```bash
# Add to crontab -e
0 3 * * * /home/ubuntu/business-conector-website/monitor-sync.sh | mail -s "Daily Zillow Sync Report" your-email@example.com
```

### Check Sync Health Daily

Add this to your morning routine:

```bash
# Quick health check
ps aux | grep sync-zillow | grep -v grep && echo "✅ Sync running" || echo "⚠️ Sync not running"

# Property count
mysql -e "SELECT COUNT(*) FROM properties WHERE source='zillow';"
```

## Troubleshooting

### Sync Stopped Unexpectedly

1. Check the log for errors:
   ```bash
   tail -100 /tmp/sync-output.log | grep -i error
   ```

2. Verify database connection:
   ```bash
   mysql -e "SELECT COUNT(*) FROM properties;"
   ```

3. Check if API key is still valid:
   ```bash
   echo $RAPIDAPI_KEY
   ```

### Too Many Rate Limit Errors (429)

- The sync automatically handles this with increased delays
- If it persists, wait 1-2 hours before running sync again
- Check RapidAPI dashboard for quota usage

### Properties Not Showing on Website

- Database has properties but website shows fewer
- This is normal - website filters to show only properties WITH images
- As sync completes more cities, more properties will appear
- Refresh the website to see latest data

## Next Steps

Once sync completes:

1. **Check final count:**
   ```bash
   mysql -e "SELECT COUNT(*) FROM properties WHERE source='zillow';"
   ```

2. **Verify all cities synced:**
   ```bash
   mysql -e "SELECT DISTINCT city FROM properties WHERE source='zillow' ORDER BY city;"
   ```

3. **Monitor daily syncs:**
   - Automated sync runs every day at 2 AM UTC
   - New listings will be added automatically
   - Existing listings will be updated with latest prices/status

4. **Build features:**
   - Property detail page with full image gallery
   - Advanced search filters
   - User favorites and alerts
   - Mortgage calculator integration

## Support

For issues with monitoring:
- Check `/tmp/sync-output.log` for detailed logs
- Verify database credentials in `.env`
- Ensure RapidAPI key is active
- Check network connectivity to Zillow API
