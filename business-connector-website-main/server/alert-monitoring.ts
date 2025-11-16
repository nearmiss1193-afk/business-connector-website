/**
 * Alert Monitoring System
 * Real-time monitoring and alert generation for lead scoring dashboard
 */

import { getDb } from './db';
import { eq, desc, gte } from 'drizzle-orm';
import { propertyMetrics, importLogs, alertLogs, marketAnalytics } from '../drizzle/schema-analytics';
import { notifyOwner } from './_core/notification';

interface AlertConfig {
  highLeadVolumeThreshold: number; // leads per day
  importFailureThreshold: number; // % success rate
  marketHeatChangeThreshold: number; // % change
  lowConversionThreshold: number; // % conversion rate
  apiQuotaWarningPercent: number; // % of quota used
}

const DEFAULT_CONFIG: AlertConfig = {
  highLeadVolumeThreshold: 10,
  importFailureThreshold: 80,
  marketHeatChangeThreshold: 20,
  lowConversionThreshold: 5,
  apiQuotaWarningPercent: 80,
};

/**
 * Check for high lead volume and create alert
 */
export async function checkHighLeadVolume(config: AlertConfig = DEFAULT_CONFIG) {
  const db = await getDb();
  if (!db) return;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get properties with high lead volume today
    const highVolume = await db
      .select()
      .from(propertyMetrics)
      .where(gte(propertyMetrics.avgLeadsPerDay, config.highLeadVolumeThreshold));

    for (const property of highVolume) {
      // Check if alert already exists
      const existingAlert = await db
        .select()
        .from(alertLogs)
        .where(
          eq(alertLogs.propertyId, property.propertyId)
          // and(
          //   eq(alertLogs.alertType, 'high_lead_volume'),
          //   gte(alertLogs.createdAt, today)
          // )
        )
        .limit(1);

      if (existingAlert.length === 0) {
        // Create new alert
        await db.insert(alertLogs).values({
          alertType: 'high_lead_volume',
          severity: 'info',
          title: `High Lead Volume - Property ${property.propertyId}`,
          message: `Property ${property.propertyId} is receiving ${property.avgLeadsPerDay.toFixed(1)} leads per day`,
          details: JSON.stringify({
            propertyId: property.propertyId,
            avgLeadsPerDay: property.avgLeadsPerDay,
            totalLeads: property.totalLeads,
            leadScore: property.leadScore,
          }),
          propertyId: property.propertyId,
        });

        // Send notification
        await notifyOwner({
          title: `🔥 High Lead Volume Alert`,
          content: `Property ${property.propertyId} is trending with ${property.avgLeadsPerDay.toFixed(1)} leads/day and a score of ${property.leadScore.toFixed(1)}`,
        });
      }
    }
  } catch (error) {
    console.error('Error checking high lead volume:', error);
  }
}

/**
 * Check for import failures and create alert
 */
