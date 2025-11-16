import mysql from 'mysql2/promise';

const dbUrl = new URL(process.env.DATABASE_URL);
const config = {
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.substring(1),
  ssl: {},
};

const db = await mysql.createConnection(config);

// From your screenshots, I see these properties:
// 1. Cape Coral, FL 33909 - LAND
// 2. Fort Myers, FL 33905 - SINGLE_FAMILY  
// 3. Port Orange, FL 32128 - OTHER
// 4. Cape Coral, FL 33909 - SINGLE_FAMILY

console.log('\n🔍 Finding properties from your screenshots:');

// Cape Coral LAND properties
const [capeLand] = await db.query(`
  SELECT p.id, p.address, p.city, p.zip_code, p.property_type, p.price,
         GROUP_CONCAT(pi.image_url SEPARATOR '|') as images
  FROM properties p
  LEFT JOIN property_images pi ON p.id = pi.property_id
  WHERE p.city = 'Cape Coral' AND p.zip_code = '33909' AND p.property_type = 'LAND'
  GROUP BY p.id
  LIMIT 3
`);

console.log('\n📍 Cape Coral LAND properties:');
capeLand.forEach(p => {
  const imageCount = p.images ? p.images.split('|').length : 0;
  console.log(`  ID ${p.id}: ${p.address} - $${p.price} (${imageCount} images)`);
  if (p.images) {
    console.log(`    First image: ${p.images.split('|')[0].substring(0, 80)}...`);
  }
});

// Fort Myers SINGLE_FAMILY properties
const [fortMyers] = await db.query(`
  SELECT p.id, p.address, p.city, p.zip_code, p.property_type, p.price,
         GROUP_CONCAT(pi.image_url SEPARATOR '|') as images
  FROM properties p
  LEFT JOIN property_images pi ON p.id = pi.property_id
  WHERE p.city = 'Fort Myers' AND p.zip_code = '33905' AND p.property_type = 'SINGLE_FAMILY'
  GROUP BY p.id
  LIMIT 3
`);

console.log('\n📍 Fort Myers SINGLE_FAMILY properties:');
fortMyers.forEach(p => {
  const imageCount = p.images ? p.images.split('|').length : 0;
  console.log(`  ID ${p.id}: ${p.address} - $${p.price} (${imageCount} images)`);
  if (p.images) {
    console.log(`    First image: ${p.images.split('|')[0].substring(0, 80)}...`);
  }
});

// Check if they're using the same image
console.log('\n🔍 Checking if Cape Coral and Fort Myers properties share images:');
const [sharedImages] = await db.query(`
  SELECT pi.image_url, COUNT(DISTINCT p.id) as property_count,
         GROUP_CONCAT(DISTINCT CONCAT(p.city, ' - ', p.property_type) SEPARATOR ', ') as locations
  FROM property_images pi
  JOIN properties p ON pi.property_id = p.id
  WHERE (p.city = 'Cape Coral' OR p.city = 'Fort Myers') 
    AND (p.zip_code = '33909' OR p.zip_code = '33905')
  GROUP BY pi.image_url
  HAVING property_count > 1
`);

if (sharedImages.length > 0) {
  console.log(`Found ${sharedImages.length} images shared between properties:`);
  sharedImages.forEach(img => {
    console.log(`  - Image used by ${img.property_count} properties: ${img.locations}`);
    console.log(`    URL: ${img.image_url.substring(0, 80)}...`);
  });
} else {
  console.log('No shared images found between Cape Coral and Fort Myers properties');
}

await db.end();
