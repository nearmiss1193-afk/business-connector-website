import { z } from "zod";
import { eq, sql, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { properties, propertyReports } from "../../drizzle/schema";

/**
 * Admin Router
 * Procedures for managing properties and reports (admin-only)
 */

export const adminRouter = router({
  // Get verification statistics
  getVerificationStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const stats = await db
      .select({
        total: sql<number>`count(*)`,
        active: sql<number>`sum(case when ${properties.isActive} = true then 1 else 0 end)`,
        offMarket: sql<number>`sum(case when ${properties.verificationStatus} = 'off_market' then 1 else 0 end)`,
        flagged: sql<number>`sum(case when ${properties.verificationStatus} = 'flagged' then 1 else 0 end)`,
        reported: sql<number>`sum(case when ${properties.verificationStatus} = 'reported' then 1 else 0 end)`,
        verified: sql<number>`sum(case when ${properties.verificationStatus} = 'verified' then 1 else 0 end)`,
      })
      .from(properties);

    const pendingReports = await db
      .select({ count: sql<number>`count(*)` })
      .from(propertyReports)
      .where(eq(propertyReports.status, "pending"));

    return {
      properties: stats[0],
      pendingReports: pendingReports[0].count,
    };
  }),

  // Get properties by verification status
  getPropertiesByStatus: adminProcedure
    .input(
      z.object({
        status: z.enum(["active", "off_market", "flagged", "reported", "verified"]),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const results = await db
        .select({
          id: properties.id,
          mlsId: properties.mlsId,
          address: properties.address,
          city: properties.city,
          state: properties.state,
          zipCode: properties.zipCode,
          price: properties.price,
          bedrooms: properties.bedrooms,
          bathrooms: properties.bathrooms,
          sqft: properties.sqft,
          propertyType: properties.propertyType,
          primaryImage: properties.primaryImage,
          verificationStatus: properties.verificationStatus,
          isActive: properties.isActive,
          lastSeenAt: properties.lastSeenAt,
          flaggedReason: properties.flaggedReason,
          flaggedAt: properties.flaggedAt,
          updatedAt: properties.updatedAt,
        })
        .from(properties)
        .where(eq(properties.verificationStatus, input.status))
        .orderBy(desc(properties.updatedAt))
        .limit(input.limit)
        .offset(input.offset);

      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(properties)
        .where(eq(properties.verificationStatus, input.status));

      return {
        properties: results,
        total: total[0].count,
        hasMore: input.offset + results.length < total[0].count,
      };
    }),

  // Flag a property
  flagProperty: adminProcedure
    .input(
      z.object({
        propertyId: z.number(),
        reason: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .update(properties)
        .set({
          verificationStatus: "flagged",
          flaggedReason: input.reason,
          flaggedAt: new Date(),
          flaggedBy: ctx.user.openId,
          updatedAt: new Date(),
        })
        .where(eq(properties.id, input.propertyId));

      return { success: true };
    }),

  // Unflag a property (mark as verified)
  unflagProperty: adminProcedure
    .input(z.object({ propertyId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .update(properties)
        .set({
          verificationStatus: "verified",
          isActive: true,
          flaggedReason: null,
          flaggedAt: null,
          flaggedBy: null,
          updatedAt: new Date(),
        })
        .where(eq(properties.id, input.propertyId));

      return { success: true };
    }),

  // Delete a property
  deleteProperty: adminProcedure
    .input(z.object({ propertyId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.delete(properties).where(eq(properties.id, input.propertyId));

      return { success: true };
    }),

  // Get property reports
  getPropertyReports: adminProcedure
    .input(
      z.object({
        status: z.enum(["pending", "reviewing", "resolved", "dismissed"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const whereClause = input.status ? eq(propertyReports.status, input.status) : undefined;

      const results = await db
        .select()
        .from(propertyReports)
        .where(whereClause)
        .orderBy(desc(propertyReports.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(propertyReports)
        .where(whereClause);

      return {
        reports: results,
        total: total[0].count,
        hasMore: input.offset + results.length < total[0].count,
      };
    }),

  // Update report status
  updateReportStatus: adminProcedure
    .input(
      z.object({
        reportId: z.number(),
        status: z.enum(["reviewing", "resolved", "dismissed"]),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .update(propertyReports)
        .set({
          status: input.status,
          adminNotes: input.adminNotes,
          reviewedBy: ctx.user.openId,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(propertyReports.id, input.reportId));

      return { success: true };
    }),
});
