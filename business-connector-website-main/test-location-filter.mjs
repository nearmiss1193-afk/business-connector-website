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

// Test 1: Search for Lakeland
console.log('\n🔍 Test 1: Searching for "Lakeland"');
const [lakeland] = await db.query(
  `SELECT id, address, city, zip_code, price FROM properties 
   WHERE city LIKE ? OR zip_code LIKE ? 
   LIMIT 5`,
  ['%Lakeland%', '%Lakeland%']
);
console.log(`Found ${lakeland.length} properties in Lakeland`);
lakeland.forEach(p => console.log(`  - ${p.address}, ${p.city} ${p.zip_code}`));

// Test 2: Search for Clermont
console.log('\n🔍 Test 2: Searching for "Clermont"');
const [clermont] = await db.query(
  `SELECT id, address, city, zip_code, price FROM properties 
   WHERE city LIKE ? OR zip_code LIKE ? 
   LIMIT 5`,
  ['%Clermont%', '%Clermont%']
);
console.log(`Found ${clermont.length} properties in Clermont`);
clermont.forEach(p => console.log(`  - ${p.address}, ${p.city} ${p.zip_code}`));

// Test 3: Search for 34711 (Clermont zip)
console.log('\n🔍 Test 3: Searching for zip code "34711"');
const [zip34711] = await db.query(
  `SELECT id, address, city, zip_code, price FROM properties 
   WHERE city LIKE ? OR zip_code LIKE ? 
   LIMIT 5`,
  ['%34711%', '%34711%']
);
console.log(`Found ${zip34711.length} properties in zip 34711`);
zip34711.forEach(p => console.log(`  - ${p.address}, ${p.city} ${p.zip_code}`));

// Test 4: Count all properties
console.log('\n📊 Test 4: Total properties in database');
const [total] = await db.query('SELECT COUNT(*) as count FROM properties');
console.log(`Total properties: ${total[0].count}`);

// Test 5: Count by city
console.log('\n📊 Test 5: Properties by city');
const [bycity] = await db.query(
  `SELECT city, COUNT(*) as count FROM properties GROUP BY city ORDER BY count DESC LIMIT 10`
);
bycity.forEach(row => console.log(`  ${row.city}: ${row.count}`));

await db.end();
