import { eq, and, desc, gte, lte, isNull, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  agentSubscriptions,
  leads,
  leadPurchases,
  agentProfiles,
  payments,
  leadQualityRules,
  agentLeadLimits,
  leadNotifications,
  InsertAgentSubscription,
  InsertLead,
  InsertLeadPurchase,
  InsertAgentProfile,
  InsertPayment,
  InsertLeadQualityRule,
  InsertAgentLeadLimit,
  InsertLeadNotification,
} from "../drizzle/schema-revenue";

/**
 * AGENT SUBSCRIPTIONS
 */
export async function createAgentSubscription(data: InsertAgentSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(agentSubscriptions).values(data);
  return result;
}

export async function getAgentSubscription(agentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(agentSubscriptions)
    .where(eq(agentSubscriptions.agentId, agentId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateAgentSubscription(
  subscriptionId: number,
  updates: Partial<InsertAgentSubscription>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(agentSubscriptions)
    .set(updates)
    .where(eq(agentSubscriptions.id, subscriptionId));
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(agentSubscriptions)
    .where(eq(agentSubscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

/**
 * LEADS
 */
export async function createLead(data: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(leads).values(data);
  return result;
}

export async function getLead(leadId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getLeadsByType(leadType: string, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(leads)
    .where(eq(leads.leadType, leadType as any))
    .orderBy(desc(leads.createdAt))
    .limit(limit)
    .offset(offset);
  
  return result;
}

export async function getAvailableLeads(leadType: string, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(leads)
    .where(
      and(
        eq(leads.leadType, leadType as any),
        eq(leads.isPurchased, false),
        eq(leads.status, "new")
      )
    )
    .orderBy(desc(leads.qualityScore), desc(leads.createdAt))
    .limit(limit);
  
  return result;
}

export async function updateLead(leadId: number, updates: Partial<InsertLead>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(leads)
    .set(updates)
    .where(eq(leads.id, leadId));
}

/**
 * LEAD PURCHASES
 */
export async function createLeadPurchase(data: InsertLeadPurchase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(leadPurchases).values(data);
  return result;
}

export async function getLeadPurchase(purchaseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(leadPurchases)
    .where(eq(leadPurchases.id, purchaseId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getAgentLeadPurchases(agentId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(leadPurchases)
    .where(eq(leadPurchases.agentId, agentId))
    .orderBy(desc(leadPurchases.createdAt))
    .limit(limit)
    .offset(offset);
  
  return result;
}

export async function updateLeadPurchase(
  purchaseId: number,
  updates: Partial<InsertLeadPurchase>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(leadPurchases)
    .set(updates)
    .where(eq(leadPurchases.id, purchaseId));
}

/**
 * AGENT PROFILES
 */
export async function createAgentProfile(data: InsertAgentProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(agentProfiles).values(data);
  return result;
}

export async function getAgentProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(agentProfiles)
    .where(eq(agentProfiles.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateAgentProfile(
  profileId: number,
  updates: Partial<InsertAgentProfile>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(agentProfiles)
    .set(updates)
    .where(eq(agentProfiles.id, profileId));
}

export async function getVerifiedAgents(limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(agentProfiles)
    .where(eq(agentProfiles.isVerified, true))
    .orderBy(desc(agentProfiles.averageRating))
    .limit(limit);
  
  return result;
}

/**
 * PAYMENTS
 */
export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(payments).values(data);
  return result;
}

export async function getPayment(paymentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getPaymentByStripeId(stripePaymentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.stripePaymentId, stripePaymentId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getAgentPayments(agentId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.agentId, agentId))
    .orderBy(desc(payments.createdAt))
    .limit(limit)
    .offset(offset);
  
  return result;
}

export async function updatePayment(paymentId: number, updates: Partial<InsertPayment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(payments)
    .set(updates)
    .where(eq(payments.id, paymentId));
}

/**
 * LEAD QUALITY RULES
 */
export async function createLeadQualityRule(data: InsertLeadQualityRule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(leadQualityRules).values(data);
  return result;
}

export async function getLeadQualityRules(leadType: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(leadQualityRules)
    .where(
      and(
        eq(leadQualityRules.leadType, leadType as any),
        eq(leadQualityRules.isActive, true)
      )
    )
    .orderBy(desc(leadQualityRules.weight));
  
  return result;
}

/**
 * AGENT LEAD LIMITS
 */
export async function getAgentLeadLimit(agentId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(agentLeadLimits)
    .where(
      and(
        eq(agentLeadLimits.agentId, agentId),
        eq(agentLeadLimits.year, year),
        eq(agentLeadLimits.month, month)
      )
    )
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function createOrUpdateAgentLeadLimit(
  agentId: number,
  year: number,
  month: number,
  maxAllowed: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getAgentLeadLimit(agentId, year, month);
  
  if (existing) {
    await db
      .update(agentLeadLimits)
      .set({ maxAllowed })
      .where(eq(agentLeadLimits.id, existing.id));
  } else {
    await db.insert(agentLeadLimits).values({
      agentId,
      year,
      month,
      maxAllowed,
      leadsPurchased: 0,
    });
  }
}

export async function incrementLeadsPurchased(agentId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getAgentLeadLimit(agentId, year, month);
  
  if (existing) {
    await db
      .update(agentLeadLimits)
      .set({ leadsPurchased: existing.leadsPurchased + 1 })
      .where(eq(agentLeadLimits.id, existing.id));
  }
}

/**
 * LEAD NOTIFICATIONS
 */
export async function createLeadNotification(data: InsertLeadNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(leadNotifications).values(data);
  return result;
}

export async function getLeadNotifications(leadId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(leadNotifications)
    .where(eq(leadNotifications.leadId, leadId));
  
  return result;
}

/**
 * ANALYTICS & REPORTING
 */
export async function getAgentStats(agentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const profile = await getAgentProfile(agentId);
  const subscription = await getAgentSubscription(agentId);
  const purchases = await db
    .select({ count: sql`COUNT(*)` })
    .from(leadPurchases)
    .where(eq(leadPurchases.agentId, agentId));
  
  const totalSpent = await db
    .select({ total: sql`SUM(${payments.amount})` })
    .from(payments)
    .where(
      and(
        eq(payments.agentId, agentId),
        eq(payments.status, "succeeded")
      )
    );
  
  return {
    profile,
    subscription,
    leadsPurchased: purchases[0]?.count || 0,
    totalSpent: totalSpent[0]?.total || 0,
  };
}

export async function getPlatformStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const totalLeads = await db
    .select({ count: sql`COUNT(*)` })
    .from(leads);
  
  const totalPurchases = await db
    .select({ count: sql`COUNT(*)` })
    .from(leadPurchases);
  
  const totalRevenue = await db
    .select({ total: sql`SUM(${payments.amount})` })
    .from(payments)
    .where(eq(payments.status, "succeeded"));
  
  const activeSubscriptions = await db
    .select({ count: sql`COUNT(*)` })
    .from(agentSubscriptions)
    .where(eq(agentSubscriptions.status, "active"));
  
  return {
    totalLeads: totalLeads[0]?.count || 0,
    totalPurchases: totalPurchases[0]?.count || 0,
    totalRevenue: totalRevenue[0]?.total || 0,
    activeSubscriptions: activeSubscriptions[0]?.count || 0,
  };
}
