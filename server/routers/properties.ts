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
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(24),
        sortBy: z.enum(['price', 'date', 'sqft']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
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
});
