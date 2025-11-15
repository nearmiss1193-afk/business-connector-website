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

// Check what the searchProperties function returns
console.log('\n🔍 Simulating searchProperties API response:');

// Get Cape Coral LAND properties
const [capeCoralLand] = await db.query(`
  SELECT p.id, p.address, p.city, p.zip_code, p.property_type, p.price, p.primary_image,
         pi.image_url as first_image_from_join
  FROM properties p
  LEFT JOIN property_images pi ON p.id = pi.property_id
  WHERE p.city = 'Cape Coral' AND p.zip_code = '33909' AND p.property_type = 'LAND'
  ORDER BY p.id
  LIMIT 5
`);

console.log('\nCape Coral LAND properties:');
capeCoralLand.forEach(p => {
  console.log(`\nID ${p.id}: ${p.address}`);
  console.log(`  primary_image: ${p.primary_image ? p.primary_image.substring(0, 80) : 'NULL'}...`);
  console.log(`  first_image_from_join: ${p.first_image_from_join ? p.first_image_from_join.substring(0, 80) : 'NULL'}...`);
});

// Now check what the db-properties.ts function returns
console.log('\n\n🔍 Checking searchProperties function logic:');

// Simulate the searchProperties query
const [results] = await db.query(`
  SELECT p.id, p.address, p.city, p.zip_code, p.property_type, p.price,
         p.primary_image,
         (SELECT image_url FROM property_images WHERE property_id = p.id ORDER BY \`order\` LIMIT 1) as first_image
  FROM properties p
  WHERE p.city = 'Cape Coral' AND p.zip_code = '33909' AND p.property_type = 'LAND'
  LIMIT 5
`);

console.log('\nSimulated searchProperties results:');
results.forEach(p => {
  console.log(`\nID ${p.id}: ${p.address}`);
  console.log(`  primary_image: ${p.primary_image ? p.primary_image.substring(0, 80) : 'NULL'}...`);
  console.log(`  first_image (from property_images): ${p.first_image ? p.first_image.substring(0, 80) : 'NULL'}...`);
});

await db.end();
