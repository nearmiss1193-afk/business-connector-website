import { getDb } from './db';
import { properties, propertyImages, mlsSyncLog } from '../drizzle/schema-properties';
import { fetchAllFloridaProperties, mapRealtorPropertyToDb, searchProperties } from './realtor-api';
import { eq } from 'drizzle-orm';

/**
 * Sync properties from Realtor.com API to database
 */
export async function syncRealtorProperties() {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const startTime = new Date();
  let propertiesAdded = 0;
  let propertiesUpdated = 0;
  let propertiesRemoved = 0;
  let errors: string[] = [];

  try {
    console.log('[Realtor Sync] Starting property sync...');

    // Fetch all Florida properties from Realtor.com
    const realtorProperties = await fetchAllFloridaProperties();
    console.log(`[Realtor Sync] Fetched ${realtorProperties.length} properties from Realtor.com`);

    // Track MLS IDs from API
    const apiMlsIds = new Set<string>();

    // Process each property
    for (const realtorProp of realtorProperties) {
      try {
        const mappedProperty = mapRealtorPropertyToDb(realtorProp);
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
            })
            .$returningId();

          // Insert property images
          if (mappedProperty.images && mappedProperty.images.length > 0) {
            const imageRecords = mappedProperty.images.slice(0, 20).map((url: any, index: any) => ({
              propertyId: inserted.id,
              imageUrl: url,
              order: index + 1,
            }));

            await db.insert(propertyImages).values(imageRecords);
          }

          propertiesAdded++;
        }
      } catch (error) {
        const errorMsg = `Failed to process property ${realtorProp.property_id}: ${error}`;
        console.error(`[Realtor Sync] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    // Mark properties as sold/off-market if they're not in the API response
    const allDbProperties = await db.select({ mlsId: properties.mlsId }).from(properties);
    
    for (const dbProp of allDbProperties) {
      if (!apiMlsIds.has(dbProp.mlsId)) {
        await db
          .update(properties)
          .set({
            listingStatus: 'sold',
            updatedAt: new Date(),
          })
          .where(eq(properties.mlsId, dbProp.mlsId));
        
        propertiesRemoved++;
      }
    }

    // Log sync results
    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    await db.insert(mlsSyncLog).values({
      source: 'realtor-com',
      syncType: 'full',
      status: errors.length > 0 ? 'completed' : 'completed',
      propertiesAdded,
      propertiesUpdated,
      propertiesRemoved,
      errorMessage: errors.length > 0 ? errors.join('\n') : undefined,
      startedAt: startTime,
      completedAt: endTime,
    });

    console.log(`[Realtor Sync] Completed in ${duration}s`);
    console.log(`[Realtor Sync] Added: ${propertiesAdded}, Updated: ${propertiesUpdated}, Removed: ${propertiesRemoved}`);

    return {
      success: true,
      propertiesAdded,
      propertiesUpdated,
      propertiesRemoved,
      totalProperties: realtorProperties.length,
      duration,
      errors,
    };
  } catch (error) {
    console.error('[Realtor Sync] Sync failed:', error);

    // Log failed sync
    await db.insert(mlsSyncLog).values({
      source: 'realtor-com',
      syncType: 'full',
      status: 'failed',
      propertiesAdded,
      propertiesUpdated,
      propertiesRemoved,
      errorMessage: String(error),
      startedAt: startTime,
    });

    throw error;
  }
}

/**
 * Sync properties for a specific city
 */
export async function syncCityProperties(city: string, stateCode: string = 'FL') {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  console.log(`[Realtor Sync] Syncing properties for ${city}, ${stateCode}...`);

  const realtorProperties = await searchProperties({
    city,
    state_code: stateCode,
    status: 'for_sale',
    limit: 200,
  });

  console.log(`[Realtor Sync] Found ${realtorProperties.length} properties in ${city}`);

  let added = 0;
  let updated = 0;

  for (const realtorProp of realtorProperties) {
    try {
      const mappedProperty = mapRealtorPropertyToDb(realtorProp);

      const existing = await db
        .select()
        .from(properties)
        .where(eq(properties.mlsId, mappedProperty.mlsId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(properties)
          .set({
            ...mappedProperty,
            updatedAt: new Date(),
          })
          .where(eq(properties.mlsId, mappedProperty.mlsId));
        updated++;
      } else {
        const [inserted] = await db
          .insert(properties)
          .values({
            ...mappedProperty,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .$returningId();

        if (mappedProperty.images && mappedProperty.images.length > 0) {
          const imageRecords = mappedProperty.images.slice(0, 20).map((url, index) => ({
            propertyId: inserted.id,
            imageUrl: url,
            displayOrder: index + 1,
            createdAt: new Date(),
          }));

          await db.insert(propertyImages).values(imageRecords);
        }

        added++;
      }
    } catch (error) {
      console.error(`[Realtor Sync] Failed to process property:`, error);
    }
  }

  console.log(`[Realtor Sync] ${city} sync complete: ${added} added, ${updated} updated`);

  return {
    city,
    added,
    updated,
    total: realtorProperties.length,
  };
}
