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

// Central Florida and surrounding areas - expanded list for maximum listings
const CENTRAL_FLORIDA_CITIES = [
  // Major Tampa Bay Area
  "Tampa, FL",
  "St. Petersburg, FL",
  "Clearwater, FL",
  "Largo, FL",
  "Pinellas Park, FL",
  "Bradenton, FL",
  "Sarasota, FL",
  "Lakeland, FL",
  "Winter Haven, FL",
  "Plant City, FL",
  
  // Major Orlando Area
  "Orlando, FL",
  "Winter Park, FL",
  "Kissimmee, FL",
  "Altamonte Springs, FL",
  "Sanford, FL",
  "Deland, FL",
  "Daytona Beach, FL",
  "Port Orange, FL",
  "Deltona, FL",
  "Apopka, FL",
  "Oviedo, FL",
  "Longwood, FL",
  "Casselberry, FL",
  
  // Southwest Florida
  "Naples, FL",
  "Fort Myers, FL",
  "Cape Coral, FL",
  "Lehigh Acres, FL",
  "Bonita Springs, FL",
  "Estero, FL",
  "Immokalee, FL",
  
  // Additional surrounding areas
  "Ocala, FL",
  "Leesburg, FL",
  "The Villages, FL",
  "Eustis, FL",
  "Tavares, FL",
  "Wildwood, FL",
  "Sebring, FL",
  "Avon Park, FL",
  "Lake Wales, FL",
  "Bartow, FL",
  "Arcadia, FL",
  "Punta Gorda, FL",
  "Port Charlotte, FL",
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
      const propertyId = existing[0].id;
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
      
      // Clear old images before adding new ones
      await db.query(`DELETE FROM property_images WHERE property_id = ?`, [propertyId]);
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

      // Insert images (extract URL from image objects)
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          // Handle both string URLs and image objects with url property
          const imageUrl = typeof images[i] === 'string' ? images[i] : images[i]?.url || images[i]?.src;
          if (imageUrl) {
            await db.query(
              `INSERT INTO property_images (property_id, image_url, \`order\`) VALUES (?, ?, ?)`,
              [result.insertId, imageUrl, i]
            );
          }
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
  const maxPages = 999; // Fetch ALL available pages until API returns no results

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

      // Rate limiting - 1 second between requests (optimized for speed while respecting API limits)
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

    // Rate limiting between cities - 5 seconds to avoid throttling
    await new Promise((resolve) => setTimeout(resolve, 5000));
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
