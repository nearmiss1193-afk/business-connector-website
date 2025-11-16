import { ENV } from './_core/env';

/**
 * SimplyRETS MLS Integration Service
 * 
 * This service connects to SimplyRETS API to fetch live property listings
 * and sync them to our database.
 * 
 * Setup Instructions:
 * 1. Sign up at https://simplyrets.com
 * 2. Get your API credentials
 * 3. Add to environment variables:
 *    - SIMPLYRETS_USERNAME
 *    - SIMPLYRETS_PASSWORD
 * 
 * For testing, use demo credentials:
 *    - Username: simplyrets
 *    - Password: simplyrets
 */

const SIMPLYRETS_API_BASE = 'https://api.simplyrets.com';

interface SimplyRETSProperty {
  mlsId: string;
  listPrice: number;
  listDate: string;
  address: {
    full: string;
    streetNumber: string;
    streetName: string;
    unit?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  geo: {
    lat: number;
    lng: number;
  };
  property: {
    bedrooms: number;
    bathsFull: number;
    bathsHalf: number;
    area: number;
    type: string;
    subType?: string;
    style?: string;
    yearBuilt?: number;
    stories?: number;
    parking?: {
      spaces?: number;
      description?: string;
    };
    lotSize?: number;
  };
  photos?: string[];
  remarks?: string;
  association?: {
    fee?: number;
    frequency?: string;
  };
  mls: {
    status: string;
    statusText?: string;
    daysOnMarket?: number;
  };
  virtualTourUrl?: string;
  school?: {
    elementarySchool?: string;
    middleSchool?: string;
    highSchool?: string;
  };
}

/**
 * Get API credentials from environment or use demo credentials
 */
function getCredentials() {
  const username = process.env.SIMPLYRETS_USERNAME || 'simplyrets';
  const password = process.env.SIMPLYRETS_PASSWORD || 'simplyrets';
  return { username, password };
}

/**
 * Make authenticated request to SimplyRETS API
 */
async function simplyRETSRequest<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  const { username, password } = getCredentials();
  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  
  const url = new URL(`${SIMPLYRETS_API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`SimplyRETS API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch all properties from SimplyRETS
 */
export async function fetchAllProperties(options?: {
  limit?: number;
  offset?: number;
  cities?: string[];
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  status?: 'Active' | 'Pending' | 'Closed';
}): Promise<SimplyRETSProperty[]> {
  const params: Record<string, any> = {
    limit: options?.limit || 500,
    offset: options?.offset || 0,
  };

  if (options?.cities) {
    params.cities = options.cities.join(',');
  }
  if (options?.minPrice) {
    params.minprice = options.minPrice;
  }
  if (options?.maxPrice) {
    params.maxprice = options.maxPrice;
  }
  if (options?.minBeds) {
    params.minbeds = options.minBeds;
  }
  if (options?.maxBeds) {
    params.maxbeds = options.maxBeds;
  }
  if (options?.status) {
    params.status = options.status;
  }

  return simplyRETSRequest<SimplyRETSProperty[]>('/properties', params);
}

/**
 * Fetch single property by MLS ID
 */
export async function fetchPropertyByMlsId(mlsId: string): Promise<SimplyRETSProperty> {
  return simplyRETSRequest<SimplyRETSProperty>(`/properties/${mlsId}`);
}

/**
 * Map SimplyRETS property to our database format
 */
export function mapSimplyRETSProperty(srProperty: SimplyRETSProperty) {
  const totalBaths = srProperty.property.bathsFull + (srProperty.property.bathsHalf * 0.5);
  
  return {
    mlsId: srProperty.mlsId,
    address: srProperty.address.full,
    city: srProperty.address.city,
    state: srProperty.address.state,
    zipCode: srProperty.address.postalCode,
    latitude: srProperty.geo.lat,
    longitude: srProperty.geo.lng,
    price: srProperty.listPrice,
    bedrooms: srProperty.property.bedrooms,
    bathrooms: totalBaths,
    squareFeet: srProperty.property.area,
    lotSize: srProperty.property.lotSize || null,
    yearBuilt: srProperty.property.yearBuilt || null,
    propertyType: mapPropertyType(srProperty.property.type),
    description: srProperty.remarks || 'Stunning property',
    features: buildFeaturesList(srProperty),
    images: srProperty.photos || [],
    virtualTourUrl: srProperty.virtualTourUrl || null,
    status: mapStatus(srProperty.mls.status),
    listingDate: new Date(srProperty.listDate),
    daysOnMarket: srProperty.mls.daysOnMarket || 0,
    hoaFee: srProperty.association?.fee || null,
    hoaFrequency: srProperty.association?.frequency || null,
    parking: srProperty.property.parking?.spaces || null,
    parkingDescription: srProperty.property.parking?.description || null,
  };
}

/**
 * Map SimplyRETS property type to our enum
 */
function mapPropertyType(type: string): string {
  const typeMap: Record<string, string> = {
    'RES': 'Single Family',
    'CND': 'Condo',
    'TWN': 'Townhouse',
    'MFH': 'Multi-Family',
    'LOT': 'Land',
    'COM': 'Commercial',
  };
  return typeMap[type] || 'Single Family';
}

/**
 * Map MLS status to our enum
 */
function mapStatus(status: string): 'active' | 'pending' | 'sold' | 'off_market' {
  const statusMap: Record<string, 'active' | 'pending' | 'sold' | 'off_market'> = {
    'Active': 'active',
    'Pending': 'pending',
    'Closed': 'sold',
    'Expired': 'off_market',
    'Withdrawn': 'off_market',
  };
  return statusMap[status] || 'active';
}

/**
 * Build features list from property data
 */
function buildFeaturesList(srProperty: SimplyRETSProperty): string[] {
  const features: string[] = [];
  
  if (srProperty.property.yearBuilt) {
    features.push(`Built in ${srProperty.property.yearBuilt}`);
  }
  if (srProperty.property.stories) {
    features.push(`${srProperty.property.stories} Story`);
  }
  if (srProperty.property.parking?.spaces) {
    features.push(`${srProperty.property.parking.spaces} Car Garage`);
  }
  if (srProperty.property.lotSize) {
    features.push(`${srProperty.property.lotSize.toLocaleString()} sqft Lot`);
  }
  if (srProperty.virtualTourUrl) {
    features.push('Virtual Tour Available');
  }
  if (srProperty.association?.fee) {
    features.push(`HOA: $${srProperty.association.fee}/${srProperty.association.frequency || 'month'}`);
  }
  
  return features;
}

/**
 * Test connection to SimplyRETS API
 */
export async function testConnection(): Promise<{ success: boolean; message: string; sampleCount?: number }> {
  try {
    const properties = await fetchAllProperties({ limit: 1 });
    return {
      success: true,
      message: 'Successfully connected to SimplyRETS API',
      sampleCount: properties.length,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
