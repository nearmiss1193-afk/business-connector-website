import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { syncMLSData, getLastSyncStatus } from '../mls-sync';
import { testConnection } from '../simplyrets';

/**
 * MLS Management Router
 * 
 * Provides endpoints for managing MLS data synchronization
 */

export const mlsRouter = router({
  /**
   * Test connection to SimplyRETS API
   */
  testConnection: protectedProcedure.query(async () => {
    return await testConnection();
  }),

  /**
   * Manually trigger MLS sync
   */
  syncNow: protectedProcedure
    .input(
      z.object({
        cities: z.array(z.string()).optional(),
        forceFullSync: z.boolean().optional(),
      }).optional()
    )
    .mutation(async ({ input }) => {
      const result = await syncMLSData(input);
      return result;
    }),

  /**
   * Get last sync status
   */
  getLastSync: publicProcedure.query(async () => {
    return await getLastSyncStatus();
  }),

  /**
   * Get sync history
   */
  getSyncHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { getDb } = await import('../db');
      const { mlsSyncLog } = await import('../../drizzle/schema');
      
      const db = await getDb();
      if (!db) {
        return [];
      }

      const logs = await db
        .select()
        .from(mlsSyncLog)
        .orderBy(mlsSyncLog.syncDate)
        .limit(input?.limit || 10);

      return logs;
    }),
});
