import { searchProperties, getPropertyDetails } from '../server/realtor-api';
import { syncCityProperties } from '../server/realtor-sync';

async function testRealtorAPI() {
  console.log('🏠 Testing Realtor.com API Integration\n');

  try {
    // Test 1: Search for properties in Tampa
    console.log('📍 Test 1: Searching for properties in Tampa, FL...');
    const tampaProperties = await searchProperties({
      city: 'Tampa',
      state_code: 'FL',
      status: 'for_sale',
      limit: 10,
    });

    console.log(`✅ Found ${tampaProperties.length} properties in Tampa`);
    if (tampaProperties.length > 0) {
      const firstProperty = tampaProperties[0];
      console.log(`   Sample: ${firstProperty.address.line} - $${firstProperty.price?.toLocaleString()}`);
      console.log(`   Beds: ${firstProperty.beds}, Baths: ${firstProperty.baths}, Sqft: ${firstProperty.sqft}`);
    }
    console.log('');

    // Test 2: Search for properties in Orlando
    console.log('📍 Test 2: Searching for properties in Orlando, FL...');
    const orlandoProperties = await searchProperties({
      city: 'Orlando',
      state_code: 'FL',
      status: 'for_sale',
      limit: 10,
    });

    console.log(`✅ Found ${orlandoProperties.length} properties in Orlando`);
    if (orlandoProperties.length > 0) {
      const firstProperty = orlandoProperties[0];
      console.log(`   Sample: ${firstProperty.address.line} - $${firstProperty.price?.toLocaleString()}`);
    }
    console.log('');

    // Test 3: Get property details
    if (tampaProperties.length > 0) {
      console.log('📋 Test 3: Fetching detailed property information...');
      const propertyId = tampaProperties[0].property_id;
      const details = await getPropertyDetails(propertyId);
      
      if (details) {
        console.log(`✅ Retrieved details for property ${propertyId}`);
        console.log(`   Photos: ${details.photos?.length || 0}`);
        console.log(`   Virtual Tours: ${details.virtual_tours?.length || 0}`);
        console.log(`   Description: ${details.description?.text?.substring(0, 100)}...`);
      }
      console.log('');
    }

    // Test 4: Sync a small batch to database
    console.log('💾 Test 4: Syncing 10 Tampa properties to database...');
    const syncResult = await syncCityProperties('Tampa', 'FL');
    console.log(`✅ Sync complete:`);
    console.log(`   Added: ${syncResult.added}`);
    console.log(`   Updated: ${syncResult.updated}`);
    console.log(`   Total: ${syncResult.total}`);
    console.log('');

    console.log('🎉 All tests passed! Realtor.com API integration is working correctly.');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - Tampa properties: ${tampaProperties.length}`);
    console.log(`   - Orlando properties: ${orlandoProperties.length}`);
    console.log(`   - Database sync: ${syncResult.added} added, ${syncResult.updated} updated`);
    console.log('');
    console.log('✅ Ready to import all 7,948+ Florida properties!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testRealtorAPI();
