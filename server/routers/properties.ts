/**
 * Properties Router
 * API endpoints for property search and details
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import {
  searchProperties,
  getPropertyById,
  getPropertyImages,
  trackPropertyView,
  getPropertyViewCount,
  getSessionViewCount,
  getFeaturedPropertiesByLocation,
} from '../db-properties';
import {
  searchZillowProperties,
  getZillowPropertyDetails,
  searchZillowByCoordinates,
  exportPropertiesToJSON,
  exportPropertiesToCSV,
  zillowRateLimiter,
} from '../zillow-api';

export const propertiesRouter = router({
  /**
   * Search properties with filters
   */
  search: publicProcedure
    .input(
      z.object({
        location: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        bedrooms: z.number().optional(),
        bathrooms: z.number().optional(),
        propertyType: z.string().optional(),
        propertyTypes: z.array(z.string()).optional(),
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(24),
        sortBy: z.enum(['price', 'date', 'sqft']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        polygon: z.array(z.object({ lat: z.number(), lng: z.number() })).optional(),
      })
    )
    .query(async ({ input }) => {
      return await searchProperties(input);
    }),

  /**
   * Get property details by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const property = await getPropertyById(input.id);
      return property;
    }),

  /**
   * Get property images
   */
  getImages: publicProcedure
    .input(z.object({ propertyId: z.number() }))
    .query(async ({ input }) => {
      return await getPropertyImages(input.propertyId);
    }),

  /**
   * Track property view
   */
  trackView: publicProcedure
    .input(
      z.object({
        propertyId: z.number(),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await trackPropertyView(input.propertyId, input.sessionId);
    }),

  /**
   * Get property view count
   */
  getViewCount: publicProcedure
    .input(z.object({ propertyId: z.number() }))
    .query(async ({ input }) => {
      return await getPropertyViewCount(input.propertyId);
    }),

  /**
   * Get session view count
   */
  getSessionViewCount: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await getSessionViewCount(input.sessionId);
    }),

  /**
   * Get featured properties by location
   */
  getFeaturedByLocation: publicProcedure
    .input(
      z.object({
        city: z.string(),
        limit: z.number().default(6),
      })
    )
    .query(async ({ input }) => {
      return await getFeaturedPropertiesByLocation(input);
    }),

  /**
   * Get all available cities and zip codes for search dropdown
   */
  getAvailableLocations: publicProcedure
    .query(async () => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) return [];

      try {
        const [locations] = await db.query(`
          SELECT DISTINCT city, zip_code
          FROM properties
          WHERE city IS NOT NULL AND city != ''
          ORDER BY city ASC
        `);
        return locations || [];
      } catch (error) {
        console.error('Error fetching available locations:', error);
        return [];
      }
    }),

  /**
   * Search Zillow properties with enhanced filters
   * Supports status_type, home_type, price range, beds/baths
   */
  searchZillow: publicProcedure
    .input(
      z.object({
        location: z.string(),
        page: z.number().default(1),
        status_type: z.enum(['ForSale', 'ForRent', 'RecentlySold']).optional(),
        home_type: z.enum(['Houses', 'Townhomes', 'Condos', 'MultiFamily', 'Land', 'Mobile']).optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        bedsMin: z.number().optional(),
        bathsMin: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return await zillowRateLimiter.execute(() =>
        searchZillowProperties(input.location, input.page, {
          status_type: input.status_type,
          home_type: input.home_type,
          minPrice: input.minPrice,
          maxPrice: input.maxPrice,
          bedsMin: input.bedsMin,
          bathsMin: input.bathsMin,
        })
      );
    }),

  /**
   * Get Zillow property details with images
   */
  getZillowDetails: publicProcedure
    .input(z.object({ zpid: z.number() }))
    .query(async ({ input }) => {
      return await zillowRateLimiter.execute(() => getZillowPropertyDetails(input.zpid));
    }),

  /**
   * Search Zillow properties by coordinates
   */
  searchZillowByCoordinates: publicProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        radius: z.number().default(5),
        page: z.number().default(1),
      })
    )
    .query(async ({ input }) => {
      return await zillowRateLimiter.execute(() =>
        searchZillowByCoordinates(input.latitude, input.longitude, input.radius, input.page)
      );
    }),

  /**
   * Export properties to JSON for GHL import
   */
  exportPropertiesToJSON: publicProcedure
    .input(z.object({ properties: z.array(z.any()) }))
    .query(({ input }) => {
      return exportPropertiesToJSON(input.properties);
    }),

  /**
   * Export properties to CSV for GHL bulk import
   */
  exportPropertiesToCSV: publicProcedure
    .input(z.object({ properties: z.array(z.any()) }))
    .query(({ input }) => {
      return exportPropertiesToCSV(input.properties);
    }),
});
