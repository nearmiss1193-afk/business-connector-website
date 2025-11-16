# Lead Scoring Dashboard - Complete Guide

## Overview

The Lead Scoring Dashboard is a comprehensive analytics platform for tracking property performance, monitoring import success rates, and identifying hot markets. It provides real-time insights into lead quality, conversion metrics, and market trends.

**Access:** `/dashboard/leads`

---

## Key Features

### 1. Real-Time Metrics

**Summary Cards** display today's key metrics:
- **Today's Leads** - Real-time lead count
- **Conversions** - Qualified leads converted
- **Imports** - Properties added today
- **Top Property** - Highest scoring property

### 2. Performance Analytics

**Daily Trends Chart** shows:
- Lead volume over time
- Conversion trends
- Property imports
- Customizable 30/60/90 day views

**Top Properties Table** displays:
- Property ranking by lead score
- View counts and lead volume
- Conversion rates
- Performance metrics

### 3. Lead Quality Analysis

**Quality Distribution** shows:
- Hot leads (75-100 score)
- Warm leads (50-74 score)
- Cold leads (25-49 score)
- Unqualified leads (<25 score)

**Conversion Funnel** tracks:
- Pending leads
- Contacted leads
- Qualified leads
- Converted leads
- Lost leads

### 4. Market Intelligence

**Hot Markets Ranking** identifies:
- Market heat scores (0-100)
- Lead volume per market
- Market trends
- Competitive pricing analysis

**Market Heat Levels:**
- **Very Hot** (80-100): High demand, fast sales, premium pricing
- **Hot** (60-79): Strong demand, good lead volume
- **Warm** (40-59): Moderate activity, stable market
- **Cold** (0-39): Low demand, slow sales

### 5. Import Monitoring

**Import Success Rates** track:
- Zillow, MLS, Realtor imports
- Success rate percentages
- Properties imported vs. failed
- Import history by location

---

## Lead Scoring Algorithm

### Property Lead Score (0-100)

Weighted scoring based on multiple factors:

| Factor | Weight | Calculation |
|--------|--------|-------------|
| Views | 20% | 0 views = 0, 100+ views = 20 pts |
| Leads | 30% | 0 leads = 0, 50+ leads = 30 pts |
| Conversions | 20% | 0% = 0, 10%+ = 20 pts |
| Market Trend | 10% | Cold=2, Warm=5, Hot=8, Very Hot=10 |
| Price Competitiveness | 10% | Median priced = 10 pts |
| Days on Market | 5% | 0-7 days = 5, 8-30 days = 3, 31+ = 1 |
| Engagement Rate | 5% | View-to-lead ratio scoring |

**Example:**
- Property with 50 views, 5 leads, 1 conversion, hot market = ~65 score (Warm)
- Property with 200 views, 20 leads, 5 conversions, very hot market = ~85 score (Hot)

### Individual Lead Quality Score (0-100)

Factors considered:
- **Property Score** (40%) - Quality of the property
- **Engagement** (25%) - Time spent on property page
- **Lead Source** (15%) - Direct (15 pts) > Search (12) > Email (10) > Ad (8)
- **Qualification** (15%) - Pre-approval, timeline, budget
- **Competition** (5%) - Fewer competing leads = higher priority

**Quality Tiers:**
- **Hot** (75-100): Immediate follow-up recommended
- **Warm** (50-74): Standard follow-up within 24 hours
- **Cold** (25-49): Follow-up within 3-5 days
- **Unqualified** (<25): Lower priority

### Market Heat Score (0-100)

Calculated from:
- Days on market (lower = hotter)
- Price appreciation trends
- Leads per property ratio
- Conversion rates
- Inventory levels

---

## Real-Time Alerts

### Alert Types

1. **High Lead Volume** (Info)
   - Triggered when property gets 10+ leads/day
   - Indicates trending property
   - Action: Prioritize follow-up

2. **Import Failed** (Warning)
   - Triggered when import success < 80%
   - Shows failed property count
   - Action: Review error logs, retry

3. **Market Heat Change** (Info/Warning)
   - Triggered when market heat changes >20%
   - Shows new market status
   - Action: Adjust pricing/marketing strategy

4. **Low Conversion Rate** (Warning)
   - Triggered when conversion < 5% with 5+ leads
   - Indicates listing optimization needed
   - Action: Review listing, improve photos/description

5. **API Quota Warning** (Warning/Critical)
   - Triggered at 80% quota usage
   - Critical at 95% usage
   - Action: Upgrade plan or reduce API calls

---

## API Endpoints

### Get Dashboard Summary
```typescript
const summary = await trpc.analytics.getDashboardSummary.query();
// Returns: today's metrics, top property, hot market, recent alerts
```

### Get Top Properties
```typescript
const properties = await trpc.analytics.getTopProperties.query({
  limit: 10,
  city: "Orlando" // optional
});
```

### Get Import Success Rates
```typescript
const rates = await trpc.analytics.getImportSuccessRates.query({
  days: 30
});
```

### Get Hot Markets
```typescript
const markets = await trpc.analytics.getHotMarkets.query({
  limit: 10
});
```

### Get Lead Quality Distribution
```typescript
const distribution = await trpc.analytics.getLeadQualityDistribution.query({
  days: 30
});
```

### Get Conversion Funnel
```typescript
const funnel = await trpc.analytics.getConversionFunnel.query({
  days: 30
});
```

### Get Alerts
```typescript
const alerts = await trpc.analytics.getAlerts.query({
  limit: 20,
  severity: "warning" // optional: info, warning, critical
});
```

---

## Reports & Exports

### Available Reports

1. **Properties Report** (CSV)
   - Top 100 properties by score
   - All metrics and rankings
   - Export via dashboard button

