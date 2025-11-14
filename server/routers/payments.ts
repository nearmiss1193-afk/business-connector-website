import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createAgentSubscription,
  getAgentSubscription,
  updateAgentSubscription,
  createLeadPurchase,
  getLeadPurchase,
  getAgentLeadPurchases,
  updateLeadPurchase,
  createPayment,
  getAgentPayments,
  updatePayment,
  getAgentStats,
  getPlatformStats,
  getAvailableLeads,
  getAgentLeadLimit,
  createOrUpdateAgentLeadLimit,
  incrementLeadsPurchased,
  createLeadNotification,
} from "../db-revenue";
import {
  createStripeSubscription,
  createLeadPurchasePaymentIntent,
  getOrCreateStripeCustomer,
  cancelStripeSubscription,
  refundPayment,
} from "../stripe-webhooks";
import { getUserByOpenId } from "../db";
import { notifyOwner } from "../_core/notification";

const SUBSCRIPTION_PRICES = {
  starter: process.env.STRIPE_PRICE_STARTER || "price_starter",
  professional: process.env.STRIPE_PRICE_PROFESSIONAL || "price_professional",
  premium: process.env.STRIPE_PRICE_PREMIUM || "price_premium",
};

const LEAD_PRICES = {
  buyer: 10,
  seller: 15,
  mortgage: 12,
};

