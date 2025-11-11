import { getDb } from '../server/db';
import { properties, propertyImages, mlsSyncLog } from '../drizzle/schema-properties';
import { fetchAllFloridaPropertiesExpanded, mapRealtyInUSPropertyToDb } from '../server/realty-in-us-api-expanded';
import { getTotalZipCodeCount, getAllCities } from '../server/florida-locations';
import { eq } from 'drizzle-orm';

async function syncExpandedFloridaProperties() {
  console.log('\n🚀 EXPANDED FLORIDA PROPERTY SYNC');
  console.log('=====================================\n');
  console.log(`📍 Coverage: ${getAllCities().length} cities`);
  console.log(`📮 ZIP Codes: ${getTotalZipCodeCount()}`);
  console.log(`🎯 Target: 7,000+ properties`);
  console.log(`⏱️  Estimated time: 15-30 minutes`);
  console.log('\n');

  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const startTime = new Date();
  let propertiesAdded = 0;
  let propertiesUpdated = 0;
  let errors: string[] = [];

  try {
    // Fetch all properties with expanded coverage
    console.log('Starting property fetch...\n');
    const apiProperties = await fetchAllFloridaPropertiesExpanded();

    console.log(`\n📥 Processing ${apiProperties.length} properties into database...\n`);

    // Track MLS IDs from API
    const apiMlsIds = new Set<string>();

    // Process each property
    let processed = 0;
    for (const apiProp of apiProperties) {
      try {
        const mappedProperty = mapRealtyInUSPropertyToDb(apiProp);
        apiMlsIds.add(mappedProperty.mlsId);

        // Check if property exists
        const existing = await db
          .select()
          .from(properties)
          .where(eq(properties.mlsId, mappedProperty.mlsId))
          .limit(1);

        if (existing.length > 0) {
          // Update existing property
          await db
            .update(properties)
            .set({
              ...mappedProperty,
              updatedAt: new Date(),
            })
            .where(eq(properties.mlsId, mappedProperty.mlsId));

          propertiesUpdated++;
        } else {
          // Insert new property
          const [inserted] = await db
            .insert(properties)
            .values({
              ...mappedProperty,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .$returningId();

          // Insert property images
          if (mappedProperty.images && mappedProperty.images.length > 0) {
            const imageRecords = mappedProperty.images.map((url, index) => ({
              propertyId: inserted.id,
              imageUrl: url,
              displayOrder: index + 1,
              createdAt: new Date(),
            }));

            await db.insert(propertyImages).values(imageRecords);
          }

          propertiesAdded++;
        }

        processed++;
        if (processed % 100 === 0) {
          console.log(`   Processed: ${processed}/${apiProperties.length} (${propertiesAdded} added, ${propertiesUpdated} updated)`);
        }
      } catch (error) {
        const errorMsg = `Failed to process property: ${error}`;
        console.error(`   ❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    // Log sync results
    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    await db.insert(mlsSyncLog).values({
      source: 'realty_in_us_expanded',
      syncType: 'full',
      status: 'completed',
      propertiesAdded,
      propertiesUpdated,
      propertiesRemoved: 0,
      errorMessage: errors.length > 0 ? `${errors.length} errors occurred` : null,
      errorDetails: errors.length > 0 ? JSON.stringify(errors.slice(0, 10)) : null,
      startedAt: startTime,
      completedAt: new Date(),
    });

    console.log(`\n${'='.repeat(60)}`);
    console.log('🎉 SYNC COMPLETE!');
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Properties Added: ${propertiesAdded}`);
    console.log(`🔄 Properties Updated: ${propertiesUpdated}`);
    console.log(`📊 Total Properties: ${apiProperties.length}`);
    console.log(`⏱️  Duration: ${(duration / 60).toFixed(2)} minutes`);
    console.log(`${'='.repeat(60)}\n`);

    if (errors.length > 0) {
      console.log(`⚠️  Errors encountered: ${errors.length}`);
      console.log('First 5 errors:');
      errors.slice(0, 5).forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
      console.log('');
    }

    // Get final count from database
    const [{ count }] = await db
      .select({ count: db.fn.count() })
      .from(properties);

    console.log(`\n🏠 Total properties in database: ${count}`);
    console.log(`🌐 Your property website is now live with real MLS data!`);
    console.log(`🔗 View at: https://3000-inzqi3hwtuj3wn00r5mye-314459bb.manusvm.computer/properties`);
    console.log('');

    return {
      success: true,
      propertiesAdded,
      propertiesUpdated,
      totalProperties: apiProperties.length,
      databaseTotal: count,
      duration,
      errors,
    };

  } catch (error) {
    console.error('\n❌ Sync Failed:', error);

    // Log failed sync
    await db.insert(mlsSyncLog).values({
      source: 'realty_in_us_expanded',
      syncType: 'full',
      status: 'failed',
      propertiesAdded,
      propertiesUpdated,
      propertiesRemoved: 0,
      errorMessage: String(error),
      errorDetails: error instanceof Error ? error.stack : null,
      startedAt: startTime,
      completedAt: new Date(),
    });

    throw error;
  }
}

syncExpandedFloridaProperties();
