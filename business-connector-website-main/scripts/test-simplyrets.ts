/**
 * Test SimplyRETS Integration
 * 
 * This script tests the SimplyRETS API connection and shows
 * how many properties are available in the demo feed.
 * 
 * Run with: pnpm tsx scripts/test-simplyrets.ts
 */

import { fetchAllProperties, testConnection, mapSimplyRETSProperty } from '../server/simplyrets';

async function main() {
  console.log('🏠 Testing SimplyRETS Integration...\n');

  // Test connection
  console.log('1. Testing API connection...');
  const connectionTest = await testConnection();
  
  if (!connectionTest.success) {
    console.error('❌ Connection failed:', connectionTest.message);
    process.exit(1);
  }
  
  console.log('✅ Connection successful!\n');

  // Fetch all properties
  console.log('2. Fetching properties from demo feed...');
  const properties = await fetchAllProperties({
    limit: 500, // Max limit
  });

  console.log(`✅ Found ${properties.length} properties\n`);

  // Show sample property
  if (properties.length > 0) {
    const sample = properties[0];
    console.log('📋 Sample Property:');
    console.log('  MLS ID:', sample.mlsId);
    console.log('  Address:', sample.address.full);
    console.log('  City:', sample.address.city);
    console.log('  Price:', `$${sample.listPrice.toLocaleString()}`);
    console.log('  Beds:', sample.property.bedrooms);
    console.log('  Baths:', sample.property.bathsFull + sample.property.bathsHalf * 0.5);
    console.log('  Sqft:', sample.property.area.toLocaleString());
    console.log('  Type:', sample.property.type);
    console.log('  Status:', sample.mls.status);
    console.log('  Photos:', sample.photos?.length || 0);
    console.log('  Virtual Tour:', sample.virtualTourUrl ? 'Yes' : 'No');
    console.log('');

    // Show mapped version
    const mapped = mapSimplyRETSProperty(sample);
    console.log('🔄 Mapped to our database format:');
    console.log('  Property Type:', mapped.propertyType);
    console.log('  Status:', mapped.status);
    console.log('  Features:', mapped.features.slice(0, 3).join(', '));
    console.log('');
  }

  // Show city breakdown
  const cityCounts = properties.reduce((acc, prop) => {
    const city = prop.address.city;
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('🌆 Properties by City:');
  Object.entries(cityCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([city, count]) => {
      console.log(`  ${city}: ${count} properties`);
    });
  console.log('');

  // Show property type breakdown
  const typeCounts = properties.reduce((acc, prop) => {
    const type = prop.property.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('🏘️  Properties by Type:');
  Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count} properties`);
    });
  console.log('');

  // Show price range
  const prices = properties.map(p => p.listPrice).sort((a, b) => a - b);
  const minPrice = prices[0];
  const maxPrice = prices[prices.length - 1];
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  console.log('💰 Price Range:');
  console.log(`  Minimum: $${minPrice.toLocaleString()}`);
  console.log(`  Maximum: $${maxPrice.toLocaleString()}`);
  console.log(`  Average: $${Math.round(avgPrice).toLocaleString()}`);
  console.log('');

  // Count properties with virtual tours
  const withVirtualTours = properties.filter(p => p.virtualTourUrl).length;
  console.log(`🎥 Properties with Virtual Tours: ${withVirtualTours} (${Math.round(withVirtualTours / properties.length * 100)}%)`);
  console.log('');

  console.log('✅ Test complete!');
  console.log('');
  console.log('📝 Summary:');
  console.log(`  Total Properties: ${properties.length}`);
  console.log(`  Cities: ${Object.keys(cityCounts).length}`);
  console.log(`  Property Types: ${Object.keys(typeCounts).length}`);
  console.log(`  With Photos: ${properties.filter(p => p.photos && p.photos.length > 0).length}`);
  console.log(`  With Virtual Tours: ${withVirtualTours}`);
}

main().catch(console.error);
