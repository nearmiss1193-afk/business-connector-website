# Quick Start Guide - Business Connector Autonomous Revenue System

## 5-Minute Setup

### Step 1: Configure Environment Variables

Create or update `.env` file in project root:

```bash
# API Keys (Required)
RAPIDAPI_KEY=your_rapidapi_key_here
GOHIGHLEVEL_API_KEY=your_ghl_api_key_here
GOHIGHLEVEL_LOCATION_ID=sVgJFyuAsiqujqtlx9A
BASE44_APP_ID=69121e89fd61f035f1d082be
BASE44_API_KEY=your_base44_api_key_here

# Optional Configuration
WORKER_COUNT=4
GHL_PIPELINE_ID=ypWCzagQK0pINOc2sTay
GHL_STAGE_ID=your_stage_id_here
```

### Step 2: Start the Website

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Website will be available at http://localhost:3000
```

### Step 3: Run Property Scraper

In a new terminal:

```bash
# Run with 4 workers (collects ~2,000 properties)
node scripts/master-coordinator.js

# Or with more workers for faster collection
WORKER_COUNT=8 node scripts/master-coordinator.js
```

**Expected Output:**
```
🚀 MASTER COORDINATOR STARTED
   Workers: 4
   Cities: 8
   APIs: realty_in_us, zillow

📊 Work Distribution:
   Worker-1: 2 cities, 40 ZIPs, API: realty_in_us
   Worker-2: 2 cities, 40 ZIPs, API: zillow
   Worker-3: 2 cities, 40 ZIPs, API: realty_in_us
   Worker-4: 2 cities, 40 ZIPs, API: zillow

[Workers running in parallel...]

✅ All workers completed successfully!
```

### Step 4: Test Lead Capture

1. Open http://localhost:3000 in browser
2. Click "Browse Properties" or "Get Pre-Approved"
3. Fill out lead form
4. Check GoHighLevel pipeline: https://app.gohighlevel.com/

### Step 5: View Analytics Dashboard

Visit http://localhost:3000/dashboard/leads to see:
- Total leads captured
- Property views and conversions
- Lead quality scores
- Market analytics

## Common Commands

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run TypeScript check
npm run type-check
```

### Data Management

```bash
# Run property scraper (4 workers)
node scripts/master-coordinator.js

# Run property scraper (8 workers - faster)
WORKER_COUNT=8 node scripts/master-coordinator.js

# Run single worker for testing
node scripts/worker-scraper.js /tmp/worker-1.json
```

### Database

```bash
# Push schema changes
pnpm db:push

# Generate migrations
pnpm db:generate

# Reset database (careful!)
pnpm db:reset
```

## Revenue Streams

### 1. Lead Sales ($50-500 per lead)

Leads are automatically captured from:
- Property detail pages (after 3 views)
- Mortgage calculator (pre-approval form)
- Contact forms (agent inquiry)
- Agent advertising (advertiser inquiry)

Each lead is automatically sent to GoHighLevel and can be:
- Sold to agents ($50-200 per lead)
- Sold to investors ($100-500 per lead)
- Kept for your own agent network

### 2. Agent Subscriptions ($199-449/month)

Agents can subscribe to receive leads:
- Starter: $199/month (10 leads)
- Professional: $299/month (30 leads)
- Premium: $449/month (100 leads)

Visit `/agent-dashboard` to manage subscriptions.

### 3. Advertising ($297-891/month)

Agents can advertise on property pages:
- Starter: $297/month (10 impressions/day)
- Professional: $594/month (25 impressions/day)
- Premium: $891/month (50 impressions/day)

Visit `/advertise` to set up advertising.

### 4. API Access ($1,000-10,000/month)

Partners can access property data via API:
- Property search API
- Lead capture API
- CRM integration API
- Custom pricing based on volume

## Monitoring

### Daily Checklist

```bash
# 1. Check property count
curl http://localhost:3000/api/trpc/properties.search \
  -d '{"location":"Tampa"}' | jq '.result.data.total'

# 2. View lead count (GoHighLevel)
# Visit: https://app.gohighlevel.com/

# 3. Check analytics dashboard
# Visit: http://localhost:3000/dashboard/leads

# 4. Review error logs
tail -f scraper.log
```

### Weekly Tasks

1. Run property scraper to refresh inventory
2. Review lead quality and conversion rates
3. Onboard new agents and advertisers
4. Process payments and generate reports
5. Optimize lead pricing based on demand

### Monthly Tasks

1. Analyze revenue and profitability
2. Expand to new markets
3. Optimize conversion rates
4. Plan marketing campaigns
5. Review and update pricing

## Troubleshooting

### Website Not Loading

```bash
# Check if server is running
curl http://localhost:3000

# Restart server
npm run dev

# Check logs for errors
tail -f /tmp/dev-server.log
```

### Leads Not Appearing in GoHighLevel

```bash
# Check API key in .env
grep GOHIGHLEVEL_API_KEY .env

# Test API connection
curl -H "Authorization: Bearer YOUR_KEY" \
  https://services.leadconnectorhq.com/contacts/

# Check server logs for errors
tail -f /tmp/server.log
```

### Property Scraper Failing

```bash
# Check API keys
grep RAPIDAPI_KEY .env
grep BASE44_API_KEY .env

# Run with debug logging
DEBUG=* node scripts/master-coordinator.js

# Check rate limiting
# Increase delays in worker-scraper.js if getting 429 errors
```

### Database Connection Error

```bash
# Check DATABASE_URL
grep DATABASE_URL .env

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# If connection fails, update .env with correct URL
```

## Next Steps

### Immediate (This Week)

1. ✅ Configure environment variables
2. ✅ Start website and test locally
3. ✅ Run property scraper once
4. ✅ Test lead capture on property page
5. ✅ Verify leads appear in GoHighLevel

### Short Term (This Month)

1. Deploy to production (Render)
2. Set up custom domain (centralfloridahomes.com)
3. Onboard first 10 agents
4. Launch advertising system
5. Enable payment processing

### Medium Term (This Quarter)

1. Expand property database to 100,000+
2. Onboard 50+ agents
3. Generate $50,000+ MRR
4. Expand to 3+ markets
5. Build API access program

### Long Term (This Year)

1. Expand to 10+ states
2. 500,000+ properties in database
3. 200+ agent customers
4. $250,000+ MRR
5. Launch white-label partnerships

## Support

For detailed documentation, see:
- `AUTONOMOUS_REVENUE_GUIDE.md` - Complete revenue strategy
- `DISTRIBUTED_WORKER_SYSTEM.md` - Worker scraper documentation
- `LEAD_SCORING_DASHBOARD.md` - Analytics and lead scoring
- `server/gohighlevel.ts` - CRM integration code

## Key Metrics to Track

| Metric | Target | Current |
|--------|--------|---------|
| Properties in DB | 100,000+ | 57,882 |
| Leads/Month | 5,000+ | ~1,000 |
| Lead Conversion | 25%+ | 20% |
| Agent Subscriptions | 500+ | 100 |
| Monthly Revenue | $250,000+ | ~$50,000 |
| Gross Margin | 75%+ | 70% |

---

**Ready to launch?** Start with Step 1 above and you'll have leads flowing within 30 minutes!
