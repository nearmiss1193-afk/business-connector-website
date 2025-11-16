# Property Detail Page - CRM Integration Guide

## Overview

The property detail page system is fully integrated with GoHighLevel CRM for automated lead capture and follow-up. This document explains how the system works and how to manage leads.

## Architecture

### Components

1. **PropertyDetail.tsx** - Main property detail page component
   - Displays property information, images, and details
   - Integrates PropertyDetailLeadForm and PropertyViewTracker
   - Uses database images for gallery

2. **PropertyDetailLeadForm.tsx** - Lead capture form
   - Collects buyer information (name, email, phone)
   - Captures property-specific data
   - Submits to GoHighLevel via tRPC
   - Shows success/error feedback

3. **PropertyViewTracker.tsx** - View tracking system
   - Tracks property views per session
   - Shows lead capture modal after 3 views
   - Uses localStorage for session management
   - Encourages lead form completion

### Data Flow

```
Property Detail Page
    ↓
User Views Property
    ↓
PropertyViewTracker (tracks view)
    ↓
Session View Count ≥ 3?
    ↓ YES
Show Lead Capture Modal
    ↓
User Fills PropertyDetailLeadForm
    ↓
Form Submission (tRPC: leads.submitForm)
    ↓
GoHighLevel Integration (gohighlevel.ts)
    ↓
Determine Lead Type (BUYER)
    ↓
Create Contact in GoHighLevel
    ↓
Add to Buyer Pipeline
    ↓
Success Response to User
```

## GoHighLevel Integration

### Lead Type Detection

The system automatically detects lead type based on:

1. **Property-specific fields** → BUYER lead
   - propertyAddress
   - propertyPrice
   - propertyId
   - budget
   - timeline

2. **Agent-specific fields** → AGENT lead
   - brokerageName
   - yearsExperience
   - selectedPlan

3. **Source URL** → Determines pipeline
   - Property websites → Buyer pipeline
   - Business site → Agent pipeline

### Contact Creation

When a form is submitted:

1. **Contact is created** in GoHighLevel with:
   - Name, email, phone
   - Tags: `buyer-lead`, `property-interest`, `[city]`
   - Custom fields with property details

2. **Added to Buyer Pipeline** with:
   - Pipeline ID: `BUYER_PIPELINE_ID` (from env)
   - Stage ID: `BUYER_STAGE_ID` (from env)
   - Status: `open`

3. **Automation triggers**:
   - New Lead Onboarding workflow
   - Multi-Touch Follow-Up Sequence
   - Engagement Response workflow

### Custom Fields Captured

```javascript
{
  property_address: "123 Main St, Orlando, FL 32801",
  property_price: "350000",
  property_id: "12345",
  budget: "350000",
  timeline: "within 30 days",
  preapproved: "no",
  property_beds: "3",
  property_baths: "2",
  property_sqft: "2000",
  city: "Orlando",
  website_url: "property-detail-page"
}
```

## Form Submission Flow

### 1. User Fills Form

```
First Name: John
Last Name: Doe
Email: john@example.com
Phone: (555) 123-4567
Message: Very interested in this property
```

### 2. Form Validation

- Required fields: firstName, lastName, email, phone
- Email format validation
- Phone format validation
- Terms agreement required

### 3. API Call

```typescript
trpc.leads.submitForm.mutate({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "(555) 123-4567",
  source: "property-detail-page",
  propertyAddress: "123 Main St, Orlando, FL 32801",
  propertyPrice: "350000",
  propertyId: "12345",
  propertyBeds: "3",
  propertyBaths: "2",
  propertySqft: "2000",
  city: "Orlando",
  message: "Very interested in this property"
})
```

### 4. Backend Processing

- Validates input with Zod schema
- Determines lead type (BUYER)
- Creates contact in GoHighLevel
- Adds to Buyer pipeline
- Returns success response

### 5. User Feedback

- Success toast notification
- Form reset
- Success message displayed for 3 seconds
- Error handling with specific messages

## Property View Tracking

### Session Management

- Session ID created on first property view
- Stored in localStorage: `property_session_id`
- Persists across page navigation

### View Counting

- Each property view tracked via tRPC
- Count incremented per unique property
- Stored in database: `propertyViews` table

### Modal Trigger

- Modal shown after 3 unique property views
- Only shown once per session
- Flag stored: `lead_modal_shown`
- User can dismiss or proceed to form

### Database Schema

```sql
CREATE TABLE propertyViews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  propertyId INT NOT NULL,
  sessionId VARCHAR(255),
  userId INT,
  viewedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (propertyId) REFERENCES properties(id)
);
```

## Testing the Integration

### 1. Test Form Submission

