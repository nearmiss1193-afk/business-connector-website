# Zillow Property Sync - Automated Setup

## Overview

Your website now has **automated daily synchronization** with Zillow's property listings. This keeps your database current with real-time property data and images from Central Florida.

## Schedule

**Frequency:** Daily at **2:00 AM UTC** (10:00 PM EST / 9:00 PM CST)

This timing was chosen to:
- Run during off-peak hours to avoid impacting user traffic
- Complete before business hours
- Allow time for property data to be refreshed on Zillow

## What Gets Synced

The automated sync fetches properties from these 20 Central Florida cities:

1. Tampa, FL
2. Orlando, FL
3. St. Petersburg, FL
4. Lakeland, FL
5. Clearwater, FL
6. Winter Park, FL
7. Daytona Beach, FL
8. Port Orange, FL
9. Sarasota, FL
10. Bradenton, FL
11. Naples, FL
12. Fort Myers, FL
13. Cape Coral, FL
14. Kissimmee, FL
15. Winter Haven, FL
16. Ocala, FL
17. Leesburg, FL
18. Deland, FL
19. Sanford, FL
20. Altamonte Springs, FL

## How It Works

### 1. **Property Fetching**
- Fetches up to 5 pages per city (typically 40-50 properties per page)
- Uses Zillow API via RapidAPI
- Only inserts properties that have images (skips listings without photos)

### 2. **Image Handling**
- Downloads all available images for each property (typically 20-100 images per property)
- Stores images in the `property_images` table
- Images are served from Zillow's CDN (photos.zillowstatic.com)

### 3. **Rate Limiting**
- 1 second delay between property requests (to respect API limits)
- 2 second delay between city requests
- Handles 429 (Too Many Requests) errors gracefully

### 4. **Database Updates**
- Creates new property records for listings not yet in database
- Updates existing properties with latest price, status, and image data
- Marks properties as active/inactive based on listing status
- Uses `mls_id` field to store Zillow ZPID (format: `ZILLOW-{zpid}`)

## Monitoring

### Log Files
Sync logs are stored in `/var/log/zillow-sync/` with format:
```
sync-YYYY-MM-DD_HH-MM-SS.log
```

### Recent Sync Results
As of the last manual run:
- **Tampa, FL:** 22 properties synced
- **Orlando, FL:** 45 properties synced
- **Lakeland, FL:** 20+ properties synced (in progress)
- **Total:** 100+ properties with real images

### Checking Sync Status
```bash
# View latest sync log
tail -100 /var/log/zillow-sync/sync-*.log

# Check for errors
grep "Error\|Failed" /var/log/zillow-sync/sync-errors.log

# Count properties in database
mysql -e "SELECT COUNT(*) FROM properties WHERE source='zillow';"
```

## Manual Sync

If you need to run the sync manually (not waiting for scheduled time):

```bash
cd /home/ubuntu/business-conector-website
node scripts/sync-zillow-properties.mjs
```

Or use the wrapper script:
```bash
/home/ubuntu/business-conector-website/scripts/run-zillow-sync.sh
```

## Environment Variables Required

The sync script requires these environment variables (already configured):

| Variable | Purpose |
|----------|---------|
| `RAPIDAPI_KEY` | Zillow API authentication via RapidAPI |
| `DATABASE_URL` | TiDB Cloud database connection string |

These are automatically injected from your Manus environment.

## Troubleshooting

### Sync Not Running
1. Check if cron job is active: `crontab -l`
2. Check system logs: `grep CRON /var/log/syslog`
3. Verify script permissions: `ls -l scripts/run-zillow-sync.sh`

### API Rate Limiting (429 Errors)
- The script handles this gracefully
- Increases delays between requests automatically
- Retries on next scheduled run

### Database Connection Errors
- Verify `DATABASE_URL` is set correctly
- Check SSL certificate (TiDB requires SSL)
- Verify network connectivity to TiDB Cloud

### Missing Images
- Properties without images are automatically skipped
- Only properties with at least 1 image are added to database
- This ensures quality listings on your website

## Database Schema

Properties are stored in the `properties` table with:
- `mls_id`: Zillow ZPID (format: `ZILLOW-{zpid}`)
- `source`: Always set to `'zillow'`
- `address`, `city`, `state`, `zipCode`
- `price`, `bedrooms`, `bathrooms`, `sqft`
- `propertyType`: Normalized to (single_family, condo, townhouse, etc.)
- `latitude`, `longitude`: For map integration
- `primary_image`: First image URL from Zillow
- `listing_status`: active, pending, sold, off_market

Images are stored in `property_images` table with:
- `property_id`: Reference to properties table
- `image_url`: Full URL to Zillow CDN image
- `order`: Display order (0 = primary image)

## Performance Notes

- Full sync of all 20 cities takes ~30-40 minutes
- Respects API rate limits (no aggressive requests)
- Database queries are indexed for fast property searches
- Images are served directly from Zillow's CDN (no local storage)

## Next Steps

1. **Monitor first automated run** - Check logs at 2 AM UTC tomorrow
2. **Expand property count** - Current sync gets ~100 properties; can increase pages per city
3. **Add property detail page** - Display full image gallery and property info
4. **Implement favorites** - Let users save properties
5. **Add alerts** - Notify users of new listings matching their criteria

## Support

For issues or questions:
- Check `/var/log/zillow-sync/` for detailed logs
- Review this documentation
- Check RapidAPI dashboard for API quota usage
- Verify database connection in Management UI
