# Property Verification & Cleanup System

## Overview

The verification system ensures listing accuracy by tracking property status, automatically removing off-market listings, and allowing both admins and users to flag inaccurate data.

---

## Database Schema

### Properties Table - New Fields

```typescript
lastSeenAt: timestamp       // Last time property appeared in API sync
isActive: boolean           // False if property is off-market
verificationStatus: enum    // active | off_market | flagged | reported | verified
flaggedReason: text         // Admin's reason for flagging
flaggedAt: timestamp        // When property was flagged
flaggedBy: varchar(100)     // Admin user ID who flagged
```

### Property Reports Table

```typescript
id: int                     // Primary key
propertyId: int             // Reference to properties.id
mlsId: varchar(100)         // MLS ID for reference
reporterName: varchar(200)  // Optional reporter name
reporterEmail: varchar(320) // Optional reporter email
reporterPhone: varchar(20)  // Optional reporter phone
reportType: enum            // sold | off_market | wrong_price | wrong_details | wrong_address | duplicate | spam | other
description: text           // Detailed issue description
status: enum                // pending | reviewing | resolved | dismissed
adminNotes: text            // Admin's response notes
reviewedBy: varchar(100)    // Admin who reviewed
reviewedAt: timestamp       // When reviewed
createdAt: timestamp
updatedAt: timestamp
```

---

## Automated Cleanup

### Sync Process

Every property sync automatically:
1. Updates `lastSeenAt` timestamp for properties found in API
2. Sets `isActive = true` and `verificationStatus = 'active'`
3. Tracks which properties were NOT seen in the current sync

### Mark Off-Market Script

**File:** `scripts/mark-off-market-properties.ts`

**Purpose:** Identifies properties not seen in 7+ days and marks them as off-market

**Usage:**
```bash
pnpm tsx scripts/mark-off-market-properties.ts
```

**What it does:**
- Finds properties where `lastSeenAt < 7 days ago`
- Sets `isActive = false`
- Sets `verificationStatus = 'off_market'`
- Provides summary statistics

**Recommended Schedule:**
Run this script after each property sync:
```bash
pnpm tsx scripts/sync-expanded-florida-properties.ts && \
pnpm tsx scripts/mark-off-market-properties.ts
```

---

## Admin Dashboard

### Access

**URL:** `/admin/properties`

**Permissions:** Admin role required (checked via `adminProcedure`)

### Features

#### 1. Statistics Overview
- Total properties
- Active listings count
- Off-market count
- Flagged count
- Reported count
- Verified count

#### 2. Property Management Tabs
- **Reported** - User-submitted reports (priority review)
- **Flagged** - Admin-flagged properties
- **Off Market** - Properties not seen in 7+ days
- **Verified** - Admin-verified accurate listings
- **Active** - Current active listings

#### 3. Actions Per Property
- **Verify** - Mark as verified and active
- **Flag** - Flag with custom reason
- **Delete** - Permanently remove from database

### Admin API Procedures

```typescript
// Get verification statistics
trpc.admin.getVerificationStats.useQuery()

// Get properties by status
trpc.admin.getPropertiesByStatus.useQuery({
  status: 'reported' | 'flagged' | 'off_market' | 'verified' | 'active',
  limit: 50,
  offset: 0
})

// Flag a property
trpc.admin.flagProperty.useMutation({
  propertyId: number,
  reason: string
})

// Verify/unflag a property
trpc.admin.unflagProperty.useMutation({
  propertyId: number
})

// Delete a property
trpc.admin.deleteProperty.useMutation({
  propertyId: number
})

// Get property reports
trpc.admin.getPropertyReports.useQuery({
  status?: 'pending' | 'reviewing' | 'resolved' | 'dismissed',
  limit: 50,
  offset: 0
})

// Update report status
trpc.admin.updateReportStatus.useMutation({
  reportId: number,
  status: 'reviewing' | 'resolved' | 'dismissed',
  adminNotes?: string
})
```

---

## User Reporting System

### Access

**Location:** Property detail pages (`/properties/:id`)

**Button:** "Report Issue" button next to Share/Favorite buttons

### Report Form

Users can report:
- **Property has been sold**
- **Property is off market**
- **Price is incorrect**
- **Beds, baths, or sqft are wrong**
- **Address is incorrect**
- **Duplicate listing**
- **Spam or fake listing**
- **Other issue**

**Required Fields:**
- Issue type
- Description (min 10 characters)

**Optional Fields:**
- Reporter name
- Reporter email
- Reporter phone

### What Happens When User Reports

1. Report is saved to `property_reports` table with status `pending`
2. Property is marked with `verificationStatus = 'reported'`
3. Owner receives email notification with report details
4. Report appears in admin dashboard for review

### Public API

```typescript
// Submit a property report
trpc.propertyReports.submitReport.useMutation({
  propertyId: number,
  mlsId: string,
  reportType: 'sold' | 'off_market' | 'wrong_price' | 'wrong_details' | 'wrong_address' | 'duplicate' | 'spam' | 'other',
  description: string,
  reporterName?: string,
  reporterEmail?: string,
  reporterPhone?: string
})
```

---

## Workflow Examples

### Daily Maintenance Workflow

**Morning (3 AM - Automated):**
```bash
# Run full property sync
pnpm tsx scripts/sync-expanded-florida-properties.ts

# Mark off-market properties
pnpm tsx scripts/mark-off-market-properties.ts
```

**Throughout Day (Manual):**
1. Check admin dashboard for new reports
2. Review reported properties
3. Flag inaccurate listings
4. Verify corrected listings
5. Update report statuses with admin notes

### Handling User Reports

