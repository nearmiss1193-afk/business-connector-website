# Distributed Worker Scraper System

## Overview

The distributed worker scraper system enables autonomous, large-scale property data collection from multiple APIs (Zillow, Realty in US) with automatic lead generation and GoHighLevel CRM integration. The system is designed to scale horizontally across multiple worker processes, each independently scraping assigned cities and uploading results in real-time.

## Architecture

### Master Coordinator

The master coordinator orchestrates the entire operation:

- **Distributes work** across multiple worker processes
- **Monitors health** and tracks completion status
- **Aggregates results** from all workers
- **Handles retries** for failed workers
- **Manages resource allocation** based on available CPU cores

**File:** `scripts/master-coordinator.js`

**Usage:**
```bash
WORKER_COUNT=4 node scripts/master-coordinator.js
```

### Worker Processes

Each worker process independently handles assigned cities:

- **Scrapes properties** from assigned ZIP codes using Zillow and Realty in US APIs
- **Uploads to Base44** in real-time for data persistence
- **Integrates with GoHighLevel** to create leads and opportunities
- **Detects distressed properties** (foreclosures, short sales, auctions, bank-owned)
- **Manages rate limiting** to respect API quotas
- **Handles errors gracefully** with retry logic

**File:** `scripts/worker-scraper.js`

**Configuration:** Each worker receives a JSON config file specifying:
- Worker ID and name
- Assigned cities and ZIP codes
- API source (Zillow or Realty in US)
- Rate limiting parameters

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following:

```bash
# RapidAPI Key (for Zillow and Realty in US APIs)
RAPIDAPI_KEY=your_rapidapi_key_here

# Base44 Configuration (for property storage)
BASE44_APP_ID=69121e89fd61f035f1d082be
BASE44_API_KEY=your_base44_api_key_here

# GoHighLevel Configuration (for lead generation)
GOHIGHLEVEL_API_KEY=your_ghl_api_key_here
GOHIGHLEVEL_LOCATION_ID=sVgJFyuAsiqujqtlx9A
GHL_PIPELINE_ID=ypWCzagQK0pINOc2sTay
GHL_STAGE_ID=your_stage_id_here
```

### City Configuration

The system includes 8 major Florida cities with 20 ZIP codes each:

- **Tampa** - 33602-33622
- **Orlando** - 32801-32821
- **Miami** - 33101-33121
- **Jacksonville** - 32099-32220
- **Fort Lauderdale** - 33301-33320
- **Sarasota** - 34230-34249
- **Fort Myers** - 33901-33920
- **Naples** - 34102-34121

**Total Coverage:** 160 ZIP codes across 8 major markets

To add more cities, edit the `CITIES` array in `scripts/master-coordinator.js`:

```javascript
const CITIES = [
  { city: 'Tampa', state: 'FL', zips: ['33602', '33603', ...] },
  // Add more cities here
];
```

## Running the System

### Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run with default 4 workers
node scripts/master-coordinator.js

# Run with custom worker count
WORKER_COUNT=8 node scripts/master-coordinator.js
```

### Advanced Options

**Run single worker for testing:**
```bash
node scripts/worker-scraper.js /tmp/worker-1.json
```

**Run with logging:**
```bash
WORKER_COUNT=4 DEBUG=* node scripts/master-coordinator.js 2>&1 | tee scraper.log
```

**Run in background with nohup:**
```bash
nohup node scripts/master-coordinator.js > scraper.log 2>&1 &
```

## Data Flow

### Property Scraping

1. **Master Coordinator** starts and distributes cities across workers
2. **Each Worker** scrapes assigned ZIP codes from API
3. **Properties fetched** with full details: address, price, beds, baths, sqft, images
4. **Distressed detection** identifies foreclosures, short sales, auctions, bank-owned
5. **Image validation** ensures only properties with real images are processed

### Data Upload (Base44)

Each property is uploaded to Base44 with:
- Property ID (unique identifier)
- Address, city, state, ZIP code
- Price, bedrooms, bathrooms, square feet
- Property type (single family, condo, townhouse, etc.)
- Image URL (primary photo)
- Listing URL and virtual tour links
- 3D tour flag
- Distressed property notes

**API Endpoint:** `POST https://app.base44.com/api/apps/{appId}/entities/SavedProperty`

**Error Handling:**
- 409 Conflict (duplicate) - Skipped, counted as duplicate
- Other errors - Logged and retried
- Failed properties don't block processing

### Lead Generation (GoHighLevel)

For each property, a lead is created in GoHighLevel:

1. **Contact Creation/Upsert**
   - Email: Property ID or owner email
   - Phone: Owner phone number
   - Name: Owner name or "Property Lead"
   - Address: Full property address
   - Custom fields: Price, type, notes, image URL

2. **Tag Assignment**
   - "New Lead" tag on all contacts
   - Distressed tags: "Foreclosure", "Short Sale", "Auction", "Bank Owned"

3. **Opportunity Creation**
   - Pipeline: Agent pipeline (for agent leads)
   - Stage: New Lead stage
   - Value: Property price
   - Status: Open

