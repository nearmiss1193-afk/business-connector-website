#!/usr/bin/env node

/**
 * WORKER SCRAPER - Individual Worker Process
 * 
 * Each worker scrapes assigned cities independently
 * Uploads to Base44 in real-time
 * Reports progress to master coordinator
 */

require('dotenv').config(); // Load from .env
const axios = require('axios');
const axiosRetry = require('axios-retry');
const fs = require('fs');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

// Load worker configuration
const configFile = process.argv[2];
if (!configFile) {
  logger.error('Error: Config file not provided');
  process.exit(1);
}

const workerConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));

// Base44 configuration from env
const BASE44 = {
  appId: process.env.BASE44_APP_ID || '69121e89fd61f035f1d082be',
  apiKey: process.env.BASE44_API_KEY || '2570855849404b8d95b72a8e915dc690',
  entity: 'SavedProperty'
};

// RapidAPI key from env
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
if (!RAPIDAPI_KEY) {
  logger.error('Error: RAPIDAPI_KEY not set in .env');
  process.exit(1);
}

// GHL from env (for integration)
const GHL_API_KEY = process.env.GOHIGHLEVEL_API_KEY;
const GHL_LOCATION_ID = process.env.GOHIGHLEVEL_LOCATION_ID;
const GHL_PIPELINE_ID = process.env.GHL_PIPELINE_ID;
const GHL_STAGE_ID = process.env.GHL_STAGE_ID;

// Statistics
const stats = {
  citiesProcessed: 0,
  zipsProcessed: 0,
  propertiesFound: 0,
  propertiesUploaded: 0,
  duplicatesSkipped: 0,
  errors: 0
};

// Retry config
axiosRetry(axios, { retries: 3, retryDelay: (retryCount) => retryCount * 1000 });

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Detect distressed properties
function detectDistressedProperty(property, api) {
  const notes = [];
  
  if (api === 'realty_in_us') {
    // Realty-specific checks
    if (property.flags?.is_foreclosure) notes.push('🏦 FORECLOSURE');
    if (property.flags?.is_short_sale) notes.push('💰 SHORT SALE');
    if (property.flags?.is_auction) notes.push('🔨 AUCTION');
    if (property.flags?.is_bank_owned || property.flags?.is_reo) notes.push('🏦 BANK OWNED');
    
    // Fallback to tags
    if (property.tags) {
      if (property.tags.includes('foreclosure')) notes.push('🏦 FORECLOSURE');
      if (property.tags.includes('short_sale')) notes.push('💰 SHORT SALE');
      if (property.tags.includes('auction')) notes.push('🔨 AUCTION');
      if (property.tags.includes('bank_owned') || property.tags.includes('reo')) notes.push('🏦 BANK OWNED');
    }
  } else if (api === 'zillow') {
    // Zillow-specific checks
    if (property.homeStatus === 'FORECLOSED' || property.homeStatus === 'PRE_FORECLOSURE') notes.push('🏦 FORECLOSURE');
    if (property.homeStatus === 'AUCTION') notes.push('🔨 AUCTION');
    if (property.homeStatus?.includes('BANK_OWNED') || property.homeStatus?.includes('REO')) notes.push('🏦 BANK OWNED');
    if (property.homeStatus?.includes('SHORT_SALE')) notes.push('💰 SHORT SALE');
    
    // Fallback to tags if available
    if (property.tags) {
      if (property.tags.includes('foreclosure')) notes.push('🏦 FORECLOSURE');
      if (property.tags.includes('short_sale')) notes.push('💰 SHORT SALE');
      if (property.tags.includes('auction')) notes.push('🔨 AUCTION');
      if (property.tags.includes('bank_owned') || property.tags.includes('reo')) notes.push('🏦 BANK OWNED');
    }
  }
  
  return notes.length > 0 ? notes.join(', ') : null;
}

// Get best image URL (fix for blanks)
function getBestImage(property, api) {
  if (api === 'realty_in_us') {
    // Prefer high-res from photos array if available
    if (property.photos && property.photos.length > 0) {
      return property.photos[0].href || null;
    }
    return property.primary_photo?.href || null;
  } else if (api === 'zillow') {
    // Zillow may have hdPhotos or imgSrc
    if (property.hdPhotos && property.hdPhotos.length > 0) {
      return property.hdPhotos[0].url || null;
    }
    return property.imgSrc || null;
  }
  return null;
}

