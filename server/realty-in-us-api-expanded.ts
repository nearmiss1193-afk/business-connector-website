import axios from 'axios';
import { FLORIDA_LOCATIONS, LocationConfig } from './florida-locations';

const RAPIDAPI_HOST = 'realty-in-us.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

/**
 * Normalize property type from API to database enum
 */
function normalizePropertyType(apiType: string): string {
  const type = (apiType || '').toLowerCase().trim();
  
  const typeMap: Record<string, string> = {
    'single_family': 'single_family',
    'single family': 'single_family',
    'single-family': 'single_family',
    'house': 'single_family',
    'condo': 'condo',
    'condos': 'condo',
    'condominium': 'condo',
    'townhouse': 'townhouse',
    'townhome': 'townhouse',
    'townhomes': 'townhouse',
    'multi_family': 'multi_family',
    'multi family': 'multi_family',
    'multi-family': 'multi_family',
    'duplex': 'multi_family',
    'triplex': 'multi_family',
    'fourplex': 'multi_family',
    'land': 'land',
    'lot': 'land',
    'commercial': 'commercial',
  };
  
  return typeMap[type] || 'other';
}

interface SearchParams {
  postal_code?: string;
  city?: string;
  state_code?: string;
  limit?: number;
  offset?: number;
}

/**
 * Search properties with pagination support
 */
export async function searchPropertiesWithPagination(params: SearchParams): Promise<any[]> {
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY is not configured');
  }

  const url = `https://${RAPIDAPI_HOST}/properties/v3/list`;

  const requestBody = {
    limit: params.limit || 200,
    offset: params.offset || 0,
    postal_code: params.postal_code,
    city: params.city,
    state_code: params.state_code || 'FL',
    status: ['for_sale'],
    sort: {
      direction: 'desc',
      field: 'list_date'
    }
  };

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
      timeout: 30000,
    });

    const data = response.data;
    
    if (data && data.data && data.data.home_search) {
      const results = data.data.home_search.results || [];
      return results;
    }

    return [];
  } catch (error) {
    console.error('[Realty in US API] Search failed:', error);
    return [];
  }
}

/**
 * Fetch all properties for a single ZIP code with pagination
 */
export async function fetchAllPropertiesForZip(zipCode: string, maxPages: number = 5): Promise<any[]> {
  const allProperties: any[] = [];
  let offset = 0;
  const limit = 200;

  console.log(`  📍 Fetching properties for ZIP ${zipCode}...`);

  for (let page = 0; page < maxPages; page++) {
    const properties = await searchPropertiesWithPagination({
      postal_code: zipCode,
      limit,
      offset,
    });

    if (properties.length === 0) {
      // No more results
      break;
    }

    allProperties.push(...properties);
    console.log(`     Page ${page + 1}: Found ${properties.length} properties (total: ${allProperties.length})`);

    // If we got less than the limit, we've reached the end
    if (properties.length < limit) {
      break;
    }

    offset += limit;

    // Rate limiting: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`  ✅ ZIP ${zipCode}: ${allProperties.length} total properties`);
  return allProperties;
}

/**
 * Fetch all properties for a city (all ZIP codes)
 */
export async function fetchAllPropertiesForCity(cityConfig: LocationConfig): Promise<any[]> {
  const allProperties: any[] = [];

  console.log(`\n🏙️  ${cityConfig.city}, FL (${cityConfig.zipCodes.length} ZIP codes)`);
  console.log(`   Region: ${cityConfig.region} | Priority: ${cityConfig.priority}`);

  for (const zipCode of cityConfig.zipCodes) {
    const properties = await fetchAllPropertiesForZip(zipCode, 3); // Max 3 pages (600 properties) per ZIP
    
    // Add location context
    const propertiesWithLocation = properties.map(prop => ({
      ...prop,
      _location: {
        city: cityConfig.city,
        zip: zipCode,
        region: cityConfig.region,
      },
    }));
    
    allProperties.push(...propertiesWithLocation);
  }

  console.log(`✅ ${cityConfig.city} TOTAL: ${allProperties.length} properties\n`);
  return allProperties;
}

/**
 * Fetch all Florida properties with comprehensive coverage
 */
export async function fetchAllFloridaPropertiesExpanded(priorityLevel?: number): Promise<any[]> {
  const allProperties: any[] = [];

  // Filter locations by priority if specified
  const locations = priorityLevel
    ? FLORIDA_LOCATIONS.filter(loc => loc.priority === priorityLevel)
    : FLORIDA_LOCATIONS;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🏠 EXPANDED FLORIDA PROPERTY SYNC`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Cities: ${locations.length}`);
  console.log(`Total ZIP codes: ${locations.reduce((sum, loc) => sum + loc.zipCodes.length, 0)}`);
  console.log(`Priority filter: ${priorityLevel ? `Level ${priorityLevel}` : 'All'}`);
  console.log(`${'='.repeat(60)}\n`);

  for (const location of locations) {
    try {
      const properties = await fetchAllPropertiesForCity(location);
      allProperties.push(...properties);
      
      console.log(`📊 Running total: ${allProperties.length} properties\n`);
    } catch (error) {
      console.error(`❌ Failed to fetch properties for ${location.city}:`, error);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ SYNC COMPLETE: ${allProperties.length} total properties`);
  console.log(`${'='.repeat(60)}\n`);

  return allProperties;
}

/**
 * Map Realty in US API property to database schema
 */
export function mapRealtyInUSPropertyToDb(prop: any) {
  const description = prop.description || {};
  const location_data = prop.location || {};
  const address_data = location_data.address || {};
  const locationContext = prop._location || {};

  return {
    mlsId: prop.property_id || prop.listing_id || `realty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    address: address_data.line || 'Address not available',
    city: address_data.city || locationContext.city || '',
    state: address_data.state_code || 'FL',
    zipCode: address_data.postal_code || locationContext.zip || '',
    price: prop.list_price || 0,
    bedrooms: description.beds || 0,
    bathrooms: description.baths || 0,
    squareFeet: description.sqft || 0,
    lotSize: description.lot_sqft || null,
    yearBuilt: description.year_built || null,
    propertyType: normalizePropertyType(description.type || 'single_family'),
    status: 'active',
    description: description.text || '',
    features: JSON.stringify(prop.tags || []),
    images: prop.primary_photo?.href ? [prop.primary_photo.href] : [],
    virtualTourUrl: prop.virtual_tours?.[0]?.href || null,
    latitude: location_data.coordinate?.lat || null,
    longitude: location_data.coordinate?.lon || null,
    listingDate: prop.list_date ? new Date(prop.list_date) : new Date(),
    daysOnMarket: prop.days_on_mls || 0,
    mlsNumber: prop.mls?.id || null,
    listingUrl: prop.href || null,
    photoCount: prop.photo_count || 0,
    hoaFee: null,
    agentName: null,
    agentEmail: null,
    agentPhone: null,
    source: 'realty_in_us',
  };
}