2. **Import Report** (CSV)
   - Import history by date/location
   - Success rates and statistics
   - GHL sync status

3. **Market Report** (CSV)
   - Market analytics by city
   - Heat scores and trends
   - Lead metrics per market

4. **Performance Summary** (JSON/CSV)
   - Period overview (30/60/90 days)
   - Total leads and conversions
   - Top performers
   - Import statistics

### Export Functions

```typescript
// Generate CSV exports
const propertiesCSV = await generatePropertiesReport(30);
const importsCSV = await generateImportReport(30);
const marketsCSV = await generateMarketReport(30);

// Generate JSON report
const report = await generateJsonReport(30);

// Get performance summary
const summary = await generatePerformanceSummary(30);
```

---

## Monitoring & Alerts

### Alert Monitoring System

Runs automatically every 60 minutes (configurable):

```typescript
// Run monitoring checks
await runMonitoringChecks();

// Schedule monitoring
scheduleMonitoring(60); // Every 60 minutes
```

### Alert Management

**Acknowledge Alert:**
```typescript
await acknowledgeAlert(alertId);
```

**Resolve Alert:**
```typescript
await resolveAlert(alertId);
```

---

## Database Schema

### Tables

1. **propertyMetrics**
   - Property ID, lead score, views, leads, conversions
   - Conversion rates and rankings
   - Last updated timestamp

2. **leadScores**
   - Individual lead scoring records
   - Score breakdown by factor
   - Lead quality tier
   - Status tracking

3. **importLogs**
   - Import history by type/location
   - Success rates and statistics
   - GHL sync status
   - Error tracking

4. **marketAnalytics**
   - Market-level metrics by city
   - Heat scores and trends
   - Price and inventory data
   - Lead metrics

5. **dailyMetrics**
   - Daily aggregated metrics
   - Trend analysis data
   - Top performers per day

6. **alertLogs**
   - Alert history
   - Status tracking (new/acknowledged/resolved)
   - Notification records

---

## Best Practices

### 1. Regular Monitoring

- Check dashboard daily for new alerts
- Review top properties weekly
- Monitor market trends monthly
- Track import success rates

### 2. Lead Follow-Up

- **Hot Leads** (75+): Follow up within 1 hour
- **Warm Leads** (50-74): Follow up within 24 hours
- **Cold Leads** (25-49): Follow up within 3-5 days
- **Unqualified** (<25): Consider nurture sequences

### 3. Import Optimization

- Monitor import success rates
- Investigate failures immediately
- Adjust search filters for better results
- Track GHL sync status

### 4. Market Strategy

- Focus on hot markets (80+ heat score)
- Adjust pricing in warm markets
- Increase marketing in cold markets
- Monitor market heat changes

### 5. Data Analysis

- Export reports weekly for analysis
- Compare week-over-week trends
- Identify seasonal patterns
- Track agent performance

---

## Troubleshooting

### No Data Showing

**Problem:** Dashboard shows no data

**Solutions:**
1. Verify properties have been imported
2. Check import logs for errors
3. Ensure leads are being tracked
4. Allow 24 hours for initial data aggregation

### Low Lead Scores

**Problem:** All properties scoring below 50

**Solutions:**
1. Check if properties have sufficient views
2. Verify lead tracking is working
3. Review property descriptions and images
4. Analyze market conditions

### Import Failures

**Problem:** Imports failing consistently

**Solutions:**
1. Check API quota usage
2. Verify API credentials
3. Review error messages in import logs
4. Test with smaller search area

### Alerts Not Appearing

**Problem:** Expected alerts not showing

**Solutions:**
1. Check alert thresholds in config
2. Verify monitoring is scheduled
3. Review alert status (may be acknowledged)
4. Check database connection

---

## Performance Tips

1. **Optimize Queries**
   - Use date range filters
   - Limit results to necessary data
   - Cache frequently accessed data

2. **Monitor Database**
   - Check query performance
   - Maintain indexes
   - Archive old data periodically

3. **API Usage**
   - Monitor quota usage
   - Batch requests when possible
   - Implement caching

4. **Dashboard Loading**
   - Use time range filters
   - Load data progressively
   - Cache chart data

---

## Integration with GHL

### Automatic Lead Scoring

When leads are imported from Zillow:
1. Property score is calculated
2. Lead quality is assessed
3. Lead is scored based on property + engagement
4. Score is stored in GHL custom field
5. Workflow triggers based on score tier

### Lead Routing

**Hot Leads (75+):**
- Immediate notification to agent
- High priority queue
- Trigger urgent follow-up sequence

**Warm Leads (50-74):**
- Standard notification
- Normal queue
- Trigger standard follow-up sequence

**Cold Leads (25-49):**
- Batch notification
- Lower priority
- Trigger nurture sequence

---

## Future Enhancements

1. **Predictive Analytics**
   - Predict lead conversion probability
   - Identify properties likely to sell
   - Forecast market trends

2. **Advanced Segmentation**
   - Segment leads by buyer profile
   - Segment properties by market
   - Personalized scoring models

3. **Automated Actions**
   - Auto-route hot leads to agents
   - Auto-adjust pricing recommendations
   - Auto-generate follow-up tasks

4. **Mobile Dashboard**
   - Mobile-optimized interface
   - Push notifications for alerts
   - Quick actions on the go

5. **Team Collaboration**
   - Team performance metrics
   - Lead assignment tracking
   - Shared notes and insights

---

## Support

For questions or issues:

1. Check this documentation
2. Review error logs in dashboard
3. Contact support team
4. Submit feedback for improvements

---

**Last Updated:** November 15, 2025
**Version:** 1.0
**Status:** Production Ready
