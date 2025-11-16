import { z } from 'zod';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { publicProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { getDb } from '../db';
import { agentAds, adClicks, adInquiries } from '../../drizzle/schema-agent-ads';
import { handleFormSubmission } from '../gohighlevel';

export const agentAdsPublicRouter = router({
  // Get active ads for a specific placement
  getAds: publicProcedure
    .input(
      z.object({
        placement: z.enum(['sidebar', 'between_listings', 'property_detail', 'all']),
        limit: z.number().min(1).max(10).default(3),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      const now = new Date();

      const ads = await db
        .select()
        .from(agentAds)
        .where(
          and(
            eq(agentAds.status, 'active'),
            // Check placement matches or is 'all'
            sql`(${agentAds.placement} = ${input.placement} OR ${agentAds.placement} = 'all')`,
            // Check date range
            sql`(${agentAds.startDate} IS NULL OR ${agentAds.startDate} <= ${now})`,
            sql`(${agentAds.endDate} IS NULL OR ${agentAds.endDate} >= ${now})`
          )
        )
        .orderBy(agentAds.position)
        .limit(input.limit);

      return { ads };
    }),

  // Track ad impression
  trackImpression: publicProcedure
    .input(z.object({ adId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      // Increment impression count
      await db
        .update(agentAds)
        .set({ impressions: sql`${agentAds.impressions} + 1` })
        .where(eq(agentAds.id, input.adId));

      return { success: true };
    }),

  // Track ad click
  trackClick: publicProcedure
    .input(
      z.object({
        adId: z.number(),
        pageUrl: z.string().optional(),
        propertyId: z.number().optional(),
        referrer: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      // Get IP and user agent from request
      const ipAddress = ctx.req.ip || ctx.req.headers['x-forwarded-for'] || ctx.req.socket.remoteAddress;
      const userAgent = ctx.req.headers['user-agent'];

      // Record click
      await db.insert(adClicks).values({
        adId: input.adId,
        pageUrl: input.pageUrl,
        propertyId: input.propertyId,
        referrer: input.referrer,
        ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress?.[0],
        userAgent,
      });

      // Increment click count
      await db
        .update(agentAds)
        .set({ clicks: sql`${agentAds.clicks} + 1` })
        .where(eq(agentAds.id, input.adId));

      return { success: true };
    }),

  // Submit agent inquiry (lead for Business Conector)
  submitInquiry: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(10),
        companyName: z.string().optional(),
        message: z.string().optional(),
        interestedPackage: z.enum(['starter', 'professional', 'premium', 'custom']).optional(),
        budget: z.string().optional(),
        adId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      // Split name into first and last
      const nameParts = input.name.trim().split(' ');
      const firstName = nameParts[0] || input.name;
      const lastName = nameParts.slice(1).join(' ') || '';

      // Submit to GoHighLevel (Business Conector pipeline)
      const ghlResult = await handleFormSubmission({
        firstName,
        lastName,
        email: input.email,
        phone: input.phone,
        companyName: input.companyName,
        message: input.message,
        interestedPackage: input.interestedPackage,
        budget: input.budget,
        source: 'centralfloridahomes.com - Agent Advertising Inquiry',
      });

      // Store inquiry in database
      await db.insert(adInquiries).values({
        adId: input.adId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        companyName: input.companyName,
        message: input.message,
        interestedPackage: input.interestedPackage,
        budget: input.budget,
        sentToGHL: ghlResult.success,
        ghlContactId: ghlResult.contactId,
        status: 'new',
      });

      return {
        success: true,
        message: 'Thank you for your interest! We will contact you shortly.',
      };
    }),
});
