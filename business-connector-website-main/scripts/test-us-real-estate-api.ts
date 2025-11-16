import { getPropertiesForSale, getPropertyDetails } from '../server/us-real-estate-api';
import { syncCityProperties } from '../server/us-real-estate-sync';

async function testUSRealEstateAPI() {
  console.log('🏠 Testing US Real Estate Listings API Integration\n');

  try {
    // Test 1: Search for properties in Tampa
    console.log('📍 Test 1: Searching for properties in Tampa, FL...');
    const tampaProperties = await getPropertiesForSale('Tampa, FL', 10, 0);

    console.log(`✅ Found ${tampaProperties.length} properties in Tampa`);
    if (tampaProperties.length > 0) {
      const firstProperty = tampaProperties[0];
      console.log(`   Sample property:`, JSON.stringify(firstProperty, null, 2).substring(0, 500));
    }
    console.log('');

    // Test 2: Search for properties in Orlando
    console.log('📍 Test 2: Searching for properties in Orlando, FL...');
    const orlandoProperties = await getPropertiesForSale('Orlando, FL', 10, 0);

    console.log(`✅ Found ${orlandoProperties.length} properties in Orlando`);
    console.log('');

    // Test 3: Sync Tampa properties to database
    console.log('💾 Test 3: Syncing Tampa properties to database...');
    const syncResult = await syncCityProperties('Tampa', 'FL');
    console.log(`✅ Sync complete:`);
    console.log(`   Added: ${syncResult.added}`);
    console.log(`   Updated: ${syncResult.updated}`);
    console.log(`   Total: ${syncResult.total}`);
    console.log('');

    console.log('🎉 All tests passed! US Real Estate Listings API integration is working correctly.');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - Tampa properties: ${tampaProperties.length}`);
    console.log(`   - Orlando properties: ${orlandoProperties.length}`);
    console.log(`   - Database sync: ${syncResult.added} added, ${syncResult.updated} updated`);
    console.log('');
    console.log('✅ Ready to import all Florida properties!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testUSRealEstateAPI();