```bash
# Navigate to property detail page
http://localhost:3000/properties/1

# Fill out form with test data
# Click "Request Information"

# Check GoHighLevel for new contact
# Verify custom fields populated
# Check if added to Buyer pipeline
```

### 2. Test View Tracking

```bash
# View 3 different properties
http://localhost:3000/properties/1
http://localhost:3000/properties/2
http://localhost:3000/properties/3

# After 3rd view, modal should appear
# Click "Tell Us More" to proceed to form
# Form should be pre-focused
```

### 3. Test Error Handling

```bash
# Submit form with missing fields
# Should show validation error toast

# Submit with invalid email
# Should show email format error

# Disable network and submit
# Should show error message
# Data should be saved to database fallback
```

## Troubleshooting

### Lead Not Appearing in GoHighLevel

1. **Check API credentials**
   - Verify `GOHIGHLEVEL_API_KEY` in environment
   - Verify `GOHIGHLEVEL_LOCATION_ID` in environment
   - Check Private Integration token is valid

2. **Check Buyer Pipeline Setup**
   - Verify `BUYER_PIPELINE_ID` is set
   - Verify `BUYER_STAGE_ID` is set
   - Check pipeline exists in GoHighLevel

3. **Check Logs**
   - Server logs for API errors
   - Browser console for form submission errors
   - Check database fallback table for failed submissions

### Form Not Submitting

1. **Check validation**
   - All required fields filled
   - Valid email format
   - Valid phone format
   - Terms agreement checked

2. **Check network**
   - API endpoint accessible
   - No CORS errors
   - No timeout errors

3. **Check browser console**
   - Look for JavaScript errors
   - Check tRPC error messages
   - Verify API response

### View Tracking Not Working

1. **Check localStorage**
   - Browser localStorage enabled
   - `property_session_id` being set
   - `lead_modal_shown` flag working

2. **Check database**
   - `propertyViews` table exists
   - Views being recorded
   - Session ID matching

3. **Check tRPC mutation**
   - `properties.trackView` mutation callable
   - Response includes `sessionViewCount`
   - Modal trigger logic working

## Configuration

### Environment Variables

```bash
# GoHighLevel API
GOHIGHLEVEL_API_KEY=pit-xxxx-xxxx-xxxx
GOHIGHLEVEL_LOCATION_ID=xxxx-xxxx-xxxx

# Buyer Pipeline (optional, falls back to contact creation only)
BUYER_PIPELINE_ID=xxxx-xxxx-xxxx
BUYER_STAGE_ID=xxxx-xxxx-xxxx
```

### Database Setup

```sql
-- Property Views Table
CREATE TABLE propertyViews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  propertyId INT NOT NULL,
  sessionId VARCHAR(255),
  userId INT,
  viewedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (propertyId) REFERENCES properties(id),
  INDEX idx_session (sessionId),
  INDEX idx_property (propertyId)
);

-- Leads Table (fallback)
CREATE TABLE leads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  leadType VARCHAR(50),
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  city VARCHAR(255),
  zipCode VARCHAR(10),
  homePrice DECIMAL(12,2),
  downPayment DECIMAL(12,2),
  interestRate DECIMAL(5,2),
  loanTerm INT,
  status VARCHAR(50),
  source VARCHAR(255),
  qualityScore VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Best Practices

### For Agents

1. **Respond quickly** - Leads are hot, respond within 2 hours
2. **Personalize** - Reference the specific property in your message
3. **Follow up** - Use GoHighLevel automation for consistent follow-up
4. **Track engagement** - Monitor which properties generate most interest

### For Developers

1. **Monitor errors** - Set up alerts for form submission failures
2. **Test regularly** - Verify GoHighLevel integration weekly
3. **Update fields** - Add new custom fields as needed
4. **Optimize form** - A/B test form fields and messaging
5. **Track metrics** - Monitor conversion rates and lead quality

## Future Enhancements

1. **Lead Scoring**
   - Score leads based on engagement
   - Prioritize high-quality leads
   - Route to appropriate agents

2. **Automated Follow-up**
   - Send property details via email
   - Schedule automatic SMS follow-up
   - Create calendar reminders

3. **Lead Qualification**
   - Pre-approval status tracking
   - Budget verification
   - Timeline confirmation

4. **Analytics Dashboard**
   - Track form submissions
   - Monitor conversion rates
   - Analyze property performance
   - Agent performance metrics

5. **Multi-property Tracking**
   - Track which properties users view
   - Identify patterns and preferences
   - Recommend similar properties

## Support

For issues or questions:

1. Check GoHighLevel API documentation
2. Review error logs in server console
3. Verify environment variables
4. Test with sample data
5. Contact support team

---

**Last Updated:** November 15, 2025
**Version:** 1.0
**Status:** Production Ready
