/**
 * Analytics Router
 * API endpoints for lead scoring dashboard
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import {
  getTopProperties,
  getPropertyMetrics,
  getImportSuccessRates,
  getMarketAnalytics,
  getHotMarkets,
  getPropertyLeadScores,
  getDailyMetricsSummary,
  getLeadQualityDistribution,
  getConversionFunnel,
  getAlerts,
  getDashboardSummary,
} from '../db-analytics';

export const analyticsRouter = router({
  /**
   * Get dashboard summary with key metrics
   */
  getDashboardSummary: publicProcedure.query(async () => {
    return await getDashboardSummary();
  }),

  /**
   * Get top performing properties
   */
  getTopProperties: publicProcedure
    .input(
      z.object({
        limit: z.number().default(10).max(50),
        city: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getTopProperties(input.limit, input.city);
    }),

  /**
   * Get property metrics by ID
   */
  getPropertyMetrics: publicProcedure
    .input(z.object({ propertyId: z.number() }))
    .query(async ({ input }) => {
      return await getPropertyMetrics(input.propertyId);
    }),

  /**
   * Get import success rates
   */
  getImportSuccessRates: publicProcedure
    .input(
      z.object({
        days: z.number().default(30).max(365),
      })
    )
    .query(async ({ input }) => {
      return await getImportSuccessRates(input.days);
    }),

  /**
   * Get market analytics for a city
   */
  getMarketAnalytics: publicProcedure
    .input(
      z.object({
        city: z.string(),
        state: z.string().default('FL'),
      })
    )
    .query(async ({ input }) => {
      return await getMarketAnalytics(input.city, input.state);
    }),

  /**
   * Get hot markets ranking
   */
  getHotMarkets: publicProcedure
    .input(
      z.object({
        limit: z.number().default(10).max(50),
      })
    )
    .query(async ({ input }) => {
      return await getHotMarkets(input.limit);
    }),

  /**
   * Get lead scores for a property
   */
  getPropertyLeadScores: publicProcedure
    .input(
      z.object({
        propertyId: z.number(),
        limit: z.number().default(20).max(100),
      })
    )
    .query(async ({ input }) => {
      return await getPropertyLeadScores(input.propertyId, input.limit);
    }),

  /**
   * Get daily metrics summary
   */
  getDailyMetricsSummary: publicProcedure
    .input(
      z.object({
        days: z.number().default(30).max(365),
      })
    )
    .query(async ({ input }) => {
      return await getDailyMetricsSummary(input.days);
    }),

  /**
   * Get lead quality distribution
   */
  getLeadQualityDistribution: publicProcedure
    .input(
      z.object({
        days: z.number().default(30).max(365),
      })
    )
    .query(async ({ input }) => {
      return await getLeadQualityDistribution(input.days);
    }),

  /**
   * Get conversion funnel data
   */
  getConversionFunnel: publicProcedure
    .input(
      z.object({
        days: z.number().default(30).max(365),
      })
    )
    .query(async ({ input }) => {
      return await getConversionFunnel(input.days);
    }),

  /**
   * Get alerts
   */
  getAlerts: publicProcedure
    .input(
      z.object({
        limit: z.number().default(20).max(100),
        severity: z.enum(['info', 'warning', 'critical']).optional(),
      })
    )
    .query(async ({ input }) => {
      return await getAlerts(input.limit, input.severity);
    }),
});
