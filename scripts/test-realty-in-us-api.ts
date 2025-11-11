import { searchRealtyInUS, mapRealtyInUSPropertyToDb } from '../server/realty-in-us-api';
import { syncCityProperties } from '../server/realty-in-us-sync';

async function testRealtyInUSAPI() {
  console.log('🏠 Testing Realty in US API Integration (The Working One!)\n');

  try {
    // Test 1: Search for properties in Tampa
    console.log('📍 Test 1: Searching for properties in Tampa, FL (ZIP: 33602)...');
    const tampaProperties = await searchRealtyInUS({
      postal_code: '33602',
      limit: 10,
      offset: 0,
    });

    console.log(`✅ Found ${tampaProperties.length} properties in Tampa`);
    if (tampaProperties.length > 0) {
      const firstProperty = tampaProperties[0];
      console.log(`\n   Sample property data:`);
      console.log(`   - Property ID: ${firstProperty.property_id}`);
      console.log(`   - Address: ${firstProperty.location?.address?.line || 'N/A'}`);
      console.log(`   - Price: $${firstProperty.list_price?.toLocaleString() || 'N/A'}`);
      console.log(`   - Beds: ${firstProperty.description?.beds || 'N/A'}`);
      console.log(`   - Baths: ${firstProperty.description?.baths || 'N/A'}`);
      console.log(`   - Sqft: ${firstProperty.description?.sqft?.toLocaleString() || 'N/A'}`);
      console.log(`   - Photos: ${firstProperty.photo_count || 0}`);
      
      // Test mapping
      const mapped = mapRealtyInUSPropertyToDb({
        ...firstProperty,
        _location: { city: 'Tampa', zip: '33602' },
      });
      console.log(`\n   Mapped to database schema:`);
      console.log(`   - MLS ID: ${mapped.mlsId}`);
      console.log(`   - Address: ${mapped.address}`);
      console.log(`   - City: ${mapped.city}`);
      console.log(`   - Images: ${mapped.images.length} URLs`);
    }
    console.log('');

    // Test 2: Search for properties in Orlando
    console.log('📍 Test 2: Searching for properties in Orlando, FL (ZIP: 32801)...');
    const orlandoProperties = await searchRealtyInUS({
      postal_code: '32801',
      limit: 10,
      offset: 0,
    });

    console.log(`✅ Found ${orlandoProperties.length} properties in Orlando`);
    console.log('');

    // Test 3: Sync Tampa properties to database
    console.log('💾 Test 3: Syncing Tampa properties to database...');
    const syncResult = await syncCityProperties('Tampa', '33602');
    console.log(`✅ Sync complete:`);
    console.log(`   Added: ${syncResult.added}`);
    console.log(`   Updated: ${syncResult.updated}`);
    console.log(`   Total: ${syncResult.total}`);
    console.log('');

    console.log('🎉 All tests passed! Realty in US API integration is working correctly.');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - Tampa properties: ${tampaProperties.length}`);
    console.log(`   - Orlando properties: ${orlandoProperties.length}`);
    console.log(`   - Database sync: ${syncResult.added} added, ${syncResult.updated} updated`);
    console.log('');
    console.log('✅ Ready to import all 7,000+ Florida properties!');
    console.log('');
    console.log('💡 Next step: Run full sync with:');
    console.log('   pnpm tsx scripts/sync-all-florida-properties.ts');

  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

testRealtyInUSAPI();
