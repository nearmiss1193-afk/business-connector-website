/**
 * Analytics Database Helper Functions
 * Queries and aggregations for lead scoring dashboard
 */

import { getDb } from './db';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import {
  propertyMetrics,
  leadScores,
  importLogs,
  marketAnalytics,
  dailyMetrics,
  alertLogs,
} from '../drizzle/schema-analytics';

/**
 * Get top performing properties by lead score
 */
export async function getTopProperties(limit: number = 10, city?: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    let query = db
      .select({
        id: propertyMetrics.id,
        propertyId: propertyMetrics.propertyId,
        leadScore: propertyMetrics.leadScore,
        totalViews: propertyMetrics.totalViews,
        totalLeads: propertyMetrics.totalLeads,
        totalConversions: propertyMetrics.totalConversions,
        viewToLeadRate: propertyMetrics.viewToLeadRate,
        leadToConversionRate: propertyMetrics.leadToConversionRate,
        marketRank: propertyMetrics.marketRank,
        avgLeadsPerDay: propertyMetrics.avgLeadsPerDay,
      })
      .from(propertyMetrics)
      .orderBy(desc(propertyMetrics.leadScore))
      .limit(limit);

    const results = await query;
    return results;
  } catch (error) {
    console.error('Error fetching top properties:', error);
    return [];
  }
}

/**
 * Get property metrics by ID
 */
export async function getPropertyMetrics(propertyId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(propertyMetrics)
      .where(eq(propertyMetrics.propertyId, propertyId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error fetching property metrics:', error);
    return null;
  }
}

/**
 * Get import success rates
 */
export async function getImportSuccessRates(days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await db
      .select({
        importType: importLogs.importType,
        location: importLogs.location,
        totalImports: sql<number>`COUNT(*)`,
        avgSuccessRate: sql<number>`AVG(${importLogs.successRate})`,
        totalPropertiesImported: sql<number>`SUM(${importLogs.propertiesImported})`,
        totalFailed: sql<number>`SUM(${importLogs.propertiesFailed})`,
        lastImport: sql<string>`MAX(${importLogs.completedAt})`,
      })
      .from(importLogs)
      .where(gte(importLogs.startedAt, startDate))
      .groupBy(importLogs.importType, importLogs.location);

    return results;
  } catch (error) {
    console.error('Error fetching import success rates:', error);
    return [];
  }
}

/**
 * Get market analytics for a city
 */
export async function getMarketAnalytics(city: string, state: string = 'FL') {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(marketAnalytics)
      .where(and(eq(marketAnalytics.city, city), eq(marketAnalytics.state, state)))
      .orderBy(desc(marketAnalytics.updatedAt))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error fetching market analytics:', error);
    return null;
  }
}

/**
 * Get hot markets ranking
 */
export async function getHotMarkets(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  try {
    const results = await db
      .select({
        city: marketAnalytics.city,
        state: marketAnalytics.state,
        marketHeat: marketAnalytics.marketHeat,
        heatScore: marketAnalytics.heatScore,
        totalLeads: marketAnalytics.totalLeads,
        leadsPerProperty: marketAnalytics.leadsPerProperty,
        avgPrice: marketAnalytics.avgPrice,
        avgDaysOnMarket: marketAnalytics.avgDaysOnMarket,
        conversionRate: marketAnalytics.conversionRate,
      })
      .from(marketAnalytics)
      .orderBy(desc(marketAnalytics.heatScore))
      .limit(limit);

    return results;
  } catch (error) {
    console.error('Error fetching hot markets:', error);
    return [];
  }
}

/**
 * Get lead scores for a property
 */
export async function getPropertyLeadScores(propertyId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  try {
    const results = await db
      .select()
      .from(leadScores)
      .where(eq(leadScores.propertyId, propertyId))
      .orderBy(desc(leadScores.createdAt))
      .limit(limit);

    return results;
  } catch (error) {
    console.error('Error fetching lead scores:', error);
    return [];
  }
}

/**
 * Get daily metrics summary
 */
export async function getDailyMetricsSummary(days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await db
      .select()
      .from(dailyMetrics)
      .where(gte(dailyMetrics.date, startDate))
      .orderBy(desc(dailyMetrics.date));

    return results;
  } catch (error) {
    console.error('Error fetching daily metrics:', error);
    return [];
  }
}

/**
 * Get lead quality distribution
 */
export async function getLeadQualityDistribution(days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await db
      .select({
        quality: leadScores.leadQuality,
        count: sql<number>`COUNT(*)`,
        avgScore: sql<number>`AVG(${leadScores.score})`,
      })
      .from(leadScores)
      .where(gte(leadScores.createdAt, startDate))
      .groupBy(leadScores.leadQuality);

    return results;
  } catch (error) {
    console.error('Error fetching lead quality distribution:', error);
    return [];
  }
}

/**
 * Get conversion funnel data
 */
export async function getConversionFunnel(days: number = 30) {
  const db = await getDb();
  if (!db) return null;

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await db
      .select({
        status: leadScores.status,
        count: sql<number>`COUNT(*)`,
        percentage: sql<number>`(COUNT(*) / (SELECT COUNT(*) FROM ${leadScores} WHERE ${gte(leadScores.createdAt, startDate)}) * 100)`,
      })
      .from(leadScores)
      .where(gte(leadScores.createdAt, startDate))
      .groupBy(leadScores.status);

    return results;
  } catch (error) {
    console.error('Error fetching conversion funnel:', error);
    return [];
  }
}

