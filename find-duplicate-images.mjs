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

// Find the beautiful house image URL
console.log('\n🔍 Finding the beautiful house image (from screenshots):');
const [images] = await db.query(`
  SELECT image_url, COUNT(DISTINCT property_id) as property_count
  FROM property_images
  GROUP BY image_url
  ORDER BY property_count DESC
  LIMIT 20
`);

console.log(`Found ${images.length} image URLs with their property counts:`);
images.forEach((img, idx) => {
  const url = img.image_url.substring(0, 100);
  console.log(`${idx + 1}. Used by ${img.property_count} properties: ${url}...`);
});

// Find which properties are using the most common image
console.log('\n🔍 Properties using the most common image:');
const [topImage] = await db.query(`
  SELECT image_url, COUNT(DISTINCT property_id) as property_count
  FROM property_images
  GROUP BY image_url
  ORDER BY property_count DESC
  LIMIT 1
`);

if (topImage.length > 0) {
  const mostCommonUrl = topImage[0].image_url;
  console.log(`Most common image used by ${topImage[0].property_count} properties`);
  
  const [properties] = await db.query(`
    SELECT DISTINCT p.id, p.address, p.city, p.zip_code, p.property_type
    FROM properties p
    JOIN property_images pi ON p.id = pi.property_id
    WHERE pi.image_url = ?
    LIMIT 20
  `, [mostCommonUrl]);
  
  console.log(`\nProperties using this image:`);
  properties.forEach(p => {
    console.log(`  - ID ${p.id}: ${p.address}, ${p.city} (${p.property_type})`);
  });
}

// Check Cape Coral LAND property
console.log('\n🔍 Cape Coral LAND property images:');
const [capeCoralLand] = await db.query(`
  SELECT p.id, p.address, p.city, p.property_type, COUNT(pi.id) as image_count
  FROM properties p
  LEFT JOIN property_images pi ON p.id = pi.property_id
  WHERE p.city = 'Cape Coral' AND p.property_type = 'LAND'
  GROUP BY p.id
  LIMIT 5
`);

capeCoralLand.forEach(p => {
  console.log(`  - ID ${p.id}: ${p.address} (${p.image_count} images)`);
});

// Check Fort Myers SINGLE_FAMILY property
console.log('\n🔍 Fort Myers SINGLE_FAMILY property images:');
const [fortMyersSingle] = await db.query(`
  SELECT p.id, p.address, p.city, p.property_type, COUNT(pi.id) as image_count
  FROM properties p
  LEFT JOIN property_images pi ON p.id = pi.property_id
  WHERE p.city = 'Fort Myers' AND p.property_type = 'SINGLE_FAMILY'
  GROUP BY p.id
  LIMIT 5
`);

fortMyersSingle.forEach(p => {
  console.log(`  - ID ${p.id}: ${p.address} (${p.image_count} images)`);
});

await db.end();
