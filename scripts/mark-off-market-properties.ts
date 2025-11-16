import { eq, lt, sql } from "drizzle-orm";
import { getDb } from "../server/db";
import { properties } from "../drizzle/schema";

/**
 * Mark Off-Market Properties Script
 * 
 * This script identifies properties that haven't been seen in the API
 * for 7+ days and marks them as off-market.
 * 
 * Run this after each sync to clean up stale listings.
 */

async function markOffMarketProperties() {
  console.log("🔍 Checking for off-market properties...\n");

  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available");
    process.exit(1);
  }

  try {
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log(`📅 Marking properties not seen since: ${sevenDaysAgo.toISOString()}\n`);

    // Find properties that haven't been seen in 7+ days and are still marked as active
    const staleProperties = await db
      .select({
        id: properties.id,
        mlsId: properties.mlsId,
        address: properties.address,
        city: properties.city,
        lastSeenAt: properties.lastSeenAt,
      })
      .from(properties)
      .where(
        sql`${properties.lastSeenAt} < ${sevenDaysAgo} AND ${properties.isActive} = true`
      );

    if (staleProperties.length === 0) {
      console.log("✅ No off-market properties found. All listings are current!\n");
      return;
    }

    console.log(`⚠️  Found ${staleProperties.length} properties not seen in 7+ days\n`);

    // Show sample of properties being marked off-market
    console.log("Sample properties being marked off-market:");
    staleProperties.slice(0, 10).forEach((prop) => {
      const daysSince = Math.floor(
        (Date.now() - new Date(prop.lastSeenAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log(
        `  • ${prop.address}, ${prop.city} (MLS: ${prop.mlsId}) - Last seen ${daysSince} days ago`
      );
    });

    if (staleProperties.length > 10) {
      console.log(`  ... and ${staleProperties.length - 10} more\n`);
    } else {
      console.log("");
    }

    // Mark properties as off-market
    const result = await db
      .update(properties)
      .set({
        isActive: false,
        verificationStatus: "off_market",
        updatedAt: new Date(),
      })
      .where(
        sql`${properties.lastSeenAt} < ${sevenDaysAgo} AND ${properties.isActive} = true`
      );

    console.log(`✅ Marked ${staleProperties.length} properties as off-market\n`);

    // Get summary stats
    const stats = await db
      .select({
        total: sql<number>`count(*)`,
        active: sql<number>`sum(case when ${properties.isActive} = true then 1 else 0 end)`,
        offMarket: sql<number>`sum(case when ${properties.verificationStatus} = 'off_market' then 1 else 0 end)`,
        flagged: sql<number>`sum(case when ${properties.verificationStatus} = 'flagged' then 1 else 0 end)`,
        reported: sql<number>`sum(case when ${properties.verificationStatus} = 'reported' then 1 else 0 end)`,
      })
      .from(properties);

    console.log("📊 Database Summary:");
    console.log(`   Total properties: ${stats[0].total}`);
    console.log(`   Active listings: ${stats[0].active}`);
    console.log(`   Off-market: ${stats[0].offMarket}`);
    console.log(`   Flagged: ${stats[0].flagged}`);
    console.log(`   Reported: ${stats[0].reported}`);
    console.log("");

    console.log("✅ Cleanup complete!\n");
  } catch (error) {
    console.error("❌ Error marking off-market properties:", error);
    throw error;
  }
}

// Run the script
markOffMarketProperties()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
