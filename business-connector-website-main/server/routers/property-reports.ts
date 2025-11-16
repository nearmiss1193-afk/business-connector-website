import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { propertyReports, properties } from "../../drizzle/schema";
import { notifyOwner } from "../_core/notification";

/**
 * Property Reports Router
 * Public procedures for users to report inaccurate listings
 */

export const propertyReportsRouter = router({
  // Submit a property report
  submitReport: publicProcedure
    .input(
      z.object({
        propertyId: z.number(),
        mlsId: z.string(),
        reportType: z.enum([
          "sold",
          "off_market",
          "wrong_price",
          "wrong_details",
          "wrong_address",
          "duplicate",
          "spam",
          "other",
        ]),
        description: z.string().min(10).max(1000),
        reporterName: z.string().min(1).max(200).optional(),
        reporterEmail: z.string().email().max(320).optional(),
        reporterPhone: z.string().max(20).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Insert report
      const [report] = await db
        .insert(propertyReports)
        .values({
          propertyId: input.propertyId,
          mlsId: input.mlsId,
          reportType: input.reportType,
          description: input.description,
          reporterName: input.reporterName,
          reporterEmail: input.reporterEmail,
          reporterPhone: input.reporterPhone,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .$returningId();

      // Mark property as reported
      await db
        .update(properties)
        .set({
          verificationStatus: "reported",
          updatedAt: new Date(),
        })
        .where(eq(properties.id, input.propertyId));

      // Notify owner
      try {
        await notifyOwner({
          title: "New Property Report",
          content: `A user reported an issue with property ${input.mlsId}:\n\nType: ${input.reportType}\nDescription: ${input.description}\n\nReporter: ${input.reporterName || "Anonymous"}\nEmail: ${input.reporterEmail || "N/A"}`,
        });
      } catch (error) {
        console.error("Failed to send notification:", error);
        // Don't fail the request if notification fails
      }

      return { success: true, reportId: report.id };
    }),
});
