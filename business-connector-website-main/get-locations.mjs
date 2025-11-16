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

// Get unique cities and zip codes
const [locations] = await db.query(`
  SELECT DISTINCT city, zip_code
  FROM properties
  WHERE city IS NOT NULL AND city != ''
  ORDER BY city ASC
`);

console.log(JSON.stringify(locations, null, 2));

await db.end();
