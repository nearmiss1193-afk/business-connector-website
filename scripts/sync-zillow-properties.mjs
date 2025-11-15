/**
 * Zillow Property Sync Script
 * Fetches properties from Zillow API and populates the database
 * Uses mlsId field to store Zillow ZPID
 */

import mysql from "mysql2/promise";
import { createConnection } from "mysql2/promise";

const RAPIDAPI_HOST = "zillow-com1.p.rapidapi.com";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

if (!RAPIDAPI_KEY) {
  console.error("❌ RAPIDAPI_KEY environment variable not set");
  process.exit(1);
}

// Central Florida cities to sync
const CENTRAL_FLORIDA_CITIES = [
  "Tampa, FL",
  "Orlando, FL",
  "St. Petersburg, FL",
  "Lakeland, FL",
  "Clearwater, FL",
  "Winter Park, FL",
  "Daytona Beach, FL",
  "Port Orange, FL",
  "Sarasota, FL",
  "Bradenton, FL",
  "Naples, FL",
  "Fort Myers, FL",
  "Cape Coral, FL",
  "Kissimmee, FL",
  "Winter Haven, FL",
  "Ocala, FL",
  "Leesburg, FL",
  "Deland, FL",
  "Sanford, FL",
  "Altamonte Springs, FL",
];

let db;

