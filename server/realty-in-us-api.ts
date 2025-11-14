import { ENV } from './_core/env';
import axios from 'axios';

/**
 * Realty in US API Integration via RapidAPI
 * API: https://rapidapi.com/datascraper/api/realty-in-us
 * This is the working API that previously fetched 7,948+ properties
 */

const RAPIDAPI_HOST = 'realty-in-us.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

/**
 * Normalize property type from API to database enum
 */
function normalizePropertyType(apiType: string): 'single_family' | 'condo' | 'townhouse' | 'multi_family' | 'land' | 'commercial' | 'other' {
  const type = (apiType || '').toLowerCase().trim();
  
  // Map API property types to database enum values
  const typeMap: Record<string, 'single_family' | 'condo' | 'townhouse' | 'multi_family' | 'land' | 'commercial' | 'other'> = {
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

interface RealtySearchParams {
  limit?: number;
  offset?: number;
  postal_code?: string;
  city?: string;
  state_code?: string;
  status?: string[];
  sort?: {
    direction: 'asc' | 'desc';
    field: string;
  };
}

/**
 * Search properties using Realty in US API
 */
export async function searchRealtyInUS(params: RealtySearchParams): Promise<any[]> {
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
    status: params.status || ['for_sale'],
    sort: params.sort || {
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
      console.log(`[Realty in US] Found ${results.length} properties`);
      return results;
    }

    return [];
  } catch (error) {
    console.error('[Realty in US API] Search failed:', error);
    throw error;
  }
}

/**
 * Fetch properties for all Central Florida cities
 */
export async function fetchAllFloridaProperties(): Promise<any[]> {
  const cities = [
    // Tampa Bay Area
    { city: 'Tampa', zip: '33602', region: 'Tampa Bay' },
    { city: 'St Petersburg', zip: '33701', region: 'Tampa Bay' },
    { city: 'Clearwater', zip: '33755', region: 'Tampa Bay' },
    
    // Lakeland / Polk County
    { city: 'Lakeland', zip: '33801', region: 'Polk County' },
    { city: 'Winter Haven', zip: '33880', region: 'Polk County' },
    
    // Orlando Area
    { city: 'Orlando', zip: '32801', region: 'Greater Orlando' },
    { city: 'Kissimmee', zip: '34741', region: 'Greater Orlando' },
    { city: 'Winter Park', zip: '32789', region: 'Greater Orlando' },
    
    // Daytona Beach Area
    { city: 'Daytona Beach', zip: '32114', region: 'Daytona Area' },
    { city: 'Port Orange', zip: '32127', region: 'Daytona Area' },
  ];
  
  const allProperties: any[] = [];

  for (const location of cities) {
    console.log(`[Realty in US] Fetching properties for ${location.city}, FL...`);
    
    try {
      const properties = await searchRealtyInUS({
        postal_code: location.zip,
        limit: 200,
        offset: 0,
      });
      
      // Add location context to each property
      const propertiesWithLocation = properties.map(prop => ({
        ...prop,
        _location: location,
      }));
      
      allProperties.push(...propertiesWithLocation);
      console.log(`[Realty in US] Found ${properties.length} properties in ${location.city}`);
      
      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[Realty in US] Failed to fetch properties for ${location.city}:`, error);
    }
  }

  console.log(`[Realty in US] Total properties fetched: ${allProperties.length}`);
  return allProperties;
}

/**
 * Map Realty in US API property to our database schema
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
    sqft: description.sqft || 0,
    lotSize: description.lot_sqft || null,
    yearBuilt: description.year_built || null,
    propertyType: normalizePropertyType(description.type || 'single_family'),
    listingStatus: 'active' as const,
    description: description.text || '',
    features: JSON.stringify(prop.tags || []),
    amenities: JSON.stringify([]),
    virtualTourUrl: prop.virtual_tours?.[0]?.href || null,
    latitude: location_data.coordinate?.lat?.toString() || null,
    longitude: location_data.coordinate?.lon?.toString() || null,
    listingDate: prop.list_date ? new Date(prop.list_date) : new Date(),
    hoaFee: null,
    listingAgentName: null,
    listingAgentEmail: null,
    listingAgentPhone: null,
    source: 'realty_in_us',
    images: prop.primary_photo?.href ? [prop.primary_photo.href] : [],
  };
}