/**
 * Get alerts
 */
export async function getAlerts(limit: number = 20, severity?: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    let query = db
      .select()
      .from(alertLogs)
      .orderBy(desc(alertLogs.createdAt))
      .limit(limit);

    if (severity) {
      query = db
        .select()
        .from(alertLogs)
        .where(eq(alertLogs.severity, severity as any))
        .orderBy(desc(alertLogs.createdAt))
        .limit(limit);
    }

    const results = await query;
    return results;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

/**
 * Create or update property metrics
 */
export async function upsertPropertyMetrics(
  propertyId: number,
  data: {
    totalViews?: number;
    totalLeads?: number;
    totalConversions?: number;
    leadScore?: number;
    scoreFactors?: string;
  }
) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Calculate rates if we have the data
    let viewToLeadRate = 0;
    let leadToConversionRate = 0;

    if (data.totalViews && data.totalLeads) {
      viewToLeadRate = (data.totalLeads / data.totalViews) * 100;
    }

    if (data.totalLeads && data.totalConversions) {
      leadToConversionRate = (data.totalConversions / data.totalLeads) * 100;
    }

    const result = await db
      .insert(propertyMetrics)
      .values({
        propertyId,
        totalViews: data.totalViews || 0,
        totalLeads: data.totalLeads || 0,
        totalConversions: data.totalConversions || 0,
        viewToLeadRate,
        leadToConversionRate,
        leadScore: data.leadScore || 0,
        scoreFactors: data.scoreFactors,
      })
      .onDuplicateKeyUpdate({
        set: {
          totalViews: data.totalViews,
          totalLeads: data.totalLeads,
          totalConversions: data.totalConversions,
          viewToLeadRate,
          leadToConversionRate,
          leadScore: data.leadScore,
          scoreFactors: data.scoreFactors,
          updatedAt: new Date(),
        },
      });

    return result;
  } catch (error) {
    console.error('Error upserting property metrics:', error);
    return null;
  }
}

/**
 * Create import log
 */
export async function createImportLog(data: {
  importType: 'zillow' | 'mls' | 'realtor' | 'manual';
  location: string;
  propertiesRequested: number;
  propertiesImported: number;
  propertiesFailed?: number;
  status: 'started' | 'completed' | 'failed' | 'partial';
  errorMessage?: string;
  ghlImported?: number;
  ghlFailed?: number;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    const successRate = (data.propertiesImported / data.propertiesRequested) * 100;

    const result = await db.insert(importLogs).values({
      importType: data.importType,
      location: data.location,
      propertiesRequested: data.propertiesRequested,
      propertiesImported: data.propertiesImported,
      propertiesFailed: data.propertiesFailed || 0,
      successRate,
      status: data.status,
      errorMessage: data.errorMessage,
      ghlImported: data.ghlImported || 0,
      ghlFailed: data.ghlFailed || 0,
    });

    return result;
  } catch (error) {
    console.error('Error creating import log:', error);
    return null;
  }
}

/**
 * Create alert
 */
export async function createAlert(data: {
  alertType: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  details?: string;
  propertyId?: number;
  city?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(alertLogs).values({
      alertType: data.alertType as any,
      severity: data.severity,
      title: data.title,
      message: data.message,
      details: data.details,
      propertyId: data.propertyId,
      city: data.city,
    });

    return result;
  } catch (error) {
    console.error('Error creating alert:', error);
    return null;
  }
}

/**
 * Get dashboard summary
 */
export async function getDashboardSummary() {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get today's metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [dailyData] = await Promise.all([
      db
        .select({
          totalLeads: sql<number>`COALESCE(SUM(${dailyMetrics.totalLeads}), 0)`,
          totalConversions: sql<number>`COALESCE(SUM(${dailyMetrics.totalConversions}), 0)`,
          importsCompleted: sql<number>`COALESCE(SUM(${dailyMetrics.importsCompleted}), 0)`,
          propertiesImported: sql<number>`COALESCE(SUM(${dailyMetrics.propertiesImported}), 0)`,
        })
        .from(dailyMetrics)
        .where(gte(dailyMetrics.date, today)),
    ]);

    // Get top property
    const topProperty = await db
      .select()
      .from(propertyMetrics)
      .orderBy(desc(propertyMetrics.leadScore))
      .limit(1);

    // Get hot market
    const hotMarket = await db
      .select()
      .from(marketAnalytics)
      .orderBy(desc(marketAnalytics.heatScore))
      .limit(1);

    // Get recent alerts
    const recentAlerts = await db
      .select()
      .from(alertLogs)
      .where(eq(alertLogs.status, 'new'))
      .orderBy(desc(alertLogs.createdAt))
      .limit(5);

    return {
      today: dailyData?.[0] || {
        totalLeads: 0,
        totalConversions: 0,
        importsCompleted: 0,
        propertiesImported: 0,
      },
      topProperty: topProperty?.[0] || null,
      hotMarket: hotMarket?.[0] || null,
      recentAlerts,
    };
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return null;
  }
}
