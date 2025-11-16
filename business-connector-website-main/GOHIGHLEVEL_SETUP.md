# GoHighLevel Dual-Pipeline Setup Guide

## Overview

Your Business Conector website now has **smart lead routing** that automatically detects whether a form submission is from:
- **Agent** (someone who wants to BUY your service) → Goes to "Business Conector - Lead to Customer" pipeline
- **Buyer** (home buyer from property websites) → Goes to "Buyer Leads - Property to Sale" pipeline

## Current Status

✅ **Agent Pipeline** - Already working  
⏳ **Buyer Pipeline** - Needs to be created (one-time setup)

---

## Step 1: Create the Buyer Pipeline

You have two options:

### Option A: Automatic Setup (Recommended)

Run the setup script to automatically create the pipeline:

```bash
# From your project directory
pnpm tsx scripts/setup-buyer-pipeline.ts
```

This will:
1. Create the "Buyer Leads - Property to Sale" pipeline in GoHighLevel
2. Create all 7 stages automatically
3. Save the IDs to `buyer-pipeline-ids.json`
4. Show you the environment variables to add

### Option B: Manual Setup

1. Log in to GoHighLevel
2. Go to **Settings** → **Pipelines**
3. Click **+ Add Pipeline**
4. Name it: `Buyer Leads - Property to Sale`
5. Add these stages in order:
   - New Property Inquiry
   - Qualified Buyer
   - Assigned to Agent
   - In Showing/Negotiation
   - Under Contract
   - Closed - Won
   - Closed - Lost
6. Save the pipeline
7. Copy the Pipeline ID and first Stage ID

---

## Step 2: Update Environment Variables

After creating the pipeline, you'll get two IDs. Add them to your environment:

**In Manus Dashboard:**
1. Go to your project → Settings → Secrets
2. Add these two secrets:
   - `BUYER_PIPELINE_ID` = (the pipeline ID from step 1)
   - `BUYER_STAGE_ID` = (the "New Property Inquiry" stage ID)

**For local development (.env file):**
```bash
BUYER_PIPELINE_ID="your-pipeline-id-here"
BUYER_STAGE_ID="your-stage-id-here"
```

---

## Step 3: Restart Your Server

After adding the environment variables:

```bash
# Restart the dev server
pnpm dev
```

Or in Manus Dashboard, restart the project.

---

## How It Works

### Agent Lead Flow

```
Agent visits businessconector.com
    ↓
Fills out "Get Started" form
    ↓
Smart router detects: source = businessconector.com
    ↓
Routes to: "Business Conector - Lead to Customer" pipeline
    ↓
Stage: New Lead
    ↓
Your sales process begins
```

### Buyer Lead Flow

```
Buyer visits property website (e.g., centralfloridashomes.com)
    ↓
Registers to view property details
    ↓
Smart router detects: has propertyAddress field
    ↓
Routes to: "Buyer Leads - Property to Sale" pipeline
    ↓
Stage: New Property Inquiry
    ↓
Automated workflows engage buyer
    ↓
You assign to paying agent client
```

---

## Testing the Integration

### Test Agent Lead

```bash
curl -X POST https://your-site.com/api/trpc/leads.submitForm \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Agent",
    "email": "test@agent.com",
    "phone": "8135551234",
    "source": "businessconector.com",
    "brokerageName": "eXp Realty",
    "yearsExperience": "1"
  }'
```

**Expected:** Contact appears in "Business Conector - Lead to Customer" pipeline

### Test Buyer Lead

```bash
curl -X POST https://your-site.com/api/trpc/leads.submitForm \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Buyer",
    "email": "test@buyer.com",
    "phone": "8135555678",
    "source": "centralfloridashomes.com",
    "propertyAddress": "123 Main St, Orlando FL",
    "budget": "400k-500k",
    "timeline": "30 days"
  }'
```

**Expected:** Contact appears in "Buyer Leads - Property to Sale" pipeline

---

## API Endpoints

Your website now has these endpoints:

### `/api/trpc/leads.submit`
Legacy endpoint for existing agent forms. Requires consent checkboxes.

### `/api/trpc/leads.submitForm`
**NEW** Smart endpoint that auto-detects lead type. Use this for all new forms.

**Example usage in React:**

```tsx
import { trpc } from '@/lib/trpc';

function PropertyForm() {
  const submitLead = trpc.leads.submitForm.useMutation();

  const handleSubmit = async (data) => {
    const result = await submitLead.mutateAsync({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      source: 'centralfloridashomes.com',
      propertyAddress: '123 Main St',
      budget: '400k-500k',
      timeline: '30 days',
    });

    console.log('Lead submitted:', result.contactId);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Smart Detection Logic

The system automatically detects lead type by:

### ✅ Detects BUYER LEAD if:
- Source URL contains: `lakelandhomes`, `tampahome`, `orlandohome`, `daytonahome`, `centralfloridashomes`
- Form has fields: `propertyAddress`, `propertyPrice`, `budget`, `timeline`

### ✅ Detects AGENT LEAD if:
- Source URL contains: `businessconector.com`
- Form has fields: `brokerageName`, `yearsExperience`, `selectedPlan`

**Default:** If unclear → Routes to AGENT pipeline (safer)

---

## Troubleshooting

### "Buyer pipeline not configured"

**Problem:** You see this warning in logs when submitting buyer leads.

**Solution:** Complete Step 1 and Step 2 above to create the pipeline and add environment variables.

### "Contact already exists"

**Problem:** Duplicate email in GoHighLevel.

**Solution:** This is normal! The system will find the existing contact and add them to the pipeline.

### "Authentication failed"

**Problem:** API key is invalid or expired.

**Solution:** 
1. Go to GoHighLevel → Settings → API
2. Generate a new API key
3. Update `GOHIGHLEVEL_API_KEY` in your environment

### Pipeline not showing in GoHighLevel

**Problem:** Pipeline created but not visible.

**Solution:** 
1. Refresh your GoHighLevel dashboard
2. Check Settings → Pipelines
3. Make sure you're in the correct location

---

## Next Steps

After setup is complete:

1. ✅ Create buyer pipeline (Step 1)
2. ✅ Add environment variables (Step 2)
3. ✅ Restart server (Step 3)
4. ✅ Test both agent and buyer submissions
5. 🎯 Set up automated workflows (optional - see WORKFLOWS_SETUP.md)
6. 🎯 Connect property websites to use the new endpoint
7. 🎯 Monitor leads in GoHighLevel dashboard

---

## Support

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify your GoHighLevel API key is valid
3. Confirm environment variables are set correctly
4. Test with the curl commands above

---

**Last Updated:** November 11, 2025  
**Status:** Ready for deployment
