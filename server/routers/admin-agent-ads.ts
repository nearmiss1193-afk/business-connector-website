import { z } from 'zod';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { protectedProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { getDb } from '../db';
import { agentAds, adClicks, adInquiries } from '../../drizzle/schema-agent-ads';

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const adminAgentAdsRouter = router({
  // List all agent ads with filtering
  listAds: adminProcedure
    .input(
      z.object({
        status: z.enum(['pending', 'active', 'paused', 'expired', 'rejected', 'all']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      const conditions = [];
      if (input.status && input.status !== 'all') {
        conditions.push(eq(agentAds.status, input.status));
      }

      const ads = await db
        .select()
        .from(agentAds)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(agentAds.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const total = await db.select({ count: agentAds.id }).from(agentAds);

      return {
        ads,
        total: total.length,
      };
    }),

  // Get single ad details
  getAd: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      const ad = await db.select().from(agentAds).where(eq(agentAds.id, input.id)).limit(1);
      if (ad.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Ad not found' });
      }

      // Get click stats
      const clicks = await db.select().from(adClicks).where(eq(adClicks.adId, input.id));

      return {
        ad: ad[0],
        clickStats: {
          total: clicks.length,
          last7Days: clicks.filter(c => c.clickedAt && c.clickedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
        },
      };
    }),

  // Create new ad
  createAd: adminProcedure
    .input(
      z.object({
        agentName: z.string().min(1),
        companyName: z.string().optional(),
        email: z.string().email(),
        phone: z.string().optional(),
        website: z.string().url().optional(),
        bannerImageUrl: z.string().url(),
        bannerTitle: z.string().optional(),
        bannerDescription: z.string().optional(),
        ctaText: z.string().default('Contact Agent'),
        ctaUrl: z.string().url().optional(),
        placement: z.enum(['sidebar', 'between_listings', 'property_detail', 'all']),
        position: z.number().default(0),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        status: z.enum(['pending', 'active', 'paused']).default('pending'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      const result = await db.insert(agentAds).values({
        ...input,
        approvedBy: ctx.user.id,
        approvedAt: input.status === 'active' ? new Date() : undefined,
      });

      return {
        success: true,
        adId: result[0].insertId,
      };
    }),

  // Update ad
  updateAd: adminProcedure
    .input(
      z.object({
        id: z.number(),
        agentName: z.string().min(1).optional(),
        companyName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        website: z.string().url().optional(),
        bannerImageUrl: z.string().url().optional(),
        bannerTitle: z.string().optional(),
        bannerDescription: z.string().optional(),
        ctaText: z.string().optional(),
        ctaUrl: z.string().url().optional(),
        placement: z.enum(['sidebar', 'between_listings', 'property_detail', 'all']).optional(),
        position: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        status: z.enum(['pending', 'active', 'paused', 'expired', 'rejected']).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      const { id, ...updates } = input;

      // If approving, set approval metadata
      if (updates.status === 'active') {
        Object.assign(updates, {
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
        });
      }

      await db.update(agentAds).set(updates).where(eq(agentAds.id, id));

      return { success: true };
    }),

  // Delete ad
  deleteAd: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      // Delete associated clicks
      await db.delete(adClicks).where(eq(adClicks.adId, input.id));

      // Delete ad
      await db.delete(agentAds).where(eq(agentAds.id, input.id));

      return { success: true };
    }),

  // List ad inquiries (agents interested in advertising)
  listInquiries: adminProcedure
    .input(
      z.object({
        status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost', 'all']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      const conditions = [];
      if (input.status && input.status !== 'all') {
        conditions.push(eq(adInquiries.status, input.status));
      }

      const inquiries = await db
        .select()
        .from(adInquiries)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(adInquiries.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return { inquiries };
    }),

  // Update inquiry status
  updateInquiryStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      await db.update(adInquiries).set({ status: input.status }).where(eq(adInquiries.id, input.id));

      return { success: true };
    }),

  // Get ad analytics
  getAnalytics: adminProcedure
    .input(
      z.object({
        adId: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      const conditions = [];
      if (input.adId) {
        conditions.push(eq(adClicks.adId, input.adId));
      }
      if (input.startDate) {
        conditions.push(gte(adClicks.clickedAt, input.startDate));
      }
      if (input.endDate) {
        conditions.push(lte(adClicks.clickedAt, input.endDate));
      }

      const clicks = await db
        .select()
        .from(adClicks)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      // Get all ads for summary
      const ads = await db.select().from(agentAds);

      return {
        totalImpressions: ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0),
        totalClicks: clicks.length,
        ctr: ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0) > 0
          ? (clicks.length / ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0)) * 100
          : 0,
        adPerformance: ads.map(ad => ({
          id: ad.id,
          agentName: ad.agentName,
          impressions: ad.impressions,
          clicks: ad.clicks,
          ctr: ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0,
        })),
      };
    }),
});
