# Vercel Deployment Guide - Business Connector

## Step 1: Connect Your GitHub Repository to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Paste your GitHub URL: `https://github.com/nearmiss1193-afk/business-connector-website.git`
5. Click "Import"
6. Vercel will auto-detect Next.js/Node.js framework

## Step 2: Add Environment Variables

After importing, go to **Settings → Environment Variables** and add these variables:

### Required Variables for Frontend

| Variable Name | Value | Purpose |
|---|---|---|
| `VITE_RAPIDAPI_KEY` | `92a128e717mshca101e9b16e00f3p1aa262jsne8ecaf176caa` | Zillow/Realty API access |
| `VITE_GOHIGHLEVEL_API_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6InVGWWNaQTdaazZFY0J6ZTVCNG9IIiwidmVyc2lvbiI6MSwiaWF0IjoxNzYyMTMxMzMyNTcyLCJzdWIiOiJPZEE3MTRrOEJVSU9jWnNCV0VoOCJ9.NfF_r-yEycnjUt6x9Krr7duBf6V4pz6AwIKhB4F5YL8` | GoHighLevel CRM integration |
| `VITE_GOHIGHLEVEL_LOCATION_ID` | `uFYcZA7Zk6EcBze5B4oH` | Your GHL location ID |

### Required Variables for Backend

| Variable Name | Value | Purpose |
|---|---|---|
| `RAPIDAPI_KEY` | `92a128e717mshca101e9b16e00f3p1aa262jsne8ecaf176caa` | Server-side property API access |
| `GOHIGHLEVEL_API_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6InVGWWNaQTdaazZFY0J6ZTVCNG9IIiwidmVyc2lvbiI6MSwiaWF0IjoxNzYyMTMxMzMyNTcyLCJzdWIiOiJPZEE3MTRrOEJVSU9jWnNCV0VoOCJ9.NfF_r-yEycnjUt6x9Krr7duBf6V4pz6AwIKhB4F5YL8` | Server-side GHL integration |
| `GOHIGHLEVEL_LOCATION_ID` | `uFYcZA7Zk6EcBze5B4oH` | Server-side location ID |
| `DATABASE_URL` | `mysql://user:pass@host/dbname` | Your MySQL/TiDB database connection |
| `JWT_SECRET` | `your-secret-key-here` | Session signing secret (generate a random string) |

## Step 3: How to Add Variables in Vercel UI

1. In your Vercel project dashboard, click **Settings**
2. Go to **Environment Variables** in the left sidebar
3. For each variable:
   - Enter the **Name** (e.g., `VITE_RAPIDAPI_KEY`)
   - Enter the **Value** (paste the key from the table above)
   - Select **Production** (or Production, Preview, Development as needed)
   - Click **Save**
4. Repeat for all variables in the tables above

## Step 4: Deploy

After adding all environment variables:

1. Click the **Deployments** tab
2. Find your latest deployment
3. Click the **Redeploy** button (or wait for auto-redeploy)
4. Vercel will rebuild with the new environment variables

## Step 5: Verify Deployment

Once deployed, test these features:

✅ **Property Listings** - Visit your site and search for properties
- Should display properties from Zillow/Realty APIs
- Images should load correctly
- Filters should work

✅ **Lead Capture** - Fill out the mortgage pre-approval form
- Form should submit successfully
- Check GoHighLevel for new contacts/opportunities

✅ **Admin Dashboard** - Log in with your account
- Should display analytics
- Should show lead scoring data
- Should display revenue metrics

## Troubleshooting

**Properties not showing:**
- Verify `VITE_RAPIDAPI_KEY` is correct
- Check Vercel logs: Deployments → Click deployment → Logs
- Ensure RapidAPI key has active subscription

**GHL integration not working:**
- Verify `VITE_GOHIGHLEVEL_API_KEY` is correct
- Check `VITE_GOHIGHLEVEL_LOCATION_ID` matches your GHL account
- Review Vercel function logs for errors

**Build fails:**
- Check Vercel build logs for TypeScript errors
- Ensure all required environment variables are set
- Verify `DATABASE_URL` is correct format

## Environment Variables Reference

**Frontend-only (VITE_ prefix):**
- `VITE_RAPIDAPI_KEY` - Used by browser to fetch properties
- `VITE_GOHIGHLEVEL_API_KEY` - Used by browser for lead submission
- `VITE_GOHIGHLEVEL_LOCATION_ID` - Used by browser for lead routing

**Backend-only (no prefix):**
- `RAPIDAPI_KEY` - Used by server for property sync jobs
- `GOHIGHLEVEL_API_KEY` - Used by server for lead creation
- `GOHIGHLEVEL_LOCATION_ID` - Used by server for lead routing
- `DATABASE_URL` - Used by server for database connections
- `JWT_SECRET` - Used by server for session signing

**Note:** Variables with `VITE_` prefix are exposed to the browser (safe for public keys). Backend variables are private and never exposed to the browser.

## Next Steps

1. ✅ Add environment variables to Vercel
2. ✅ Redeploy the project
3. ✅ Test property search functionality
4. ✅ Test lead capture forms
5. ✅ Monitor analytics dashboard
6. ✅ Set up automated property syncing (optional)

## Support

For issues:
1. Check Vercel deployment logs
2. Review browser console (F12) for frontend errors
3. Check server logs in Vercel Functions
4. Verify all environment variables are set correctly
5. Ensure RapidAPI and GoHighLevel accounts are active

---

**Status:** Ready for deployment  
**Last Updated:** November 16, 2025