async function connectDB() {
  try {
    // Parse DATABASE_URL
    const dbUrl = new URL(process.env.DATABASE_URL);
    const config = {
      host: dbUrl.hostname,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.substring(1),
      ssl: {},
    };

    db = await createConnection(config);
    console.log(`✅ Connected to database at ${config.host}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

async function searchZillowProperties(location, page = 1) {
  try {
    const url = new URL("https://zillow-com1.p.rapidapi.com/propertyExtendedSearch");
    url.searchParams.append("location", location);
    url.searchParams.append("page", page.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": RAPIDAPI_HOST,
        "X-RapidAPI-Key": RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      console.warn(`⚠️  Search failed for ${location}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.props || [];
  } catch (error) {
    console.error(`❌ Error searching ${location}:`, error.message);
    return [];
  }
}

async function getPropertyImages(zpid) {
  try {
    const url = new URL("https://zillow-com1.p.rapidapi.com/images");
    url.searchParams.append("zpid", zpid.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": RAPIDAPI_HOST,
        "X-RapidAPI-Key": RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.images || [];
  } catch (error) {
    console.error(`❌ Error fetching images for zpid ${zpid}:`, error.message);
    return [];
  }
}

async function insertProperty(property, images) {
  try {
    // Extract city from address if not provided
    let city = property.city || "";
    if (!city && property.address) {
      const parts = property.address.split(",");
      if (parts.length >= 2) {
        city = parts[1].trim();
      }
    }

    // Use zpid as mlsId for Zillow properties
    const mlsId = `ZILLOW-${property.zpid}`;

    // Check if property already exists
    const [existing] = await db.query("SELECT id FROM properties WHERE mls_id = ?", [mlsId]);

    const propertyData = {
      mlsId: mlsId,
      address: property.address || "",
      city: city,
      state: "FL",
      zipCode: property.zipcode || "",
      price: property.price || 0,
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      sqft: property.livingArea || 0,
      propertyType: normalizePropertyType(property.propertyType),
      latitude: property.latitude || 0,
      longitude: property.longitude || 0,
      listingStatus: normalizeListingStatus(property.listingStatus),
      primaryImage: property.imgSrc || "",
    };

    if (existing.length > 0) {
      // Update existing property
      await db.query(
        `UPDATE properties SET 
        price = ?, bedrooms = ?, bathrooms = ?, sqft = ?, 
        listing_status = ?, primary_image = ?
        WHERE mls_id = ?`,
        [
          propertyData.price,
          propertyData.bedrooms,
          propertyData.bathrooms,
          propertyData.sqft,
          propertyData.listingStatus,
          propertyData.primaryImage,
          propertyData.mlsId,
        ]
      );
    } else {
      // Insert new property
      const [result] = await db.query(
        `INSERT INTO properties (
        mls_id, address, city, state, zip_code, price, bedrooms, bathrooms, 
        sqft, property_type, latitude, longitude, listing_status, primary_image, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          propertyData.mlsId,
          propertyData.address,
          propertyData.city,
          propertyData.state,
          propertyData.zipCode,
          propertyData.price,
          propertyData.bedrooms,
          propertyData.bathrooms,
          propertyData.sqft,
          propertyData.propertyType,
          propertyData.latitude,
          propertyData.longitude,
          propertyData.listingStatus,
          propertyData.primaryImage,
          "zillow",
        ]
      );

      // Insert images
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await db.query(
            `INSERT INTO property_images (property_id, image_url, \`order\`) VALUES (?, ?, ?)`,
            [result.insertId, images[i], i]
          );
        }
      }
    }

    return true;
  } catch (error) {
    console.error(`❌ Error inserting property ${property.zpid}:`, error.message);
    return false;
  }
}

function normalizePropertyType(type) {
  if (!type) return "single_family";
  const normalized = type.toUpperCase();
  if (normalized.includes("CONDO")) return "condo";
  if (normalized.includes("TOWNHOUSE") || normalized.includes("TOWNHOME")) return "townhouse";
  if (normalized.includes("MULTI")) return "multi_family";
  if (normalized.includes("LAND")) return "land";
  if (normalized.includes("MOBILE")) return "other";
  return "single_family";
}

function normalizeListingStatus(status) {
  if (!status) return "active";
  const normalized = status.toUpperCase();
  if (normalized === "FOR_SALE") return "active";
  if (normalized === "SOLD") return "sold";
  if (normalized === "OFF_MARKET") return "off_market";
  if (normalized === "PENDING") return "pending";
  return "active";
}

async function syncCity(city) {
  console.log(`\n📍 Syncing ${city}...`);
  let totalProperties = 0;
  let successCount = 0;
  let page = 1;
  const maxPages = 5; // Fetch up to 5 pages per city

  while (page <= maxPages) {
    console.log(`  📄 Fetching page ${page}...`);

    const properties = await searchZillowProperties(city, page);
    if (properties.length === 0) {
      console.log(`  ✅ No more properties on page ${page}`);
      break;
    }

    totalProperties += properties.length;

    for (const property of properties) {
      // Get images for this property
      const images = await getPropertyImages(property.zpid);

      // Only insert if property has images
      if (images.length > 0) {
        const success = await insertProperty(property, images);
        if (success) {
          successCount++;
          console.log(`  ✅ ${property.address} (${images.length} images)`);
        }
      } else {
        console.log(`  ⏭️  Skipping ${property.address} (no images)`);
      }

      // Rate limiting - 1 second between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    page++;
  }

  console.log(
    `  ✅ Synced ${city}: ${totalProperties} properties found, ${successCount} inserted/updated`
  );
  return { total: totalProperties, success: successCount };
}

async function main() {
  console.log("🚀 Starting Zillow Property Sync");
  console.log(`📅 ${new Date().toISOString()}`);
  console.log(`🔑 Using RapidAPI Key: ${RAPIDAPI_KEY.substring(0, 10)}...`);

  await connectDB();

  let totalStats = { total: 0, success: 0 };

  for (const city of CENTRAL_FLORIDA_CITIES) {
    const stats = await syncCity(city);
    totalStats.total += stats.total;
    totalStats.success += stats.success;

    // Rate limiting between cities - 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Sync Summary");
  console.log("=".repeat(50));
  console.log(`Total properties found: ${totalStats.total}`);
  console.log(`Successfully synced: ${totalStats.success}`);
  console.log(`Skipped (no images): ${totalStats.total - totalStats.success}`);
  console.log("✅ Sync complete!");

  await db.end();
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