1. **New Report Arrives**
   - Notification sent to owner
   - Property marked as "reported"
   - Appears in admin dashboard "Reported" tab

2. **Admin Reviews**
   - Open admin dashboard
   - Click "Reported" tab
   - Review property details and report description

3. **Admin Actions**
   - **If accurate:** Click "Verify" to mark as verified
   - **If inaccurate:** Click "Flag" and provide reason
   - **If spam/duplicate:** Click "Delete" to remove
   - Update report status to "resolved" or "dismissed"

4. **Follow-up**
   - If flagged, property will be updated in next sync
   - If deleted, property is permanently removed
   - Reporter receives no direct notification (privacy)

---

## Verification Status Flow

```
NEW PROPERTY
    ↓
[active] ← Default status for new properties
    ↓
    ├─→ Not seen in 7 days → [off_market]
    ├─→ User reports issue → [reported]
    ├─→ Admin flags → [flagged]
    └─→ Admin verifies → [verified]
         ↓
    All statuses can return to [active] via:
    - Next sync (if property still in API)
    - Admin verification
```

---

## Best Practices

### For Admins

1. **Review reports daily** - Check "Reported" tab each morning
2. **Prioritize high-value properties** - Focus on expensive listings first
3. **Document reasons** - Always provide clear flagging reasons
4. **Verify corrections** - Mark properties as verified after confirming accuracy
5. **Delete sparingly** - Only delete obvious spam/duplicates

### For Automation

1. **Run sync daily** - Keep listings fresh with daily API sync
2. **Mark off-market after sync** - Always run cleanup script after sync
3. **Monitor sync logs** - Check for API errors or unusual patterns
4. **Set up cron jobs** - Automate daily sync + cleanup

**Example Cron Job (3 AM daily):**
```bash
0 3 * * * cd /home/ubuntu/business-conector-website && pnpm tsx scripts/sync-expanded-florida-properties.ts && pnpm tsx scripts/mark-off-market-properties.ts
```

### For Database Health

1. **Index verification status** - Already indexed for fast queries
2. **Archive old reports** - Consider archiving resolved reports after 90 days
3. **Monitor report volume** - High report volume may indicate data quality issues
4. **Track verification metrics** - Monitor off-market rate, report rate, resolution time

---

## Troubleshooting

### Properties Not Being Marked Off-Market

**Check:**
1. Is `lastSeenAt` being updated during sync?
2. Is the mark-off-market script running?
3. Are there database connection issues?

**Solution:**
```bash
# Manually run mark-off-market script
pnpm tsx scripts/mark-off-market-properties.ts
```

### Reports Not Appearing in Dashboard

**Check:**
1. Is user on admin account?
2. Are reports being saved to database?
3. Is admin router properly connected?

**Solution:**
```sql
-- Check reports in database
SELECT * FROM property_reports ORDER BY created_at DESC LIMIT 10;
```

### Notifications Not Sending

**Check:**
1. Is `BUILT_IN_FORGE_API_KEY` configured?
2. Is notification service available?
3. Check server logs for errors

**Note:** Notification failures don't block report submission

---

## API Reference

### Admin Procedures (Protected)

All admin procedures require admin role authentication.

**Get Stats:**
```typescript
const { data } = trpc.admin.getVerificationStats.useQuery();
// Returns: { properties: { total, active, offMarket, flagged, reported, verified }, pendingReports }
```

**Get Properties:**
```typescript
const { data } = trpc.admin.getPropertiesByStatus.useQuery({
  status: 'reported',
  limit: 50,
  offset: 0
});
// Returns: { properties: [...], total, hasMore }
```

**Flag Property:**
```typescript
flagProperty.mutate({
  propertyId: 123,
  reason: "Price is $100k too high"
});
```

**Verify Property:**
```typescript
unflagProperty.mutate({ propertyId: 123 });
```

**Delete Property:**
```typescript
deleteProperty.mutate({ propertyId: 123 });
```

### Public Procedures

**Submit Report:**
```typescript
submitReport.mutate({
  propertyId: 123,
  mlsId: "A12345678",
  reportType: "wrong_price",
  description: "The price shown is $500k but the actual price is $450k",
  reporterEmail: "user@example.com" // Optional
});
```

---

## Database Queries

### Find Properties Not Seen Recently

```sql
SELECT id, mls_id, address, city, last_seen_at, is_active
FROM properties
WHERE last_seen_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
  AND is_active = true
ORDER BY last_seen_at ASC
LIMIT 100;
```

### Get Pending Reports

```sql
SELECT pr.*, p.address, p.city, p.price
FROM property_reports pr
JOIN properties p ON pr.property_id = p.id
WHERE pr.status = 'pending'
ORDER BY pr.created_at DESC;
```

### Verification Status Summary

```sql
SELECT 
  verification_status,
  COUNT(*) as count,
  SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_count
FROM properties
GROUP BY verification_status;
```

---

## Future Enhancements

Potential improvements to consider:

1. **Email notifications to reporters** - Send confirmation and resolution emails
2. **Bulk operations** - Flag/verify multiple properties at once
3. **Report analytics** - Track most common report types, response times
4. **Auto-resolution** - Automatically resolve reports when property is updated
5. **Report history** - Show all reports for a property on detail page
6. **Admin activity log** - Track who flagged/verified what and when
7. **Integration with MLS updates** - Auto-update properties when MLS data changes
8. **Property comparison** - Show before/after when correcting data
9. **User reputation** - Track accuracy of user reports
10. **API webhooks** - Notify external systems of verification changes

---

## Support

For issues or questions about the verification system:
- Check server logs: `/home/ubuntu/business-conector-website/logs/`
- Review database: Use Management UI → Database panel
- Contact: support@centralfloridahomes.com
