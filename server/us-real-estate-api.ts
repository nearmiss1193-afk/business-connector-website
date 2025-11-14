import { ENV } from './_core/env';

/**
 * US Real Estate Listings API Integration via RapidAPI
 * API: https://rapidapi.com/apimaker/api/us-real-estate-listings
 */

const RAPIDAPI_HOST = 'us-real-estate-listings.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

interface PropertyListing {
  property_id: string;
  listing_id?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  lot_sqft?: number;
  year_built?: number;
  property_type: string;
  status: string;
  description?: string;
  photos?: string[];
  virtual_tour?: string;
  latitude?: number;
  longitude?: number;
  agent_name?: string;
  agent_email?: string;
  agent_phone?: string;
  list_date?: string;
  hoa_fee?: number;
}

/**
 * Get property listings for sale in a specific location
 */
export async function getPropertiesForSale(
  location: string,
  limit: number = 200,
  offset: number = 0
): Promise<any[]> {
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY is not configured');
  }

  const url = new URL(`https://${RAPIDAPI_HOST}/sale`);
  url.searchParams.append('location', location);
  url.searchParams.append('limit', limit.toString());
  url.searchParams.append('offset', offset.toString());

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      throw new Error(`US Real Estate API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data.results || [];
  } catch (error) {
    console.error('[US Real Estate API] Get properties for sale failed:', error);
    throw error;
  }
}

/**
 * Get property details by property ID
 */
export async function getPropertyDetails(propertyId: string): Promise<any | null> {
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY is not configured');
  }

  const url = `https://${RAPIDAPI_HOST}/property-detail?property_id=${propertyId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      throw new Error(`US Real Estate API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('[US Real Estate API] Get property details failed:', error);
    return null;
  }
}

/**
 * Get property photos
 */
export async function getPropertyPhotos(propertyId: string): Promise<string[]> {
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY is not configured');
  }

  const url = `https://${RAPIDAPI_HOST}/property-photos?property_id=${propertyId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch photos for property ${propertyId}`);
      return [];
    }

    const data = await response.json();
    return data.photos || [];
  } catch (error) {
    console.error('[US Real Estate API] Get property photos failed:', error);
    return [];
  }
}

/**
 * Fetch all properties for Central Florida cities
 */
export async function fetchAllFloridaProperties(): Promise<any[]> {
  const locations = [
    'Tampa, FL',
    'Orlando, FL',
    'St. Petersburg, FL',
    'Kissimmee, FL',
    'Lakeland, FL',
    'Daytona Beach, FL',
  ];
  
  const allProperties: any[] = [];

  for (const location of locations) {
    console.log(`[US Real Estate API] Fetching properties for ${location}...`);
    
    try {
      const properties = await getPropertiesForSale(location, 200, 0);
      allProperties.push(...properties);
      console.log(`[US Real Estate API] Found ${properties.length} properties in ${location}`);
      
      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[US Real Estate API] Failed to fetch properties for ${location}:`, error);
    }
  }

  return allProperties;
}

/**
 * Map US Real Estate API property to our database schema
 */
export function mapUSRealEstatePropertyToDb(property: any) {
  const propertyTypeMap: Record<string, string> = {
    'single family': 'single_family',
    'condo': 'condo',
    'townhouse': 'townhouse',
    'multi family': 'multi_family',
    'land': 'land',
    'commercial': 'commercial',
  };

  const rawPropertyType = property.property_type || property.type || 'Single Family';
  const propertyType = (propertyTypeMap[rawPropertyType.toLowerCase()] || 'single_family') as 'single_family' | 'condo' | 'townhouse' | 'multi_family' | 'land' | 'commercial' | 'other';

  return {
    mlsId: property.property_id || property.listing_id || `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    address: property.address || property.full_address || '',
    city: property.city || '',
    state: property.state || property.state_code || 'FL',
    zipCode: property.zip_code || property.postal_code || '',
    price: (property.price || property.list_price || 0).toString(),
    bedrooms: property.beds || property.bedrooms || 0,
    bathrooms: (property.baths || property.bathrooms || 0).toString(),
    sqft: property.sqft || property.square_feet || property.building_size || 0,
    lotSize: property.lot_sqft || property.lot_size || null,
    yearBuilt: property.year_built || null,
    propertyType: propertyType,
    listingStatus: 'active' as const,
    description: property.description || property.remarks || '',
    features: JSON.stringify(property.features || []),
    amenities: JSON.stringify([]),
    virtualTourUrl: property.virtual_tour || property.virtual_tour_url || null,
    latitude: (property.latitude || property.lat)?.toString() || null,
    longitude: (property.longitude || property.lon || property.lng)?.toString() || null,
    listingDate: property.list_date ? new Date(property.list_date) : new Date(),
    hoaFee: property.hoa_fee || property.hoa || null,
    listingAgentName: property.agent_name || property.agent?.name || null,
    listingAgentEmail: property.agent_email || property.agent?.email || null,
    listingAgentPhone: property.agent_phone || property.agent?.phone || null,
    source: 'us-real-estate',
    images: property.photos || [],
  };
}
