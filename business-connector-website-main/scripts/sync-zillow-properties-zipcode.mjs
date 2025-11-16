/**
 * Zillow Property Sync Script - Zip Code Edition
 * Fetches properties from Zillow API by zip code for maximum coverage
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

// Central Florida zip codes - organized by region for comprehensive coverage
const CENTRAL_FLORIDA_ZIP_CODES = [
  // Tampa Bay Area (33xxx)
  "33602", "33603", "33604", "33605", "33606", "33607", "33609", "33610",
  "33611", "33612", "33613", "33614", "33615", "33616", "33617", "33618",
  "33619", "33620", "33621", "33622", "33623", "33624", "33625", "33626",
  "33629", "33634", "33635", "33637", "33647", "33660", "33672", "33673",
  "33674", "33675", "33677", "33679", "33680", "33681", "33682", "33684",
  "33685", "33686", "33687", "33688", "33689", "33694", "33701", "33702",
  "33703", "33704", "33705", "33706", "33707", "33710", "33711", "33712",
  "33713", "33714", "33715", "33716", "33730", "33731", "33732", "33733",
  "33734", "33735", "33736", "33740", "33741", "33742", "33743", "33744",
  "33755", "33756", "33757", "33758", "33759", "33760", "33761", "33762",
  "33763", "33764", "33765", "33766", "33767", "33770", "33771", "33772",
  "33773", "33774", "33775", "33776", "33777", "33778", "33779", "33780",
  "33781", "33782", "33783", "33784", "33785", "33786", "33787", "33801",
  "33803", "33805", "33806", "33807", "33809", "33810", "33811", "33812",
  "33813", "33815", "33823", "33830", "33831", "33835", "33837", "33839",
  "33840", "33841", "33843", "33844", "33847", "33849", "33850", "33851",
  "33852", "33853", "33854", "33855", "33856", "33857", "33858", "33859",
  "33860", "33861", "33862", "33863", "33864", "33865", "33866", "33867",
  "33868", "33869", "33870", "33871", "33872", "33873", "33874", "33875",
  "33876", "33877", "33878", "33879", "33880", "33881", "33882", "33883",
  "33884", "33885", "33886", "33887", "33888", "33889", "33890", "33891",
  "33896", "33897", "33898", "33899",
  
  // Orlando Area (32xxx)
  "32801", "32802", "32803", "32804", "32805", "32806", "32807", "32808",
  "32809", "32810", "32811", "32812", "32814", "32815", "32816", "32817",
  "32818", "32819", "32820", "32821", "32822", "32824", "32825", "32826",
  "32827", "32828", "32829", "32830", "32831", "32832", "32833", "32834",
  "32835", "32836", "32837", "32839", "32853", "32854", "32855", "32856",
  "32857", "32858", "32859", "32860", "32861", "32862", "32867", "32868",
  "32869", "32872", "32877", "32878", "32887", "32891", "32896", "32897",
  "32898", "32899",
  
  // Clermont Area (34711, 34712, 34713, 34714, 34715, 34716, 34717, 34718, 34719)
  "34711", "34712", "34713", "34714", "34715", "34716", "34717", "34718", "34719",
  
  // Daytona/Volusia (32xxx)
  "32114", "32115", "32116", "32117", "32118", "32119", "32120", "32121",
  "32122", "32123", "32124", "32125", "32126", "32127", "32128", "32129",
  "32130", "32131", "32132", "32133", "32134", "32135", "32136", "32137",
  "32138", "32139", "32140", "32141", "32142", "32143", "32144", "32145",
  "32146", "32147", "32148", "32149", "32150", "32151", "32152", "32153",
  "32154", "32155", "32156", "32157", "32158", "32159", "32160", "32161",
  "32162", "32163", "32164", "32165", "32166", "32167", "32168", "32169",
  "32170", "32171", "32172", "32173", "32174", "32175", "32176", "32177",
  "32178", "32179", "32180", "32181", "32182", "32183", "32184", "32185",
  "32186", "32187", "32188", "32189", "32190", "32191", "32192", "32193",
  "32194", "32195", "32196", "32197", "32198", "32199",
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
      if (response.status === 429) {
        console.warn(`⚠️  Rate limited for ${location} page ${page}, waiting 5 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return searchZillowProperties(location, page); // Retry
      }
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
      
      // Insert ALL images for this property with duplicate prevention
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          // Handle both string URLs and image objects with url property
          const imageUrl = typeof images[i] === 'string' ? images[i] : images[i]?.url || images[i]?.src;
          if (imageUrl) {
            try {
              // Check if this exact image URL is already used by a DIFFERENT property
              const [existingImage] = await db.query(
                `SELECT property_id FROM property_images WHERE image_url = ? AND property_id != ? LIMIT 1`,
                [imageUrl, propertyId]
              );
              
              // Only insert if this image is not used by another property
              if (existingImage.length === 0) {
                await db.query(
                  `INSERT INTO property_images (property_id, image_url, \`order\`) VALUES (?, ?, ?)`,
                  [propertyId, imageUrl, i]
                );
              }
            } catch (imgError) {
              console.warn(`  ⚠️  Error inserting image for property ${propertyId}: ${imgError.message}`);
            }
          }
        }
      }
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

      // Insert ALL images for this property with duplicate prevention
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          // Handle both string URLs and image objects with url property
          const imageUrl = typeof images[i] === 'string' ? images[i] : images[i]?.url || images[i]?.src;
          if (imageUrl) {
            try {
              // Check if this exact image URL is already used by a DIFFERENT property
              const [existingImage] = await db.query(
                `SELECT property_id FROM property_images WHERE image_url = ? AND property_id != ? LIMIT 1`,
                [imageUrl, result.insertId]
              );
              
              // Only insert if this image is not used by another property
              if (existingImage.length === 0) {
                await db.query(
                  `INSERT INTO property_images (property_id, image_url, \`order\`) VALUES (?, ?, ?)`,
                  [result.insertId, imageUrl, i]
                );
              }
            } catch (imgError) {
              console.warn(`  ⚠️  Error inserting image for property ${result.insertId}: ${imgError.message}`);
            }
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

async function syncZipCode(zipCode) {
  console.log(`\n📍 Syncing ${zipCode}...`);
  let totalProperties = 0;
  let successCount = 0;
  let page = 1;
  const maxPages = 999; // Fetch ALL available pages until API returns no results

  while (page <= maxPages) {
    console.log(`  📄 Fetching page ${page}...`);

    const properties = await searchZillowProperties(zipCode, page);
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

      // Rate limiting - 500ms between properties (optimized for speed while respecting API limits)
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    page++;
  }

  console.log(
    `  ✅ Synced ${zipCode}: ${totalProperties} properties found, ${successCount} inserted/updated`
  );
  return { total: totalProperties, success: successCount };
}

async function main() {
  console.log("🚀 Starting Zillow Property Sync (Zip Code Edition)");
  console.log(`📅 ${new Date().toISOString()}`);
  console.log(`🔑 Using RapidAPI Key: ${RAPIDAPI_KEY.substring(0, 10)}...`);

  await connectDB();

  let totalSynced = 0;
  let totalSuccess = 0;

  for (const zipCode of CENTRAL_FLORIDA_ZIP_CODES) {
    const result = await syncZipCode(zipCode);
    totalSynced += result.total;
    totalSuccess += result.success;
    
    // Rate limiting between zip codes - 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Sync Complete!`);
  console.log(`📊 Total properties found: ${totalSynced}`);
  console.log(`✅ Total properties synced: ${totalSuccess}`);
  console.log(`📅 ${new Date().toISOString()}`);
  console.log("=".repeat(60));

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