export async function checkImportFailures(config: AlertConfig = DEFAULT_CONFIG) {
  const db = await getDb();
  if (!db) return;

  try {
    const lastDay = new Date();
    lastDay.setDate(lastDay.getDate() - 1);

    // Get recent failed imports
    const failedImports = await db
      .select()
      .from(importLogs)
      .where(gte(importLogs.startedAt, lastDay));

    for (const importLog of failedImports) {
      if (importLog.successRate < config.importFailureThreshold) {
        // Check if alert already exists
        const existingAlert = await db
          .select()
          .from(alertLogs)
          .where(eq(alertLogs.alertType, 'import_failed'))
          .limit(1);

        if (existingAlert.length === 0) {
          // Create new alert
          await db.insert(alertLogs).values({
            alertType: 'import_failed',
            severity: 'warning',
            title: `Import Failure - ${importLog.location}`,
            message: `${importLog.importType} import to ${importLog.location} failed with ${importLog.successRate.toFixed(1)}% success rate`,
            details: JSON.stringify({
              importType: importLog.importType,
              location: importLog.location,
              successRate: importLog.successRate,
              propertiesRequested: importLog.propertiesRequested,
              propertiesImported: importLog.propertiesImported,
              propertiesFailed: importLog.propertiesFailed,
              errorMessage: importLog.errorMessage,
            }),
            city: importLog.location,
          });

          // Send notification
          await notifyOwner({
            title: `⚠️ Import Failed - ${importLog.location}`,
            content: `${importLog.importType} import to ${importLog.location} had only ${importLog.successRate.toFixed(1)}% success rate. ${importLog.propertiesFailed} properties failed to import.`,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking import failures:', error);
  }
}

/**
 * Check for market heat changes and create alert
 */
export async function checkMarketHeatChanges(config: AlertConfig = DEFAULT_CONFIG) {
  const db = await getDb();
  if (!db) return;

  try {
    const lastDay = new Date();
    lastDay.setDate(lastDay.getDate() - 1);

    // Get markets with significant heat changes
    const markets = await db
      .select()
      .from(marketAnalytics)
      .where(gte(marketAnalytics.updatedAt, lastDay));

    for (const market of markets) {
      const heatChange = Math.abs(market.leadsTrend || 0);

      if (heatChange > config.marketHeatChangeThreshold) {
        // Create alert
        await db.insert(alertLogs).values({
          alertType: 'market_heat_change',
          severity: market.leadsTrend! > 0 ? 'info' : 'warning',
          title: `Market Heat Change - ${market.city}, ${market.state}`,
          message: `${market.city}, ${market.state} market heat ${market.leadsTrend! > 0 ? 'increased' : 'decreased'} by ${heatChange.toFixed(1)}%`,
          details: JSON.stringify({
            city: market.city,
            state: market.state,
            marketHeat: market.marketHeat,
            heatScore: market.heatScore,
            leadsTrend: market.leadsTrend,
            leadsPerProperty: market.leadsPerProperty,
          }),
          city: market.city,
        });

        // Send notification
        await notifyOwner({
          title: `🌡️ Market Heat Change - ${market.city}`,
          content: `${market.city}, ${market.state} market is now ${market.marketHeat} with ${market.leadsPerProperty.toFixed(1)} leads per property`,
        });
      }
    }
  } catch (error) {
    console.error('Error checking market heat changes:', error);
  }
}

/**
 * Check for low conversion rates and create alert
 */
export async function checkLowConversionRates(config: AlertConfig = DEFAULT_CONFIG) {
  const db = await getDb();
  if (!db) return;

  try {
    // Get properties with low conversion rates
    const lowConversion = await db
      .select()
      .from(propertyMetrics)
      .where(gte(propertyMetrics.totalLeads, 5)); // Only check properties with at least 5 leads

    for (const property of lowConversion) {
      if (property.leadToConversionRate < config.lowConversionThreshold && property.totalLeads > 0) {
        // Check if alert already exists
        const existingAlert = await db
          .select()
          .from(alertLogs)
          .where(eq(alertLogs.propertyId, property.propertyId))
          .limit(1);

        if (existingAlert.length === 0) {
          // Create alert
          await db.insert(alertLogs).values({
            alertType: 'low_conversion_rate',
            severity: 'warning',
            title: `Low Conversion Rate - Property ${property.propertyId}`,
            message: `Property ${property.propertyId} has a low conversion rate of ${property.leadToConversionRate.toFixed(1)}% (${property.totalConversions}/${property.totalLeads} leads)`,
            details: JSON.stringify({
              propertyId: property.propertyId,
              totalLeads: property.totalLeads,
              totalConversions: property.totalConversions,
              conversionRate: property.leadToConversionRate,
              leadScore: property.leadScore,
            }),
            propertyId: property.propertyId,
          });

          // Send notification
          await notifyOwner({
            title: `📉 Low Conversion Rate - Property ${property.propertyId}`,
            content: `Property ${property.propertyId} has only ${property.leadToConversionRate.toFixed(1)}% conversion rate. Consider optimizing the listing or follow-up process.`,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking low conversion rates:', error);
  }
}

/**
 * Check for trending properties and create alert
 */
export async function checkTrendingProperties() {
  const db = await getDb();
  if (!db) return;

  try {
    // Get top 3 properties by lead score
    const trending = await db
      .select()
      .from(propertyMetrics)
      .orderBy(desc(propertyMetrics.leadScore))
      .limit(3);

    for (const property of trending) {
      if (property.leadScore > 80) {
        // Create alert for trending property
        await db.insert(alertLogs).values({
          alertType: 'property_trending',
          severity: 'info',
          title: `Trending Property - ${property.propertyId}`,
          message: `Property ${property.propertyId} is trending with a lead score of ${property.leadScore.toFixed(1)}`,
          details: JSON.stringify({
            propertyId: property.propertyId,
            leadScore: property.leadScore,
            totalLeads: property.totalLeads,
            avgLeadsPerDay: property.avgLeadsPerDay,
          }),
          propertyId: property.propertyId,
        });
      }
    }
  } catch (error) {
    console.error('Error checking trending properties:', error);
  }
}

/**
 * Check API quota usage
 */
export async function checkApiQuotaUsage(
  currentUsage: number,
  quotaLimit: number,
  config: AlertConfig = DEFAULT_CONFIG
) {
  const db = await getDb();
  if (!db) return;

  try {
    const usagePercent = (currentUsage / quotaLimit) * 100;

    if (usagePercent > config.apiQuotaWarningPercent) {
      // Create alert
      await db.insert(alertLogs).values({
        alertType: 'api_quota_warning',
        severity: usagePercent > 95 ? 'critical' : 'warning',
        title: 'API Quota Warning',
        message: `API quota usage is at ${usagePercent.toFixed(1)}% (${currentUsage}/${quotaLimit} calls)`,
        details: JSON.stringify({
          currentUsage,
          quotaLimit,
          usagePercent,
        }),
      });

      // Send notification
      await notifyOwner({
        title: `⚠️ API Quota Warning`,
        content: `Your API quota is ${usagePercent.toFixed(1)}% used (${currentUsage}/${quotaLimit} calls). Consider upgrading your plan.`,
      });
    }
  } catch (error) {
    console.error('Error checking API quota:', error);
  }
}

/**
 * Acknowledge alert
 */
export async function acknowledgeAlert(alertId: number) {
  const db = await getDb();
  if (!db) return;

  try {
    await db
      .update(alertLogs)
      .set({
        status: 'acknowledged',
        acknowledgedAt: new Date(),
      })
      .where(eq(alertLogs.id, alertId));
  } catch (error) {
    console.error('Error acknowledging alert:', error);
  }
}

/**
 * Resolve alert
 */
export async function resolveAlert(alertId: number) {
  const db = await getDb();
  if (!db) return;

  try {
    await db
      .update(alertLogs)
      .set({
        status: 'resolved',
      })
      .where(eq(alertLogs.id, alertId));
  } catch (error) {
    console.error('Error resolving alert:', error);
  }
}

/**
 * Run all monitoring checks
 */
export async function runMonitoringChecks(config: AlertConfig = DEFAULT_CONFIG) {
  console.log('[Monitoring] Running all checks...');

  await Promise.all([
    checkHighLeadVolume(config),
    checkImportFailures(config),
    checkMarketHeatChanges(config),
    checkLowConversionRates(config),
    checkTrendingProperties(),
  ]);

  console.log('[Monitoring] All checks completed');
}

/**
 * Schedule monitoring to run periodically
 */
export function scheduleMonitoring(intervalMinutes: number = 60, config: AlertConfig = DEFAULT_CONFIG) {
  console.log(`[Monitoring] Scheduled to run every ${intervalMinutes} minutes`);

  // Run immediately
  runMonitoringChecks(config);

  // Run periodically
  setInterval(() => {
    runMonitoringChecks(config);
  }, intervalMinutes * 60 * 1000);
}
