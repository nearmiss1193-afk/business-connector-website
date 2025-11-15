import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'localhost',
  user: 'root',
  password: '',
  database: 'business_connector',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function checkDuplicateImages() {
  const connection = await pool.getConnection();
  
  try {
    // Find images used by multiple properties
    const [duplicates] = await connection.query(`
      SELECT imageUrl, COUNT(DISTINCT propertyId) as propertyCount, 
             GROUP_CONCAT(DISTINCT propertyId SEPARATOR ',') as propertyIds
      FROM property_images
      GROUP BY imageUrl
      HAVING propertyCount > 1
      ORDER BY propertyCount DESC
      LIMIT 10
    `);
    
    console.log('Images used by multiple properties:');
    console.log(JSON.stringify(duplicates, null, 2));
    
    // Check specific properties
    const [properties] = await connection.query(`
      SELECT DISTINCT p.id, p.address, p.city, p.price, pi.imageUrl
      FROM properties p
      LEFT JOIN property_images pi ON p.id = pi.propertyId
      WHERE p.address IN ('843 Niles St', '10117 Shadow Oaks Cir')
      ORDER BY p.id
    `);
    
    console.log('\n\nSpecific properties:');
    console.log(JSON.stringify(properties, null, 2));
    
  } finally {
    await connection.end();
  }
}

checkDuplicateImages().catch(console.error);