**API Endpoint:** `https://services.leadconnectorhq.com/contacts/upsert`

## API Integration Details

### Zillow API (via RapidAPI)

**Endpoint:** `https://zillow56.p.rapidapi.com/search`

**Parameters:**
- `location` - City, state, ZIP
- `status` - "forSale", "forRent", "recentlySold"
- `output` - "json"
- `page` - Page number for pagination

**Response Fields:**
- `zpid` - Zillow property ID
- `address`, `addressCity`, `addressState`, `addressZipcode`
- `price`, `bedrooms`, `bathrooms`, `livingArea`
- `homeType` - Property type
- `imgSrc`, `hdPhotos` - Images
- `detailUrl` - Listing URL
- `homeStatus` - For distressed detection

**Rate Limiting:** 500 requests per month (RapidAPI tier dependent)

### Realty in US API (via RapidAPI)

**Endpoint:** `https://realty-in-us.p.rapidapi.com/properties/v3/list`

**Parameters:**
- `city`, `state_code`, `postal_code`
- `limit` - Results per page (max 200)
- `offset` - Pagination offset
- `sort` - "relevance"

**Response Fields:**
- `property_id` - Unique property ID
- `location.address` - Full address details
- `list_price` - Property price
- `description.beds`, `description.baths`, `description.sqft`
- `description.type` - Property type
- `photos` - Array of photo objects
- `primary_photo.href` - Primary image URL
- `href` - Listing URL
- `virtual_tours` - Virtual tour links
- `flags` - Foreclosure, short sale, auction, bank owned flags

**Rate Limiting:** Varies by RapidAPI tier

## Distressed Property Detection

The system automatically identifies distressed properties using multiple signals:

### Realty in US API
- `flags.is_foreclosure` - Foreclosure flag
- `flags.is_short_sale` - Short sale flag
- `flags.is_auction` - Auction flag
- `flags.is_bank_owned` or `flags.is_reo` - Bank-owned flag
- Tags array: "foreclosure", "short_sale", "auction", "bank_owned", "reo"

### Zillow API
- `homeStatus` field values:
  - "FORECLOSED" or "PRE_FORECLOSURE"
  - "AUCTION"
  - "BANK_OWNED" or "REO"
  - "SHORT_SALE"
- Tags array (if available)

### Output Format

Distressed properties are tagged with emoji indicators:
- 🏦 FORECLOSURE
- 💰 SHORT SALE
- 🔨 AUCTION
- 🏦 BANK OWNED

These tags are:
1. Stored in property notes
2. Added to GoHighLevel contact tags
3. Used for lead filtering and prioritization

## Monitoring & Logging

### Log Output

Each worker logs:
- Start and completion times
- Cities and ZIP codes processed
- Properties found per location
- Upload success/failure counts
- Duplicate detection
- Error messages

**Example Output:**
```
🚀 Worker-1 started
   Cities: 2
   ZIPs: 40
   API: realty_in_us

📍 Processing Tampa...
  ✅ Tampa 33602: 45 properties (42 uploaded, 3 duplicates)
  ✅ Tampa 33603: 38 properties (36 uploaded, 2 duplicates)

✅ Worker-1 completed in 12.5 minutes
   Cities: 2
   ZIPs: 40
   Found: 1,680
   Uploaded: 1,620
   Duplicates: 60
   Errors: 0
```

### Statistics Tracking

Global statistics aggregated by master coordinator:
- Total workers started/completed/failed
- Total properties found across all workers
- Total properties uploaded to Base44
- Total duplicate detections
- Total errors encountered

### Error Handling

**Graceful Degradation:**
- Worker failures don't block other workers
- Failed properties are logged and skipped
- API errors are retried with exponential backoff
- Network timeouts are handled with fallback

**Retry Logic:**
- Automatic retry on network errors
- Configurable retry count (default: 3)
- Exponential backoff between retries
- Failed uploads are logged for manual review

## Performance Optimization

### Rate Limiting

**Per-Property Delay:** 200ms between uploads
**Per-City Delay:** 500ms between API calls
**Per-ZIP Delay:** 1 second between ZIP codes

These delays prevent API throttling and ensure reliable data collection.

### Parallel Processing

**Worker Count:** Default 4 workers (adjustable via `WORKER_COUNT` env var)
**Optimal Count:** Number of CPU cores available
**Memory Usage:** ~50MB per worker
**Network I/O:** Concurrent uploads to Base44

### Pagination

**Zillow API:** Automatic page iteration until no results
**Realty in US API:** Configurable limit (200) with offset pagination

## Integration with Business Connector

### Lead Capture Flow

1. **Property Imported** via worker scraper
2. **Lead Created** in GoHighLevel with property details
3. **User Visits** property page on website
4. **Lead Form** captures contact information
5. **Lead Updated** in GoHighLevel with user info
6. **Agent Assigned** based on lead routing rules

### Custom Fields

Properties are stored with custom fields in GoHighLevel:
- `propertyPrice` - List price
- `propertyType` - Single family, condo, etc.
- `propertyAddress` - Full address
- `propertyImage` - Image URL for workflows
- `distressedStatus` - Foreclosure, short sale, etc.

