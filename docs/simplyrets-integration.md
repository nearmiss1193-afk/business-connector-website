# SimplyRETS Integration Documentation

## API Overview
- **Base URL:** `https://api.simplyrets.com/`
- **Authentication:** Basic Auth (username/password)
- **Format:** JSON
- **Version:** 1.0.0
- **Protocol:** OASS (OpenAPI Specification)

## Key Endpoints

### 1. Listings API
- **GET** `/properties` - Get all property listings
- **GET** `/properties/{mlsId}` - Get single listing by MLS ID

### 2. OpenHouse API
- **GET** `/openhouse` - Get open house information

## Authentication
- Uses HTTP Basic Authentication
- Demo credentials: `simplyrets` / `simplyrets`
- Production requires account signup

## Next Steps
1. Sign up for SimplyRETS account at https://simplyrets.com
2. Get API credentials
3. Build integration service
4. Map SimplyRETS fields to our database schema
5. Create automated sync job

## Resources
- API Documentation: https://docs.simplyrets.com/api/index.html
- Create Account: https://simplyrets.com
- Plans & Pricing: https://simplyrets.com/plans
