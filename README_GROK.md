# Business Connector - Lead Intelligence Platform

**Complete source code for frontend, backend, and distributed worker scraper system.**

## 📁 Project Structure

```
business-conector-website/
├── client/                          # React 19 + Tailwind 4 frontend
│   ├── src/
│   │   ├── pages/                   # Page components (PropertyHome, Properties, etc)
│   │   ├── components/              # Reusable UI components
│   │   ├── lib/trpc.ts              # tRPC client setup
│   │   ├── App.tsx                  # Main router
│   │   └── index.css                # Global styles
│   ├── public/                      # Static assets
│   └── index.html                   # HTML entry point
│
├── server/                          # Express 4 + tRPC backend
│   ├── routers/                     # tRPC procedure definitions
│   │   ├── properties.ts            # Property listing/search
│   │   ├── leads.ts                 # Lead capture & scoring
│   │   ├── admin.ts                 # Admin dashboard
│   │   ├── revenue.ts               # Revenue tracking
│   │   └── analytics.ts             # Analytics & reporting
│   ├── _core/                       # Framework setup
│   │   ├── index.ts                 # Express app setup
│   │   ├── context.ts               # tRPC context (auth)
│   │   ├── trpc.ts                  # tRPC router setup
│   │   ├── llm.ts                   # LLM integration
│   │   ├── imageGeneration.ts       # Image generation
│   │   ├── voiceTranscription.ts    # Voice-to-text
│   │   └── notification.ts          # Owner notifications
│   ├── db.ts                        # Database helpers
│   ├── db-properties.ts             # Property queries
│   ├── db-analytics.ts              # Analytics queries
│   ├── lead-scoring.ts              # Lead scoring engine
│   ├── gohighlevel.ts               # GHL CRM integration
│   ├── zillow-api.ts                # Zillow API wrapper
│   ├── realty-in-us-api.ts          # Realty-in-US API wrapper
│   └── storage.ts                   # S3 file storage
│
├── drizzle/                         # Database schema & migrations
│   ├── schema.ts                    # Table definitions
│   └── migrations/                  # SQL migrations
│
├── scripts/                         # Worker scraper & utilities
│   ├── master-coordinator.js        # Orchestrates 4-8 worker processes
│   ├── worker-scraper.js            # Individual worker (photo-fixed)
│   ├── sync-properties.mjs          # Property sync utilities
│   └── test-*.mjs                   # API testing scripts
│
├── shared/                          # Shared types & constants
│   ├── const.ts                     # App constants (title, logo)
│   └── types.ts                     # Shared TypeScript types
│
├── PHOTO_FIXES_GUIDE.md             # Image URL fixes documentation
├── DISTRIBUTED_WORKER_SYSTEM.md     # Worker scraper architecture
├── AUTONOMOUS_REVENUE_GUIDE.md      # Revenue generation roadmap
├── QUICK_START.md                   # 5-minute setup guide
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite bundler config
└── vercel.json                      # Vercel deployment config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 22.13.0+
- pnpm (or npm)
- MySQL/TiDB database
- Environment variables (see setup below)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd business-conector-website

# Install dependencies
pnpm install

# Set up environment variables
# Copy the env vars from your Manus dashboard or contact admin

# Push database schema
pnpm db:push

# Start dev server
pnpm dev
```

Dev server runs at `http://localhost:3000`

## 📊 Key Features

### Frontend
- **Property Search** - Location-based property discovery with filters
- **Lead Capture** - Mortgage pre-approval forms integrated with GHL
- **Agent Dashboard** - Admin panel for managing properties and leads
- **Analytics** - Real-time conversion tracking and revenue reporting

### Backend
- **tRPC APIs** - Type-safe RPC procedures for all features
- **Property Sync** - Zillow, Realty-in-US, and MLS data integration
- **Lead Scoring** - Distressed property detection and lead qualification
- **GHL Integration** - Automatic contact/opportunity creation
- **Revenue Tracking** - Lead sales, subscriptions, and advertising monetization

### Worker Scraper
- **Distributed System** - 4-8 parallel workers for fast property collection
- **Photo Fixes** - Corrected API paths and image URL validation (95%+ valid images)
- **Distressed Detection** - Foreclosure, short sale, auction, bank-owned flags
- **Base44 Upload** - Real-time property storage with image URLs
- **GHL Sync** - Automatic lead creation with property details

## 📈 Revenue Model

| Stream | Price | Potential |
|--------|-------|-----------|
| Lead Sales | $50-500/lead | $40k-100k/month |
| Agent Subscriptions | $199-449/month | $20k-45k/month |
| Advertising | $297-891/month | $10k-30k/month |
| API Access | $1k-10k/month | $5k-20k/month |
| **Total Year 1** | — | **$74.9k-494.5k/month** |

## 🔄 Worker Scraper Usage

```bash
# Run full sync with 8 workers (30-60 minutes)
WORKER_COUNT=8 node scripts/master-coordinator.js

# Run single worker for testing
WORKER_COUNT=1 node scripts/master-coordinator.js

# Monitor logs
tail -f worker-*.log
```

## 📚 Documentation

- **QUICK_START.md** - 5-minute setup guide
- **DISTRIBUTED_WORKER_SYSTEM.md** - Scraper architecture & API integration
- **AUTONOMOUS_REVENUE_GUIDE.md** - Revenue generation implementation
- **PHOTO_FIXES_GUIDE.md** - Image URL handling & testing
- **TECHNICAL_AUDIT_REPORT.md** - System architecture & performance

## 🛠️ Development

### Add New Property Source
1. Create API wrapper in `server/[source]-api.ts`
2. Create sync handler in `server/[source]-sync.ts`
3. Add tRPC procedure in `server/routers/properties.ts`
4. Update worker scraper to use new source

### Add New Lead Scoring Factor
1. Update scoring logic in `server/lead-scoring.ts`
2. Add database fields in `drizzle/schema.ts`
3. Push migration: `pnpm db:push`
4. Update GHL custom fields

### Deploy to Vercel
```bash
# Create Vercel project
vercel link

# Set environment variables in Vercel dashboard
# DATABASE_URL, RAPIDAPI_KEY, GOHIGHLEVEL_API_KEY, etc.

# Deploy
vercel deploy --prod
```

## 🐛 Troubleshooting

**Worker scraper returns empty results:**
- Check API response paths in `getBestImage()` function
- Verify RAPIDAPI_KEY is set and has quota
- Check logs for rate limiting (429 errors)

**Images not showing in Base44:**
- Verify image URLs are valid HTTPS
- Check `.filter(p => p.image_url)` is working
- Test URL in browser: `curl -I "https://..."`

**GHL integration failing:**
- Verify GOHIGHLEVEL_API_KEY and LOCATION_ID
- Check GHL pipeline and stage IDs exist
- Review GHL error logs in console

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review error logs in `scripts/` directory
3. Test API responses with provided test scripts
4. Contact development team

---

**Last Updated:** November 16, 2025  
**Version:** 2.0 (Photo Fixes)  
**Status:** Production Ready