### Lead Routing

Leads are automatically routed based on:
- **Property type** - Different agents for different property types
- **Price range** - Luxury vs. affordable market specialists
- **Location** - Geographic territories
- **Distressed status** - Special teams for foreclosures/short sales

## Troubleshooting

### Common Issues

**API Key Errors**
```
Error: RAPIDAPI_KEY not set in .env
```
Solution: Verify `.env` file exists and contains valid `RAPIDAPI_KEY`

**Base44 Upload Failures**
```
Error: 401 Unauthorized
```
Solution: Check `BASE44_API_KEY` and `BASE44_APP_ID` in `.env`

**GoHighLevel Integration Errors**
```
Error: 401 Unauthorized from GHL API
```
Solution: Verify `GOHIGHLEVEL_API_KEY` is valid and not expired

**Rate Limiting**
```
Error: 429 Too Many Requests
```
Solution: Increase delays in worker-scraper.js or reduce `WORKER_COUNT`

**Database Connection**
```
Error: Cannot connect to database
```
Solution: Verify `DATABASE_URL` is set and database is accessible

### Debug Mode

Enable debug logging:
```bash
DEBUG=* node scripts/master-coordinator.js
```

This will output detailed information about:
- API requests and responses
- Database operations
- Worker communication
- Error stack traces

## Best Practices

### Scheduling

**Daily Sync (Recommended)**
```bash
# Add to crontab (runs at 2 AM daily)
0 2 * * * cd /path/to/project && WORKER_COUNT=4 node scripts/master-coordinator.js >> scraper.log 2>&1
```

**Weekly Full Sync**
```bash
# Runs Sundays at 3 AM with 8 workers for comprehensive update
0 3 * * 0 cd /path/to/project && WORKER_COUNT=8 node scripts/master-coordinator.js >> scraper.log 2>&1
```

### Data Quality

1. **Verify images** before uploading (skip properties without photos)
2. **Validate addresses** to prevent duplicates
3. **Check price ranges** to filter unrealistic listings
4. **Monitor duplicates** and adjust detection logic if needed
5. **Review distressed** property flags for accuracy

### Scaling

**For 100+ cities:**
- Increase `WORKER_COUNT` to 8-16
- Implement database batching for bulk inserts
- Add caching layer for API responses
- Consider distributed job queue (Bull, RabbitMQ)

**For 1000+ properties/day:**
- Implement property deduplication service
- Add image optimization/compression
- Use CDN for image distribution
- Implement database connection pooling

## Revenue Generation Strategy

### Lead Monetization

1. **Buyer Leads** - Sell to real estate agents ($50-200 per lead)
2. **Distressed Leads** - Premium pricing for foreclosures ($100-500)
3. **Investor Leads** - Bulk property lists for investors
4. **Agent Leads** - Referral commissions (10-20% of transaction)

### Automation

- **Automatic lead routing** to agents based on specialization
- **Lead scoring** based on property value and distressed status
- **Bulk export** to multiple CRM platforms
- **API access** for partner integrations

### Reporting

- **Daily property count** by city and type
- **Lead generation metrics** (leads per property)
- **Conversion rates** by property type
- **Revenue attribution** by source

## API Reference

### Master Coordinator

```bash
WORKER_COUNT=4 node scripts/master-coordinator.js
```

**Environment Variables:**
- `WORKER_COUNT` - Number of parallel workers (default: 4)

**Output:**
- Console logs with progress and statistics
- Worker status (started/completed/failed)
- Final aggregated results

### Worker Scraper

```bash
node scripts/worker-scraper.js /path/to/config.json
```

**Config File Format:**
```json
{
  "id": 1,
  "name": "Worker-1",
  "cities": [
    {
      "city": "Tampa",
      "state": "FL",
      "zips": ["33602", "33603", ...]
    }
  ],
  "zipCount": 40,
  "api": "realty_in_us"
}
```

**Exit Codes:**
- `0` - Success
- `1` - Failure (check logs for details)

## Future Enhancements

1. **Machine Learning** - Property value prediction
2. **Market Analysis** - Trend detection and forecasting
3. **Automated Bidding** - Auction property alerts
4. **SMS/Email Campaigns** - Automated lead nurturing
5. **Mobile App** - Property browsing and lead capture
6. **Video Tours** - Automated 3D tour generation
7. **Neighborhood Analytics** - School ratings, crime stats, walkability
8. **Mortgage Integration** - Pre-approval workflows
9. **Title Search** - Automated title company integration
10. **Insurance Quotes** - Homeowners insurance integration

## Support

For issues or questions:
1. Check logs in `scraper.log`
2. Enable debug mode with `DEBUG=*`
3. Verify all environment variables are set
4. Test API keys independently
5. Review error messages in console output

## License

This system is part of the Business Connector platform and is proprietary software. Unauthorized distribution or modification is prohibited.

---

**Last Updated:** November 16, 2024
**Version:** 1.0.0
**Author:** Manus AI
