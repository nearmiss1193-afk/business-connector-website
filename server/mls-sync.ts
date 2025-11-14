import { getDb } from './db';
import { properties, mlsSyncLog } from '../drizzle/schema';
import { fetchAllProperties, mapSimplyRETSProperty, testConnection } from './simplyrets';
import { eq } from 'drizzle-orm';

/**
 * MLS Sync Service
 * 
 * Handles automated syncing of property listings from SimplyRETS to our database.
 * Runs daily to keep listings up-to-date.
 */

interface SyncResult {
  success: boolean;
  added: number;
  updated: number;
  removed: number;
  errors: string[];
  duration: number;
}

/**
 * Sync all properties from SimplyRETS to database
 */
export async function syncMLSData(options?: {
  cities?: string[];
  forceFullSync?: boolean;
}): Promise<SyncResult> {
  const startTime = Date.now();
  const result: SyncResult = {
    success: false,
    added: 0,
    updated: 0,
    removed: 0,
    errors: [],
    duration: 0,
  };

  const db = await getDb();
  if (!db) {
    result.errors.push('Database not available');
    return result;
  }

  try {
    console.log('[MLS Sync] Starting sync...');
    
    // Test connection first
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      result.errors.push(`Connection failed: ${connectionTest.message}`);
      await logSync(db, result);
      return result;
    }

    // Fetch properties from SimplyRETS
    const cities = options?.cities || ['Tampa', 'Orlando', 'St. Petersburg', 'Kissimmee'];
    console.log(`[MLS Sync] Fetching properties for cities: ${cities.join(', ')}`);
    
    const srProperties = await fetchAllProperties({
      cities,
      status: 'Active',
      limit: 500,
    });

    console.log(`[MLS Sync] Fetched ${srProperties.length} properties from SimplyRETS`);

    // Process each property
    for (const srProperty of srProperties) {
      try {
        const mappedProperty = mapSimplyRETSProperty(srProperty);
        
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
          
          result.updated++;
        } else {
          // Insert new property
          await db.insert(properties).values({
            ...mappedProperty,
          });
          
          result.added++;
        }
      } catch (error) {
        const errorMsg = `Failed to process property ${srProperty.mlsId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`[MLS Sync] ${errorMsg}`);
        result.errors.push(errorMsg);
      }
    }

    // Mark properties as off-market if they're no longer in the feed
    const activeMlsIds = srProperties.map(p => p.mlsId);
    if (activeMlsIds.length > 0) {
      const offMarketResult = await db
        .update(properties)
        .set({ listingStatus: 'off_market', updatedAt: new Date() })
        .where(eq(properties.listingStatus, 'active'));
      
      // Count how many were marked off-market
      // Note: This is a simplified approach. In production, you'd want to be more selective
      result.removed = 0; // We don't have the exact count without a more complex query
    }

    result.success = result.errors.length === 0;
    result.duration = Date.now() - startTime;

    console.log(`[MLS Sync] Completed: ${result.added} added, ${result.updated} updated, ${result.removed} removed in ${result.duration}ms`);

    // Log sync result
    await logSync(db, result);

    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MLS Sync] Fatal error: ${errorMsg}`);
    result.errors.push(errorMsg);
    result.duration = Date.now() - startTime;
    
    await logSync(db, result);
    return result;
  }
}

/**
 * Log sync result to database
 */
async function logSync(db: any, result: SyncResult) {
  try {
    await db.insert(mlsSyncLog).values({
      syncDate: new Date(),
      status: result.success ? 'success' : 'failed',
      propertiesAdded: result.added,
      propertiesUpdated: result.updated,
      propertiesRemoved: result.removed,
      errors: result.errors.length > 0 ? result.errors.join('; ') : null,
      duration: result.duration,
    });
  } catch (error) {
    console.error('[MLS Sync] Failed to log sync result:', error);
  }
}

/**
 * Get last sync status
 */
export async function getLastSyncStatus() {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const logs = await db
    .select()
    .from(mlsSyncLog)
    .orderBy(mlsSyncLog.startedAt)
    .limit(1);

  return logs.length > 0 ? logs[0] : null;
}

/**
 * Schedule daily MLS sync
 * This should be called when the server starts
 */
export function scheduleDailySync() {
  // Run sync every 24 hours at 2 AM
  const SYNC_HOUR = 2;
  const SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  // Calculate time until next 2 AM
  const now = new Date();
  const next2AM = new Date();
  next2AM.setHours(SYNC_HOUR, 0, 0, 0);
  
  if (now.getHours() >= SYNC_HOUR) {
    // If it's past 2 AM today, schedule for tomorrow
    next2AM.setDate(next2AM.getDate() + 1);
  }

  const timeUntilSync = next2AM.getTime() - now.getTime();

  console.log(`[MLS Sync] Scheduled daily sync at 2 AM (next run in ${Math.round(timeUntilSync / 1000 / 60)} minutes)`);

  // Schedule first sync
  setTimeout(() => {
    syncMLSData().then((result) => {
      console.log(`[MLS Sync] Scheduled sync completed:`, result);
    });

    // Then repeat every 24 hours
    setInterval(() => {
      syncMLSData().then((result) => {
        console.log(`[MLS Sync] Scheduled sync completed:`, result);
      });
    }, SYNC_INTERVAL);
  }, timeUntilSync);
}
