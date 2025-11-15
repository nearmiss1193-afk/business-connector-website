/**
 * Property Database Helpers
 * Query functions for property listings
 */

import { and, eq, gte, lte, sql, desc, asc } from 'drizzle-orm';
import { getDb } from './db';
import { properties, propertyImages, propertyViews } from '../drizzle/schema';

/**
 * Point-in-polygon algorithm (ray casting)
 */
function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: Array<{ lat: number; lng: number }>
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}

interface PropertySearchParams {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  propertyTypes?: string[];
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'date' | 'sqft';
  sortOrder?: 'asc' | 'desc';
  polygon?: Array<{ lat: number; lng: number }>;
}

/**
 * Search properties with filters
 */
export async function searchProperties(params: PropertySearchParams) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const {
    location,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    propertyType,
    propertyTypes,
    status = 'active',
    page = 1,
    limit = 24,
    sortBy = 'date',
    sortOrder = 'desc',
    polygon,
  } = params;

  // Build WHERE conditions
  const conditions = [];

  // Status filter (default to active listings)
  conditions.push(eq(properties.listingStatus, status as any));

  // Location filter (search city, state, or zip)
  if (location) {
    conditions.push(
      sql`(${properties.city} LIKE ${`%${location}%`} OR ${properties.zipCode} LIKE ${`%${location}%`})`
    );
  }

  // Price range
  if (minPrice !== undefined) {
    conditions.push(gte(properties.price, minPrice.toString()));
  }
  if (maxPrice !== undefined) {
    conditions.push(lte(properties.price, maxPrice.toString()));
  }

  // Bedrooms (minimum)
  if (bedrooms !== undefined) {
    conditions.push(gte(properties.bedrooms, bedrooms));
  }

  // Bathrooms (minimum)
  if (bathrooms !== undefined) {
    conditions.push(gte(properties.bathrooms, bathrooms.toString()));
  }

  // Property type (single)
  if (propertyType && propertyType !== 'any') {
    conditions.push(eq(properties.propertyType, propertyType as any));
  }
  
  // Property types (multiple)
  if (propertyTypes && propertyTypes.length > 0) {
    const typeConditions = propertyTypes.map(type => 
      eq(properties.propertyType, type.toUpperCase().replace(' ', '_') as any)
    );
    conditions.push(sql`(${sql.join(typeConditions, sql` OR `)})`);
  }
  
  // Polygon boundary filter
  if (polygon && polygon.length > 0) {
    // Use point-in-polygon algorithm
    // For each property, check if its lat/lng is inside the polygon
    const polygonCondition = sql`(
      ${properties.latitude} IS NOT NULL AND ${properties.longitude} IS NOT NULL
    )`;
    conditions.push(polygonCondition);
  }

  // Count total matching properties
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(properties)
    .where(and(...conditions));

  const total = Number(countResult[0]?.count || 0);

  // Determine sort column
  let sortColumn;
  switch (sortBy) {
    case 'price':
      sortColumn = properties.price;
      break;
    case 'sqft':
      sortColumn = properties.sqft;
      break;
    default:
      sortColumn = properties.listingDate;
  }

  // Fetch properties
  const offset = (page - 1) * limit;
  let results = await db
    .select()
    .from(properties)
    .where(and(...conditions))
    .orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn))
    .limit(polygon ? limit * 3 : limit) // Fetch more if polygon filtering
    .offset(offset);
  
  // Client-side polygon filtering (point-in-polygon algorithm)
  if (polygon && polygon.length > 0) {
    results = results.filter(property => {
      if (!property.latitude || !property.longitude) return false;
      return isPointInPolygon(
        { lat: parseFloat(property.latitude), lng: parseFloat(property.longitude) },
        polygon
      );
    }).slice(0, limit); // Limit after filtering
  }

  // Fetch first image for each property from property_images table
  const resultsWithImages = await Promise.all(
    results.map(async (property) => {
      const images = await db
        .select({ imageUrl: propertyImages.imageUrl })
        .from(propertyImages)
        .where(eq(propertyImages.propertyId, property.id))
        .orderBy(asc(propertyImages.order))
        .limit(1);
      
      return {
        ...property,
        firstImage: images[0]?.imageUrl || property.primaryImage || null,
      };
    })
  );

  // Count properties with virtual tours
  const virtualToursResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(properties)
    .where(and(...conditions, eq(properties.hasVirtualTour, true)));

  const virtualTours = Number(virtualToursResult[0]?.count || 0);

  return {
    items: resultsWithImages as any,
    total,
    virtualTours,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get property by ID
 */
export async function getPropertyById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const result = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * Get property images
 */
export async function getPropertyImages(propertyId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  return await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, propertyId))
    .orderBy(asc(propertyImages.order));
}