export const paymentRouter = router({
  /**
   * SUBSCRIPTIONS
   */
  createSubscription: protectedProcedure
    .input(
      z.object({
        planType: z.enum(["starter", "professional", "premium"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) throw new Error("Not authenticated");

      try {
        // Get or create Stripe customer
        const stripeCustomer = await getOrCreateStripeCustomer(
          user.id,
          user.email ?? "",
          user.name ?? undefined
        );

        // Create Stripe subscription
        const stripeSubscription = await createStripeSubscription(
          stripeCustomer.id,
          SUBSCRIPTION_PRICES[input.planType] ?? "price_starter",
          {
            userId: user.id.toString(),
            planType: input.planType,
          }
        );

        // Create subscription in database
        const monthlyPrices = {
          starter: 199,
          professional: 299,
          premium: 449,
        };

        await createAgentSubscription({
          agentId: user.id,
          planType: input.planType as any,
          monthlyPrice: monthlyPrices[input.planType].toString() as any,
          stripeSubscriptionId: stripeSubscription.id,
          status: "active",
        });

        // Create payment record
        await createPayment({
          agentId: user.id,
          paymentType: "subscription",
          amount: monthlyPrices[input.planType].toString() as any,
          currency: "USD",
          stripePaymentId: stripeSubscription.id,
          status: "pending",
        });

        await notifyOwner({
          title: "New Subscription",
          content: `Agent ${user.name} subscribed to ${input.planType} plan`,
        });

        return {
          success: true,
          subscription: stripeSubscription,
          clientSecret: (stripeSubscription.latest_invoice as any)?.payment_intent?.client_secret,
        };
      } catch (error) {
        console.error("[Payment] Error creating subscription:", error);
        throw error;
      }
    }),

  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (!user) throw new Error("Not authenticated");

    try {
      const subscription = await getAgentSubscription(user.id);
      return subscription;
    } catch (error) {
      console.error("[Payment] Error getting subscription:", error);
      throw error;
    }
  }),

  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx.user;
    if (!user) throw new Error("Not authenticated");

    try {
      const subscription = await getAgentSubscription(user.id);
      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new Error("No active subscription found");
      }

      // Cancel in Stripe
      await cancelStripeSubscription(subscription.stripeSubscriptionId);

      // Update in database
      await updateAgentSubscription(subscription.id, {
        status: "cancelled",
        cancelledAt: new Date(),
      });

      await notifyOwner({
        title: "Subscription Cancelled",
        content: `Agent ${user.name} cancelled ${subscription.planType} subscription`,
      });

      return { success: true };
    } catch (error) {
      console.error("[Payment] Error cancelling subscription:", error);
      throw error;
    }
  }),

  /**
   * LEAD PURCHASES
   */
  purchaseLead: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) throw new Error("Not authenticated");

      try {
        // Get lead
        const lead = await (async () => {
          const { leads } = await import("../db-revenue");
          const db = await (await import("../db")).getDb();
          if (!db) throw new Error("Database not available");
          const result = await db.select().from(leads).where(
            (await import("drizzle-orm")).eq(leads.id, input.leadId)
          );
          return result[0] || null;
        })();

        if (!lead) throw new Error("Lead not found");
        if (lead.isPurchased) throw new Error("Lead already purchased");

        // Check lead limit
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const limit = await getAgentLeadLimit(user.id, year, month);
        if (limit && limit.leadsPurchased >= limit.maxAllowed) {
          throw new Error("Monthly lead purchase limit reached");
        }

        // Get price
        const price = LEAD_PRICES[lead.leadType as keyof typeof LEAD_PRICES] || 10;

        // Get or create Stripe customer
        const stripeCustomer = await getOrCreateStripeCustomer(
          user.id,
          user.email ?? "",
          user.name ?? undefined
        );

        // Create payment intent
        const paymentIntent = await createLeadPurchasePaymentIntent(
          stripeCustomer.id,
          price,
          input.leadId,
          user.id
        );

        // Create lead purchase record
        const leadPurchase = await createLeadPurchase({
          leadId: input.leadId,
          agentId: user.id,
          leadType: lead.leadType as any,
          price: price.toString() as any,
          stripePaymentIntentId: paymentIntent.id,
          paymentStatus: "pending",
        });

        // Create payment record
        await createPayment({
          agentId: user.id,
          paymentType: "lead_purchase",
          amount: price.toString() as any,
          currency: "USD",
          stripePaymentId: paymentIntent.id,
          leadPurchaseId: leadPurchase[0]?.insertId as any,
          status: "pending",
        });

        return {
          success: true,
          clientSecret: paymentIntent.client_secret,
          leadPurchaseId: leadPurchase[0]?.insertId,
        };
      } catch (error) {
        console.error("[Payment] Error purchasing lead:", error);
        throw error;
      }
    }),

  getLeadPurchases: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) throw new Error("Not authenticated");

      try {
        const purchases = await getAgentLeadPurchases(user.id, input.limit, input.offset);
        return purchases;
      } catch (error) {
        console.error("[Payment] Error getting lead purchases:", error);
        throw error;
      }
    }),

  confirmLeadPurchase: protectedProcedure
    .input(
      z.object({
        leadPurchaseId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) throw new Error("Not authenticated");

      try {
        const leadPurchase = await getLeadPurchase(input.leadPurchaseId);
        if (!leadPurchase) throw new Error("Lead purchase not found");
        if (leadPurchase.agentId !== user.id) throw new Error("Unauthorized");

        // Update lead purchase
        await updateLeadPurchase(input.leadPurchaseId, {
          paymentStatus: "succeeded",
          deliveredAt: new Date(),
        });

        // Increment lead limit
        const now = new Date();
        await incrementLeadsPurchased(user.id, now.getFullYear(), now.getMonth() + 1);

        await notifyOwner({
          title: "Lead Purchased",
          content: `Agent ${user.name} purchased a ${leadPurchase.leadType} lead`,
        });

        return { success: true };
      } catch (error) {
        console.error("[Payment] Error confirming lead purchase:", error);
        throw error;
      }
    }),

  refundLeadPurchase: protectedProcedure
    .input(
      z.object({
        leadPurchaseId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) throw new Error("Not authenticated");

      try {
        const leadPurchase = await getLeadPurchase(input.leadPurchaseId);
        if (!leadPurchase) throw new Error("Lead purchase not found");
        if (leadPurchase.agentId !== user.id) throw new Error("Unauthorized");

        // Refund in Stripe
        if (leadPurchase.stripePaymentIntentId) {
          await refundPayment(leadPurchase.stripePaymentIntentId);
        }

        // Update lead purchase
        await updateLeadPurchase(input.leadPurchaseId, {
          paymentStatus: "refunded",
        });

        // Update payment
        const payment = await (async () => {
          const { payments } = await import("../db-revenue");
          const db = await (await import("../db")).getDb();
          if (!db) throw new Error("Database not available");
          const result = await db.select().from(payments).where(
            (await import("drizzle-orm")).eq(
              payments.stripePaymentId,
              leadPurchase.stripePaymentIntentId
            )
          );
          return result[0] || null;
        })();

        if (payment) {
          await updatePayment(payment.id, {
            status: "refunded",
            refundReason: input.reason,
            refundedAmount: leadPurchase.price as any,
            refundedAt: new Date(),
          });
        }

        return { success: true };
      } catch (error) {
        console.error("[Payment] Error refunding lead purchase:", error);
        throw error;
      }
    }),

  /**
   * ANALYTICS
   */
  getAgentStats: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (!user) throw new Error("Not authenticated");

    try {
      const stats = await getAgentStats(user.id);
      return stats;
    } catch (error) {
      console.error("[Payment] Error getting agent stats:", error);
      throw error;
    }
  }),

  getPlatformStats: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (!user) throw new Error("Not authenticated");

    // Only admins can view platform stats
    if (user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    try {
      const stats = await getPlatformStats();
      return stats;
    } catch (error) {
      console.error("[Payment] Error getting platform stats:", error);
      throw error;
    }
  }),

  getPaymentHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) throw new Error("Not authenticated");

      try {
        const payments = await getAgentPayments(user.id, input.limit, input.offset);
        return payments;
      } catch (error) {
        console.error("[Payment] Error getting payment history:", error);
        throw error;
      }
    }),
});
