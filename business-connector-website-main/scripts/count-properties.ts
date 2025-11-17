/**
 * Count Properties Script
 * Shows the total number of properties in the database
 */

import { getDb } from "../server/db";
import { properties } from "../drizzle/schema-properties";
import { count, eq } from "drizzle-orm";

async function countProperties() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("❌ Database connection failed");
      console.log("💡 To get property counts, you would need to:");
      console.log("   1. Set up DATABASE_URL environment variable");
      console.log("   2. Run this script in an environment with database access");
      console.log("   3. Or check the deployed API endpoints");
      return;
    }

    // Count total properties
    const [totalResult] = await db.select({ count: count() }).from(properties);
    const totalCount = totalResult.count;

    // Count active properties
    const [activeResult] = await db
      .select({ count: count() })
      .from(properties)
      .where(eq(properties.listing_status, "Active"));
    const activeCount = activeResult.count;

    // Count properties by status
    const statusCounts = await db
      .select({
        status: properties.listing_status,
        count: count(),
      })
      .from(properties)
      .groupBy(properties.listing_status);

    console.log("📊 Property Statistics:");
    console.log(`Total Properties: ${totalCount}`);
    console.log(`Active Listings: ${activeCount}`);

    console.log("\n🏠 Properties by Status:");
    statusCounts.forEach(({ status, count: statusCount }) => {
      console.log(`${status || 'Unknown'}: ${statusCount}`);
    });

  } catch (error) {
    console.error("❌ Error counting properties:", error);
  }
}

countProperties();