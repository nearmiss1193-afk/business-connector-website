# Zillow API + GoHighLevel Integration Guide

## Overview

This document explains how to integrate Zillow property data with GoHighLevel CRM for automated lead generation. The system fetches properties from Zillow with enhanced filters and exports them to GHL for bulk import into your Buyer pipeline.

**Key Features:**
- Enhanced Zillow API with optional filters (status, home type, price range, beds/baths)
- Auto-image fetching for complete property data
- CSV export optimized for GHL bulk import
- Rate limiting to respect RapidAPI quotas
- Coordinate and polygon-based search

---

## Architecture

### Data Flow

```
Zillow API (RapidAPI)
    ↓
searchZillowProperties() with filters
    ↓
Rate Limiter (respects quotas)
    ↓
Property Data + Images
    ↓
exportPropertiesToCSV()
    ↓
GHL Bulk Import
    ↓
Opportunities Pipeline
    ↓
Multi-Touch Follow-Up Sequence
```

### Components

1. **Enhanced Zillow API Client** (`server/zillow-api.ts`)
   - `searchZillowProperties()` - Location-based search with filters
   - `getZillowPropertyDetails()` - Detailed property info with images
   - `searchZillowByCoordinates()` - Radius-based search
   - `searchZillowByPolygon()` - Custom area search
   - `exportPropertiesToCSV()` - GHL-compatible export
   - `RateLimiter` - Queue-based rate limiting

2. **tRPC Endpoints** (`server/routers/properties.ts`)
   - `properties.searchZillow` - Search with filters
   - `properties.getZillowDetails` - Get property details
   - `properties.searchZillowByCoordinates` - Coordinate search
   - `properties.exportPropertiesToCSV` - Export to CSV

3. **Frontend Integration** (to be built)
   - Search form with filters
   - Property listing display
   - Export button for bulk import

---

## Implementation Steps

### Step 1: Verify Zillow API Key

```bash
# Check if RAPIDAPI_KEY is set
echo $RAPIDAPI_KEY

# If not set, add to .env:
# RAPIDAPI_KEY=your_key_from_rapidapi.com
```

### Step 2: Test Zillow Search

```typescript
// Test basic search
const properties = await trpc.properties.searchZillow.query({
  location: "Orlando, FL",
  page: 1,
  status_type: "ForSale",
  minPrice: 200000,
  maxPrice: 500000,
  bedsMin: 3,
});

console.log(`Found ${properties.length} properties`);
```

### Step 3: Export to CSV

```typescript
// Get properties and export
const properties = await trpc.properties.searchZillow.query({
  location: "Orlando, FL",
  status_type: "ForSale",
  minPrice: 200000,
});

const csvData = await trpc.properties.exportPropertiesToCSV.query({
  properties,
});

// Save to file
const blob = new Blob([csvData], { type: 'text/csv' });
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'properties.csv';
a.click();
```

### Step 4: Import to GoHighLevel

1. **In GoHighLevel:**
   - Go to **Opportunities** → **Bulk Actions** → **Import**
   - Upload the CSV file
   - Map columns to custom fields:

| CSV Column | GHL Field |
|-----------|-----------|
| property_address | Property Address |
| property_city | City |
| property_state | State |
| property_zip | ZIP Code |
| property_price | Property Price |
| property_beds | Bedrooms |
| property_baths | Bathrooms |
| property_sqft | Square Footage |
| property_type | Property Type |
| property_latitude | Latitude |
| property_longitude | Longitude |
| property_url | Property URL |
| days_on_zillow | Days on Zillow |
| is_sold | Is Sold |
| zpid | Zillow Property ID |

2. **Select Pipeline:**
   - Choose **Buyer Pipeline**
   - Select **Initial Stage**

3. **Import:**
   - Click **Import**
   - Monitor import progress
   - Verify properties appear in Opportunities

---

## API Endpoints

### Search Zillow Properties

```typescript
const properties = await trpc.properties.searchZillow.query({
  location: "Orlando, FL",           // Required: City, State or ZIP
  page: 1,                            // Optional: Page number (default 1)
  status_type: "ForSale",             // Optional: ForSale, ForRent, RecentlySold
  home_type: "Houses",                // Optional: Houses, Townhomes, Condos, etc.
  minPrice: 200000,                   // Optional: Minimum price
  maxPrice: 500000,                   // Optional: Maximum price
  bedsMin: 3,                         // Optional: Minimum bedrooms
  bathsMin: 2,                        // Optional: Minimum bathrooms
});
```

**Response:**
```typescript
[
  {
    zpid: 12345,
    address: "123 Main St",
    city: "Orlando",
    state: "FL",
    zipcode: "32801",
    price: 350000,
    beds: 3,
    baths: 2,
    sqft: 2000,
    propertyType: "House",
    latitude: 28.5421,
    longitude: -81.3723,
    imgSrc: "https://...",
    detailUrl: "https://zillow.com/...",
    daysOnZillow: 15,
    isSold: false,
    images: ["https://...", "https://..."]
  }
]
```

### Get Property Details

```typescript
const details = await trpc.properties.getZillowDetails.query({
  zpid: 12345  // Zillow Property ID
});
```

**Response:** Same as above with auto-fetched images

### Search by Coordinates

```typescript
const properties = await trpc.properties.searchZillowByCoordinates.query({
  latitude: 28.5421,
  longitude: -81.3723,
  radius: 5,        // Miles (default 5)
  page: 1
});
```

### Export to CSV

```typescript
const csv = await trpc.properties.exportPropertiesToCSV.query({
  properties: [
    // Array of property objects from search
  ]
});

// csv is a string ready to save/upload
```

---

## Rate Limiting

The system includes automatic rate limiting to respect RapidAPI quotas:

```typescript
// Default: 60 requests per minute
// Automatically queues requests and adds delays

// Usage is transparent - just call the API normally
const properties = await trpc.properties.searchZillow.query({...});
// Internally rate-limited
```

**Quota Management:**
- **Free Tier:** 500 calls/month
- **Pro Tier:** 10,000 calls/month
- **Enterprise:** Custom limits

**Monitor Usage:**
1. Go to [RapidAPI Dashboard](https://rapidapi.com/dashboard)
2. Select **zillow-com1** API
3. View **Usage** tab
4. Check remaining calls

---

## Workflow Integration

### Automated Lead Generation Workflow

**Trigger:** Daily at 8 AM

```
1. Search Zillow for new listings
   - Location: Central Florida
   - Status: ForSale
   - Price: $200k - $500k
   - Beds: 3+

2. Export to CSV

3. Import to GHL Opportunities
   - Pipeline: Buyer Pipeline
   - Stage: Initial Contact

4. Trigger Multi-Touch Sequence
   - Email 1: Property Details (immediate)
   - Email 2: Financing Options (day 2)
   - Email 3: Schedule Tour (day 5)
   - SMS: Follow-up (day 7)
```

**In GHL:**
1. Create new Workflow
2. Trigger: Scheduled (Daily 8 AM)
3. Action 1: HTTP Request to your API
   ```
   POST /api/trpc/properties.searchZillow
   {
     "location": "Orlando, FL",
     "status_type": "ForSale",
     "minPrice": 200000,
     "maxPrice": 500000
   }
   ```
4. Action 2: Save response to file
5. Action 3: Bulk import to Opportunities
6. Action 4: Trigger Multi-Touch Sequence

---

## Best Practices

### 1. Search Optimization

```typescript
// ✅ Good: Specific filters reduce results
const properties = await trpc.properties.searchZillow.query({
  location: "Orlando, FL",
  status_type: "ForSale",
  minPrice: 200000,
  maxPrice: 500000,
  bedsMin: 3,
});

// ❌ Bad: Broad search returns too many results
const properties = await trpc.properties.searchZillow.query({
  location: "Florida",  // Too broad
});
```

### 2. Batch Processing

```typescript
// ✅ Good: Process in batches
const locations = ["Orlando", "Tampa", "Miami"];
for (const location of locations) {
  const props = await trpc.properties.searchZillow.query({
    location: `${location}, FL`,
  });
  // Process each batch
}

// ❌ Bad: Parallel requests hit rate limits
Promise.all(locations.map(loc =>
  trpc.properties.searchZillow.query({ location: loc })
));
```

### 3. Error Handling

```typescript
try {
  const properties = await trpc.properties.searchZillow.query({
    location: "Orlando, FL",
  });
  
  if (properties.length === 0) {
    console.log("No properties found");
    return;
  }
  
  // Process properties
} catch (error) {
  console.error("Search failed:", error);
  // Fallback to cached data
}
```

### 4. Image Handling

```typescript
// Images are auto-fetched with details
const property = await trpc.properties.getZillowDetails.query({
  zpid: 12345
});

// property.images contains all images
property.images.forEach((img, idx) => {
  console.log(`Image ${idx + 1}: ${img}`);
});
```

---

## Troubleshooting

### No Results Returned

**Problem:** Search returns empty array

**Solutions:**
1. Check location format: "City, State" or "ZIP"
2. Verify API key is valid
3. Check RapidAPI quota not exceeded
4. Try broader search (remove filters)

### Rate Limit Exceeded

**Problem:** Error: "Rate limit exceeded"

**Solutions:**
1. Reduce search frequency
2. Upgrade RapidAPI plan
3. Implement longer delays between requests
4. Use batch processing instead of parallel

### Images Not Loading

**Problem:** Images field is empty

**Solutions:**
1. Verify property has images on Zillow
2. Check image URLs are accessible
3. Try getting details separately: `getZillowDetails(zpid)`

### GHL Import Fails

**Problem:** CSV import fails in GoHighLevel

**Solutions:**
1. Verify CSV format (check headers)
2. Ensure all required fields present
3. Check for special characters in addresses
4. Verify pipeline and stage IDs exist

---

## Monitoring & Analytics

### Track Import Success

```typescript
// Log imports
const imported = properties.length;
const timestamp = new Date().toISOString();

console.log(`[${timestamp}] Imported ${imported} properties`);

// Store in database
await db.insert(importLogs).values({
  count: imported,
  location: "Orlando, FL",
  timestamp,
  status: "success"
});
```

### Monitor API Usage

```typescript
// Track API calls
const callCount = await getApiCallCount();
const quotaRemaining = 10000 - callCount;

console.log(`API Calls: ${callCount}/10000`);
console.log(`Remaining: ${quotaRemaining}`);

if (quotaRemaining < 100) {
  console.warn("Approaching quota limit!");
}
```

---

## Future Enhancements

1. **Scheduled Imports**
   - Daily/weekly automatic imports
   - Configurable search criteria
   - Duplicate detection

2. **Lead Scoring**
   - Score properties by market trends
   - Identify hot markets
   - Prioritize high-potential leads

3. **Advanced Filtering**
   - School district ratings
   - Neighborhood demographics
   - Market appreciation rates

4. **Analytics Dashboard**
   - Import success rates
   - Lead conversion metrics
   - Property performance tracking

5. **Multi-Source Integration**
   - Realtor.com API
   - MLS data feeds
   - Custom property sources

---

## Support

For issues or questions:

1. Check RapidAPI status page
2. Review error logs in server console
3. Verify API credentials
4. Test endpoints individually
5. Contact support team

---

**Last Updated:** November 15, 2025
**Version:** 1.0
**Status:** Production Ready