// Scrape using Realty in US API with pagination
async function scrapeRealtyInUS(city, state, zip) {
  let properties = [];
  let offset = 0;
  const limit = 200;
  while (true) {
    try {
      const response = await axios.get('https://realty-in-us.p.rapidapi.com/properties/v3/list', {
        params: { city, state_code: state, postal_code: zip, limit, offset, sort: 'relevance' },
        headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': 'realty-in-us.p.rapidapi.com' },
        timeout: 30000
      });

      // Fixed path: response.data.properties
      const results = response.data.properties || [];
      if (results.length === 0) break;
      properties.push(...results.map(p => ({
        property_id: p.property_id || `realty-${Date.now()}-${Math.random()}`,
        address: p.location?.address?.line || 'Address not available',
        city: p.location?.address?.city || city,
        state: p.location?.address?.state_code || state,
        zip_code: p.location?.address?.postal_code || zip,
        price: p.list_price || 0,
        bedrooms: p.description?.beds || null,
        bathrooms: p.description?.baths || null,
        square_feet: p.description?.sqft || null,
        property_type: p.description?.type || 'Unknown',
        image_url: getBestImage(p, 'realty_in_us'),  // Fixed image handling
        listing_url: p.href || null,
        virtual_tour_url: p.virtual_tours?.[0]?.href || null,
        video_url: null,
        has_3d_tour: p.flags?.is_new_construction || false,
        notes: detectDistressedProperty(p, 'realty_in_us')
      })).filter(p => p.image_url));  // Skip if no valid image
      offset += limit;
      await sleep(500); // Rate limit
    } catch (error) {
      logger.error(`Realty scrape error for ${zip}: ${error.message}`);
      stats.errors++;
      break;
    }
  }
  return properties;
}

// Scrape using Zillow API with pagination
async function scrapeZillow(city, state, zip) {
  let properties = [];
  let page = 1;
  const limit = 200;  // Adjust if API supports
  while (true) {
    try {
      const response = await axios.get('https://zillow56.p.rapidapi.com/search', {
        params: {
          location: `${city}, ${state} ${zip}`,
          status: 'forSale',
          output: 'json',
          page: page.toString()
        },
        headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': 'zillow56.p.rapidapi.com' },
        timeout: 30000
      });

      // Path: response.data.results
      const results = response.data.results || [];
      if (results.length === 0) break;
      properties.push(...results.map(p => ({
        property_id: p.zpid || `zillow-${Date.now()}-${Math.random()}`,
        address: p.address || 'Address not available',
        city: p.addressCity || city,
        state: p.addressState || state,
        zip_code: p.addressZipcode || zip,
        price: p.price || 0,
        bedrooms: p.bedrooms || null,
        bathrooms: p.bathrooms || null,
        square_feet: p.livingArea || null,
        property_type: p.homeType || 'Unknown',
        image_url: getBestImage(p, 'zillow'),  // Fixed image handling
        listing_url: p.detailUrl || null,
        virtual_tour_url: null,
        video_url: null,
        has_3d_tour: p.has3DModel || false,
        notes: detectDistressedProperty(p, 'zillow')
      })).filter(p => p.image_url));  // Skip if no valid image
      page++;
      await sleep(500); // Rate limit
    } catch (error) {
      logger.error(`Zillow scrape error for ${zip}: ${error.message}`);
      stats.errors++;
      break;
    }
  }
  return properties;
}

// Upload property to Base44 (ensure image_url is string for handling)
async function uploadProperty(property) {
  try {
    await axios.post(
      `https://app.base44.com/api/apps/${BASE44.appId}/entities/${BASE44.entity}`,
      { ...property, image_url: property.image_url || '' },  // Ensure string
      { headers: { 'api_key': BASE44.apiKey, 'Content-Type': 'application/json' }, timeout: 10000 }
    );
    stats.propertiesUploaded++;
    return true;
  } catch (error) {
    if (error.response?.status === 409) {
      stats.duplicatesSkipped++;
    } else {
      logger.error(`Upload error: ${error.message}`);
      stats.errors++;
    }
    return false;
  }
}

