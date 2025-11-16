#!/usr/bin/env node

/**
 * Property Sync Script
 * Fetches properties from Realtor.com API and syncs to database
 * Run with: node sync-properties.js
 */

const mysql = require('mysql2/promise');
const { drizzle } = require('drizzle-orm/mysql2');
const { eq } = require('drizzle-orm');

const DATABASE_URL = process.env.DATABASE_URL;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

if (!RAPIDAPI_KEY) {
  console.error('ERROR: RAPIDAPI_KEY environment variable is not set');
  process.exit(1);
}

const RAPIDAPI_HOST = 'realtor-com-real-estate.p.rapidapi.com';

/**
 * Search for properties using Realtor.com API
 */
async function searchProperties(params) {
  const url = new URL(`https://${RAPIDAPI_HOST}/properties/v3/list`);
  
  if (params.city) url.searchParams.append('city', params.city);
  if (params.state_code) url.searchParams.append('state_code', params.state_code);
  if (params.limit) url.searchParams.append('limit', params.limit.toString());
  if (params.offset) url.searchParams.append('offset', params.offset.toString());
  if (params.status) url.searchParams.append('status', params.status);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      throw new Error(`Realtor API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data?.home_search?.results || [];
  } catch (error) {
    console.error('[Realtor API] Search failed:', error.message);
    return [];
  }
}

/**
 * Fetch all properties for Central Florida cities
 */
async function fetchAllFloridaProperties() {
  const cities = ['Tampa', 'Orlando', 'St. Petersburg', 'Kissimmee', 'Lakeland', 'Daytona Beach'];
  const allProperties = [];

  for (const city of cities) {
    console.log(`[Realtor API] Fetching properties for ${city}...`);
    
    try {
      const properties = await searchProperties({
        city,
        state_code: 'FL',
        status: 'for_sale',
        limit: 200,
      });

      allProperties.push(...properties);
      console.log(`[Realtor API] Found ${properties.length} properties in ${city}`);
      
      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[Realtor API] Failed to fetch properties for ${city}:`, error.message);
    }
  }

  return allProperties;
}

/**
 * Map property type from Realtor.com to our schema
 */
function mapPropertyType(type) {
  const typeMap = {
    'single_family': 'single_family',
    'condo': 'condo',
    'townhouse': 'townhouse',
    'multi_family': 'multi_family',
    'land': 'land',
    'commercial': 'commercial',
  };
  return typeMap[type?.toLowerCase()] || 'other';
}

/**
 * Map Realtor.com property to our database schema
 */
function mapRealtorPropertyToDb(property) {
  return {
    mlsId: property.listing_id || property.property_id,
    listingId: property.listing_id || property.property_id,
    address: property.address.line,
    city: property.address.city,
    state: property.address.state_code,
    zipCode: property.address.postal_code,
    county: property.address.county || '',
    price: property.price.toString(),
    bedrooms: property.beds || 0,
    bathrooms: property.baths ? property.baths.toString() : '0',
    sqft: property.sqft || null,
    lotSize: property.lot_sqft || null,
    yearBuilt: property.year_built || null,
    propertyType: mapPropertyType(property.prop_type),
    listingStatus: property.status === 'for_sale' ? 'active' : 'pending',
    description: property.description?.text || '',
    features: JSON.stringify(property.features || []),
    amenities: JSON.stringify(property.amenities || []),
    primaryImage: property.photos?.[0]?.href || null,
    hasVirtualTour: !!property.virtual_tours?.length,
    virtualTourUrl: property.virtual_tours?.[0]?.href || null,
    latitude: property.address.lat ? property.address.lat.toString() : null,
    longitude: property.address.lon ? property.address.lon.toString() : null,
    neighborhood: property.neighborhood || null,
    listingAgentName: property.agents?.[0]?.name || null,
    listingAgentEmail: property.agents?.[0]?.email || null,
    listingAgentPhone: property.agents?.[0]?.phone || null,
    source: 'realtor.com',
    lastSyncedAt: new Date(),
    lastSeenAt: new Date(),
    isActive: true,
    verificationStatus: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    images: property.photos?.map(p => p.href) || [],
  };
}

/**
 * Run the sync
 */
async function runSync() {
  console.log('\n🚀 Starting property sync...\n');
  
  const startTime = Date.now();
  let propertiesAdded = 0;
  let imagesAdded = 0;
  let errors = [];
  let connection;

  try {
    // Parse database URL
    const dbUrl = new URL(DATABASE_URL);
    const tls = require('tls');
    connection = await mysql.createConnection({
      host: dbUrl.hostname,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1),
      port: dbUrl.port ? parseInt(dbUrl.port) : 3306,
      ssl: {
        rejectUnauthorized: false,
      },
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
    });

    console.log('✅ Connected to database\n');

    // Fetch all properties from Realtor.com
    console.log('📥 Fetching properties from Realtor.com...');
    const realtorProperties = await fetchAllFloridaProperties();
    console.log(`✅ Fetched ${realtorProperties.length} properties\n`);

    if (realtorProperties.length === 0) {
      console.log('⚠️  No properties found. Check your API key and network connection.');
      process.exit(1);
    }

    // Process each property
    console.log('💾 Syncing properties to database...\n');
    for (let i = 0; i < realtorProperties.length; i++) {
      const realtorProp = realtorProperties[i];
      
      try {
        const mappedProperty = mapRealtorPropertyToDb(realtorProp);
        const images = mappedProperty.images;
        delete mappedProperty.images;

        // Check if property exists
        const [existing] = await connection.query(
          'SELECT id FROM properties WHERE mls_id = ? LIMIT 1',
          [mappedProperty.mlsId]
        );

        if (existing.length > 0) {
          // Update existing property
          const propertyId = existing[0].id;
          const updates = Object.entries(mappedProperty)
            .map(([key, value]) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`)
            .join(', ');
          const values = Object.values(mappedProperty);
          values.push(propertyId);

          await connection.query(
            `UPDATE properties SET ${updates}, updated_at = NOW() WHERE id = ?`,
            values
          );
        } else {
          // Insert new property
          const columns = Object.keys(mappedProperty)
            .map(k => k.replace(/([A-Z])/g, '_$1').toLowerCase())
            .join(', ');
          const placeholders = Object.values(mappedProperty).map(() => '?').join(', ');
          const values = Object.values(mappedProperty);

          const [result] = await connection.query(
            `INSERT INTO properties (${columns}, created_at, updated_at) VALUES (${placeholders}, NOW(), NOW())`,
            values
          );

          const propertyId = result.insertId;

          // Insert property images
          if (images && images.length > 0) {
            for (let j = 0; j < Math.min(images.length, 20); j++) {
              await connection.query(
                'INSERT INTO property_images (property_id, image_url, \`order\`, created_at) VALUES (?, ?, ?, NOW())',
                [propertyId, images[j], j + 1]
              );
            }
            imagesAdded += Math.min(images.length, 20);
          }

          propertiesAdded++;
        }

        // Progress indicator
        if ((i + 1) % 50 === 0) {
          console.log(`  Processed ${i + 1}/${realtorProperties.length} properties...`);
        }
      } catch (error) {
        const errorMsg = `Failed to process property ${realtorProp.property_id}: ${error.message}`;
        console.error(`  ❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n✨ Sync completed in ${duration}s`);
    console.log(`  📊 Properties added: ${propertiesAdded}`);
    console.log(`  🖼️  Images added: ${imagesAdded}`);
    console.log(`  ⚠️  Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more errors`);
      }
    }

  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the sync
runSync().then(() => {
  console.log('\n✅ Done!\n');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
