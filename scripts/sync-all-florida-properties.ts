import { syncRealtyInUSProperties } from '../server/realty-in-us-sync';

async function syncAllFloridaProperties() {
  console.log('🏠 Starting Full Florida Property Sync');
  console.log('=====================================\n');
  console.log('This will fetch properties from:');
  console.log('  - Tampa Bay Area (Tampa, St Petersburg, Clearwater)');
  console.log('  - Lakeland / Polk County (Lakeland, Winter Haven)');
  console.log('  - Greater Orlando (Orlando, Kissimmee, Winter Park)');
  console.log('  - Daytona Area (Daytona Beach, Port Orange)');
  console.log('');
  console.log('Expected: 7,000+ properties');
  console.log('Estimated time: 5-10 minutes');
  console.log('');
  console.log('Starting sync...\n');

  const startTime = Date.now();

  try {
    const result = await syncRealtyInUSProperties();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n🎉 Sync Complete!');
    console.log('=================\n');
    console.log(`✅ Properties Added: ${result.propertiesAdded}`);
    console.log(`🔄 Properties Updated: ${result.propertiesUpdated}`);
    console.log(`❌ Properties Removed: ${result.propertiesRemoved}`);
    console.log(`📊 Total Properties: ${result.totalProperties}`);
    console.log(`⏱️  Duration: ${duration}s`);

    if (result.errors && result.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered: ${result.errors.length}`);
      console.log('First 5 errors:');
      result.errors.slice(0, 5).forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    console.log('\n✅ Your property website is now live with real MLS data!');
    console.log('🌐 View at: https://3000-inzqi3hwtuj3wn00r5mye-314459bb.manusvm.computer/properties');
    console.log('');
    console.log('💡 Next steps:');
    console.log('  1. Test the property search and filters');
    console.log('  2. Test the 3-click lead capture modal');
    console.log('  3. Verify leads are flowing to GoHighLevel Buyer Pipeline');
    console.log('  4. Set up daily automated sync (cron job)');

  } catch (error) {
    console.error('\n❌ Sync Failed:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

syncAllFloridaProperties();
