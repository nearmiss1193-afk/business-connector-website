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
        propertyTypes: z.array(z.string()).optional(), // Multiple property types
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(24),
        sortBy: z.enum(['price', 'date', 'sqft']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        polygon: z.array(z.object({ lat: z.number(), lng: z.number() })).optional(), // Drawn boundary
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
      if (!property) {
        throw new Error('Property not found');
      }

      const images = await getPropertyImages(input.id);
      const viewCount = await getPropertyViewCount(input.id);

      return {
        ...property,
        images,
        viewCount,
      };
    }),

  /**
   * Track property view (for analytics and lead capture trigger)
   */
  trackView: publicProcedure
    .input(
      z.object({
        propertyId: z.number(),
        sessionId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await trackPropertyView(input.propertyId, input.sessionId);

      // Get total views for this session
      const sessionViewCount = await getSessionViewCount(input.sessionId);

      return {
        success: true,
        sessionViewCount,
        shouldShowLeadCapture: sessionViewCount >= 3,
      };
    }),

  /**
   * Get featured properties based on user location
   * Returns properties under $500k near the user's city
   */
  getFeaturedByLocation: publicProcedure
    .input(
      z.object({
        city: z.string().optional(),
        maxPrice: z.number().default(500000),
        limit: z.number().default(8),
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
});
