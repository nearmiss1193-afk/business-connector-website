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

// Check properties without images
console.log('\n🔍 Properties WITHOUT images:');
const [noImages] = await db.query(`
  SELECT p.id, p.address, p.city, p.zip_code, p.primary_image, COUNT(pi.id) as image_count
  FROM properties p
  LEFT JOIN property_images pi ON p.id = pi.property_id
  GROUP BY p.id
  HAVING image_count = 0
  LIMIT 10
`);
console.log(`Found ${noImages.length} properties without images`);
noImages.forEach(p => {
  console.log(`  - ID ${p.id}: ${p.address}, ${p.city} (primary_image: ${p.primary_image ? 'YES' : 'NO'})`);
});

// Check properties with images
console.log('\n🔍 Properties WITH images:');
const [withImages] = await db.query(`
  SELECT p.id, p.address, p.city, p.zip_code, COUNT(pi.id) as image_count
  FROM properties p
  LEFT JOIN property_images pi ON p.id = pi.property_id
  GROUP BY p.id
  HAVING image_count > 0
  ORDER BY image_count DESC
  LIMIT 10
`);
console.log(`Found ${withImages.length} properties with images`);
withImages.forEach(p => {
  console.log(`  - ID ${p.id}: ${p.address}, ${p.city} (${p.image_count} images)`);
});

// Check total stats
console.log('\n📊 Image Statistics:');
const [stats] = await db.query(`
  SELECT 
    COUNT(DISTINCT p.id) as total_properties,
    COUNT(DISTINCT CASE WHEN pi.id IS NOT NULL THEN p.id END) as properties_with_images,
    COUNT(DISTINCT CASE WHEN pi.id IS NULL THEN p.id END) as properties_without_images,
    COUNT(pi.id) as total_images
  FROM properties p
  LEFT JOIN property_images pi ON p.id = pi.property_id
`);
console.log(`Total properties: ${stats[0].total_properties}`);
console.log(`Properties with images: ${stats[0].properties_with_images}`);
console.log(`Properties without images: ${stats[0].properties_without_images}`);
console.log(`Total images: ${stats[0].total_images}`);

// Check for duplicate images (same image used by multiple properties)
console.log('\n🔍 Checking for duplicate images:');
const [duplicates] = await db.query(`
  SELECT image_url, COUNT(DISTINCT property_id) as property_count
  FROM property_images
  GROUP BY image_url
  HAVING property_count > 1
  LIMIT 5
`);
console.log(`Found ${duplicates.length} images used by multiple properties`);
duplicates.forEach(d => {
  console.log(`  - Image used by ${d.property_count} properties: ${d.image_url.substring(0, 80)}...`);
});

await db.end();
