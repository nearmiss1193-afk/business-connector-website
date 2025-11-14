import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  agentSubscriptions,
  agentProfiles,
  leads,
  leadPurchases,
  payments,
  agentLeadLimits,
  leadNotifications,
} from "../../drizzle/schema";
import { eq, and, or, gte, lte, desc, asc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Revenue Router
 * Handles agent subscriptions, lead marketplace, and payments
 */
export const revenueRouter = router({
  // ============ AGENT SUBSCRIPTIONS ============

  /**
   * Get agent's current subscription
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const subscription = await db
      .select()
      .from(agentSubscriptions)
      .where(
        and(
          eq(agentSubscriptions.agentId, ctx.user.id),
          eq(agentSubscriptions.status, "active")
        )
      )
      .limit(1);

    return subscription[0] || null;
  }),

  /**
   * Get available subscription plans
   */
  getPlans: publicProcedure.query(() => {
    return [
      {
        type: "starter",
        monthlyPrice: 199,
        name: "Starter",
        description: "Perfect for new agents",
        features: [
          "Basic profile listing",
          "5 featured properties",
          "Basic analytics",
          "Email support",
        ],
      },
      {
        type: "professional",
        monthlyPrice: 299,
        name: "Professional",
        description: "For growing agents",
        features: [
          "Enhanced profile",
          "15 featured properties",
          "Advanced analytics",
          "Lead priority queue",
          "Phone support",
        ],
      },
      {
        type: "premium",
        monthlyPrice: 449,
        name: "Premium",
        description: "For top agents",
        features: [
          "Premium profile",
          "Unlimited featured properties",
          "Full analytics suite",
          "Priority lead delivery",
          "Dedicated account manager",
        ],
      },
    ];
  }),

  // ============ LEAD MARKETPLACE ============

  /**
   * Get available leads for purchase
   */
  getAvailableLeads: protectedProcedure
    .input(
      z.object({
        leadType: z.enum(["buyer", "seller", "mortgage"]).optional(),
        qualityScore: z.enum(["hot", "warm", "cold"]).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Build query conditions
      const conditions = [eq(leads.isPurchased, false), eq(leads.status, "new")];

      if (input.leadType) {
        conditions.push(eq(leads.leadType, input.leadType));
      }
      if (input.qualityScore) {
        conditions.push(eq(leads.qualityScore, input.qualityScore));
      }

      const availableLeads = await db
        .select()
        .from(leads)
        .where(and(...conditions))
        .orderBy(desc(leads.qualityScore), desc(leads.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return availableLeads;
    }),

  /**
   * Get lead details (for preview before purchase)
   */
  getLeadDetails: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const lead = await db
        .select()
        .from(leads)
        .where(eq(leads.id, input.leadId))
        .limit(1);

      if (!lead[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lead not found",
        });
      }

      // Don't show full details if already purchased
      if (lead[0].isPurchased && lead[0].purchasedBy !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This lead has been purchased",
        });
      }

      return lead[0];
    }),

  /**
   * Get lead price based on type
   */
  getLeadPrice: publicProcedure
    .input(z.object({ leadType: z.enum(["buyer", "seller", "mortgage"]) }))
    .query(({ input }) => {
      const prices: Record<string, number> = {
        buyer: 10,
        seller: 15,
        mortgage: 12,
      };
      return prices[input.leadType] || 10;
    }),

  /**
   * Purchase a lead
   */
  purchaseLead: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
        stripePaymentIntentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Get the lead
      const lead = await db
        .select()
        .from(leads)
        .where(eq(leads.id, input.leadId))
        .limit(1);

      if (!lead[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lead not found",
        });
      }

      if (lead[0].isPurchased) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This lead has already been purchased",
        });
      }

      // Get lead price
      const prices: Record<string, number> = {
        buyer: 10,
        seller: 15,
        mortgage: 12,
      };
      const price = prices[lead[0].leadType] || 10;

      // Create lead purchase record
      const purchase = await db.insert(leadPurchases).values({
        leadId: input.leadId,
        agentId: ctx.user.id,
        leadType: lead[0].leadType as "buyer" | "seller" | "mortgage",
        price: price.toString(),
        stripePaymentIntentId: input.stripePaymentIntentId,
        paymentStatus: "succeeded",
        deliveredAt: new Date(),
      });

      // Update lead as purchased
      await db
        .update(leads)
        .set({
          isPurchased: true,
          purchasedBy: ctx.user.id,
          purchasedAt: new Date(),
          purchasePrice: price.toString(),
          status: "contacted",
        })
        .where(eq(leads.id, input.leadId));

      // Create payment record
      await db.insert(payments).values({
        agentId: ctx.user.id,
        paymentType: "lead_purchase",
        amount: price.toString(),
        stripePaymentId: input.stripePaymentIntentId,
        status: "succeeded",
        leadPurchaseId: purchase[0].insertId,
      });

      return {
        success: true,
        purchaseId: purchase[0].insertId,
        leadId: input.leadId,
      };
    }),

  /**
   * Get agent's purchased leads
   */
  getMyLeads: protectedProcedure
    .input(
      z.object({
        status: z.enum(["new", "contacted", "qualified", "converted", "lost"]).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const conditions = [eq(leads.purchasedBy, ctx.user.id)];

      if (input.status) {
        conditions.push(eq(leads.status, input.status));
      }

      const myLeads = await db
        .select()
        .from(leads)
        .where(and(...conditions))
        .orderBy(desc(leads.purchasedAt))
        .limit(input.limit)
        .offset(input.offset);

      return myLeads;
    }),

  /**
   * Update lead status
   */
  updateLeadStatus: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
        status: z.enum(["new", "contacted", "qualified", "converted", "lost"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Verify ownership
      const lead = await db
        .select()
        .from(leads)
        .where(eq(leads.id, input.leadId))
        .limit(1);

      if (!lead[0] || lead[0].purchasedBy !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this lead",
        });
      }

      await db
        .update(leads)
        .set({ status: input.status })
        .where(eq(leads.id, input.leadId));

      return { success: true };
    }),

  /**
   * Rate a purchased lead
   */
  rateLead: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
        rating: z.number().min(1).max(5),
        feedback: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Find the purchase record
      const purchase = await db
        .select()
        .from(leadPurchases)
        .where(
          and(
            eq(leadPurchases.leadId, input.leadId),
            eq(leadPurchases.agentId, ctx.user.id)
          )
        )
        .limit(1);

      if (!purchase[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lead purchase not found",
        });
      }

      await db
        .update(leadPurchases)
        .set({
          agentRating: input.rating,
          agentFeedback: input.feedback,
        })
        .where(eq(leadPurchases.id, purchase[0].id));

      return { success: true };
    }),

  // ============ AGENT PROFILE ============

  /**
   * Get agent profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const profile = await db
      .select()
      .from(agentProfiles)
      .where(eq(agentProfiles.userId, ctx.user.id))
      .limit(1);

    return profile[0] || null;
  }),

  /**
   * Update agent profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        companyName: z.string().optional(),
        licenseNumber: z.string().optional(),
        bio: z.string().optional(),
        website: z.string().optional(),
        phone: z.string().optional(),
        serviceAreas: z.array(z.string()).optional(),
        specialties: z.array(z.string()).optional(),
        yearsExperience: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Check if profile exists
      const existing = await db
        .select()
        .from(agentProfiles)
        .where(eq(agentProfiles.userId, ctx.user.id))
        .limit(1);

      if (existing[0]) {
        await db
          .update(agentProfiles)
          .set({
            companyName: input.companyName,
            licenseNumber: input.licenseNumber,
            bio: input.bio,
            website: input.website,
            phone: input.phone,
            serviceAreas: input.serviceAreas
              ? JSON.stringify(input.serviceAreas)
              : undefined,
            specialties: input.specialties
              ? JSON.stringify(input.specialties)
              : undefined,
            yearsExperience: input.yearsExperience,
          })
          .where(eq(agentProfiles.userId, ctx.user.id));
      } else {
        await db.insert(agentProfiles).values({
          userId: ctx.user.id,
          companyName: input.companyName,
          licenseNumber: input.licenseNumber,
          bio: input.bio,
          website: input.website,
          phone: input.phone,
          serviceAreas: input.serviceAreas
            ? JSON.stringify(input.serviceAreas)
            : null,
          specialties: input.specialties
            ? JSON.stringify(input.specialties)
            : null,
          yearsExperience: input.yearsExperience,
        });
      }

      return { success: true };
    }),

  // ============ AGENT STATS ============

  /**
   * Get agent statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    // Get subscription info
    const subscription = await db
      .select()
      .from(agentSubscriptions)
      .where(
        and(
          eq(agentSubscriptions.agentId, ctx.user.id),
          eq(agentSubscriptions.status, "active")
        )
      )
      .limit(1);

    // Get lead stats
    const leadStats = await db
      .select({
        total: sql<number>`COUNT(*)`,
        contacted: sql<number>`SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END)`,
        qualified: sql<number>`SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END)`,
        converted: sql<number>`SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END)`,
      })
      .from(leads)
      .where(eq(leads.purchasedBy, ctx.user.id));

    // Get payment stats
    const paymentStats = await db
      .select({
        totalSpent: sql<number>`SUM(amount)`,
        leadsCount: sql<number>`COUNT(CASE WHEN paymentType = 'lead_purchase' THEN 1 END)`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.agentId, ctx.user.id),
          eq(payments.status, "succeeded")
        )
      );

    return {
      subscription: subscription[0] || null,
      leads: {
        total: leadStats[0]?.total || 0,
        contacted: leadStats[0]?.contacted || 0,
        qualified: leadStats[0]?.qualified || 0,
        converted: leadStats[0]?.converted || 0,
      },
      payments: {
        totalSpent: paymentStats[0]?.totalSpent || 0,
        leadsCount: paymentStats[0]?.leadsCount || 0,
      },
    };
  }),
});