// Integrate with GHL - Create contact and opportunity (custom field for image)
async function integrateWithGHL(property) {
  try {
    // Create/upsert contact
    const contactResponse = await axios.post(
      'https://services.leadconnectorhq.com/contacts/upsert',
      {
        locationId: GHL_LOCATION_ID,
        email: property.email || `lead-${property.property_id}@example.com`,
        phone: property.phone || null,
        name: property.ownerName || 'Property Lead',
        address1: property.address,
        city: property.city,
        state: property.state,
        postalCode: property.zip_code,
        tags: ['New Lead'],
        customField: {
          propertyPrice: property.price,
          propertyType: property.property_type,
          notes: property.notes,
          propertyImage: property.image_url  // Add for workflow use
        }
      },
      { headers: { Authorization: `Bearer ${GHL_API_KEY}`, 'Content-Type': 'application/json', Version: '2021-07-28' } }
    );
    const contactId = contactResponse.data.contact.id;

    // Add distressed tags
    if (property.notes) {
      await axios.post(
        `https://services.leadconnectorhq.com/contacts/${contactId}/tags`,
        { tags: ['Distressed Lead', ...property.notes.split(', ')] },
        { headers: { Authorization: `Bearer ${GHL_API_KEY}`, 'Content-Type': 'application/json' } }
      );
    }

    // Create opportunity
    await axios.post(
      'https://services.leadconnectorhq.com/opportunities/',
      {
        locationId: GHL_LOCATION_ID,
        name: `Lead: ${property.address}`,
        pipelineId: GHL_PIPELINE_ID,
        pipelineStageId: GHL_STAGE_ID,
        status: 'open',
        contactId: contactId,
        monetaryValue: property.price,
        assignedTo: 'your_agent_id'
      },
      { headers: { Authorization: `Bearer ${GHL_API_KEY}`, 'Content-Type': 'application/json', Version: '2021-07-28' } }
    );

    logger.info(`Integrated ${property.property_id} to GHL`);
    return true;
  } catch (error) {
    logger.error(`GHL error: ${error.message}`);
    stats.errors++;
    return false;
  }
}

// Process a single ZIP code
async function processZip(city, state, zip, api) {
  let properties = [];
  
  if (api === 'realty_in_us') {
    properties = await scrapeRealtyInUS(city, state, zip);
  } else {
    properties = await scrapeZillow(city, state, zip);
  }
  
  stats.propertiesFound += properties.length;
  
  // Upload and integrate
  for (const property of properties) {
    await uploadProperty(property);
    await integrateWithGHL(property);
    await sleep(200);
  }
  
  stats.zipsProcessed++;
  
  logger.info(`  ✅ ${city} ${zip}: ${properties.length} properties (${stats.propertiesUploaded} uploaded, ${stats.duplicatesSkipped} duplicates)`);
}

// Main worker function
async function main() {
  logger.info(`🚀 ${workerConfig.name} started`);
  logger.info(`   Cities: ${workerConfig.cities.length}`);
  logger.info(`   ZIPs: ${workerConfig.zipCount}`);
  logger.info(`   API: ${workerConfig.api}`);
  logger.info('');
  
  const startTime = Date.now();
  
  for (const cityData of workerConfig.cities) {
    logger.info(`📍 Processing ${cityData.city}...`);
    
    const zipPromises = cityData.zips.map(zip => processZip(cityData.city, cityData.state, zip, workerConfig.api));
    await Promise.allSettled(zipPromises);
    
    stats.citiesProcessed++;
  }
  
  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  
  logger.info('');
  logger.info(`✅ ${workerConfig.name} completed in ${duration} minutes`);
  logger.info(`   Cities: ${stats.citiesProcessed}`);
  logger.info(`   ZIPs: ${stats.zipsProcessed}`);
  logger.info(`   Found: ${stats.propertiesFound}`);
  logger.info(`   Uploaded: ${stats.propertiesUploaded}`);
  logger.info(`   Duplicates: ${stats.duplicatesSkipped}`);
  logger.info(`   Errors: ${stats.errors}`);
  
  process.exit(0);
}

// Run worker
main().catch(error => {
  logger.error(`❌ ${workerConfig.name} failed: ${error.message}`);
  process.exit(1);
});