/**
 * Track property view
 */
export async function trackPropertyView(
  propertyId: number,
  sessionId?: string,
  userId?: number
) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  await db.insert(propertyViews).values({
    propertyId,
    sessionId,
    userId,
  });
}

/**
 * Get property view count
 */
export async function getPropertyViewCount(propertyId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(propertyViews)
    .where(eq(propertyViews.propertyId, propertyId));

  return Number(result[0]?.count || 0);
}

/**
 * Get session view count (for lead capture trigger)
 */
export async function getSessionViewCount(sessionId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(propertyViews)
    .where(eq(propertyViews.sessionId, sessionId));

  return Number(result[0]?.count || 0);
}

/**
 * Insert sample property data (for testing)
 */
export async function insertSampleProperties() {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const sampleProperties = [
    {
      mlsId: 'FL-12345',
      address: '598 Maple St',
      city: 'Kissimmee',
      state: 'FL',
      zipCode: '33051',
      price: '573141',
      bedrooms: 5,
      bathrooms: '1',
      sqft: 2818,
      propertyType: 'single_family' as const,
      listingStatus: 'active' as const,
      hasVirtualTour: true,
      primaryImage: '/properties/pQT9duRUSVYo.jpg',
      description: 'Beautiful single family home in Kissimmee',
      source: 'sample',
    },
    {
      mlsId: 'FL-12346',
      address: '509 Lake St',
      city: 'St. Petersburg',
      state: 'FL',
      zipCode: '33738',
      price: '676636',
      bedrooms: 4,
      bathrooms: '3.5',
      sqft: 3252,
      propertyType: 'single_family' as const,
      listingStatus: 'active' as const,
      hasVirtualTour: true,
      primaryImage: '/properties/u6HH8jmpUmkq.jpg',
      description: 'Stunning waterfront property',
      source: 'sample',
    },
    {
      mlsId: 'FL-12347',
      address: '1234 Ocean Drive',
      city: 'Tampa',
      state: 'FL',
      zipCode: '33602',
      price: '425000',
      bedrooms: 3,
      bathrooms: '2',
      sqft: 1850,
      propertyType: 'condo' as const,
      listingStatus: 'active' as const,
      hasVirtualTour: false,
      primaryImage: '/properties/arjke2OFY0a8.jpg',
      description: 'Modern condo in downtown Tampa',
      source: 'sample',
    },
    {
      mlsId: 'FL-12348',
      address: '789 Pine Avenue',
      city: 'Orlando',
      state: 'FL',
      zipCode: '32801',
      price: '895000',
      bedrooms: 5,
      bathrooms: '4',
      sqft: 4200,
      propertyType: 'single_family' as const,
      listingStatus: 'active' as const,
      hasVirtualTour: true,
      primaryImage: '/properties/WmndaT1fqgzG.jpg',
      description: 'Luxury home with pool in Orlando',
      source: 'sample',
    },
  ];

  for (const property of sampleProperties) {
    await db.insert(properties).values(property).onDuplicateKeyUpdate({
      set: { updatedAt: new Date() },
    });
  }

  console.log('✅ Sample properties inserted');
}

/**
 * Get featured properties based on user location
 * Returns properties under specified price near the user's city
 */
export async function getFeaturedPropertiesByLocation(params: {
  city?: string;
  maxPrice?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const { city, maxPrice = 500000, limit = 8 } = params;

  // Build WHERE conditions
  const conditions = [
    eq(properties.listingStatus, 'active' as any),
    lte(properties.price, maxPrice.toString()),
  ];

  // If city is provided, filter by city
  if (city) {
    conditions.push(
      sql`${properties.city} LIKE ${`%${city}%`}`
    );
  }

  // Get properties
  const results = await db
    .select()
    .from(properties)
    .where(and(...conditions))
    .orderBy(desc(properties.createdAt))
    .limit(limit);

  return {
    properties: results,
    city: city || 'Central Florida',
  };
}
