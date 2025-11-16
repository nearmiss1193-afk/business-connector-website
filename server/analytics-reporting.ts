/**
 * Analytics Reporting Functions
 * Generate reports and exports for lead scoring dashboard
 */

import { getDb } from './db';
import { desc, gte, and } from 'drizzle-orm';
import {
  propertyMetrics,
  importLogs,
  marketAnalytics,
  dailyMetrics,
} from '../drizzle/schema-analytics';

/**
 * Generate CSV export for top properties
 */
export async function generatePropertiesReport(days: number = 30): Promise<string> {
  const db = await getDb();
  if (!db) return '';

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const properties = await db
      .select()
      .from(propertyMetrics)
      .orderBy(desc(propertyMetrics.leadScore))
      .limit(100);

    // Generate CSV header
    const headers = [
      'Property ID',
      'Lead Score',
      'Total Views',
      'Total Leads',
      'Conversions',
      'View to Lead Rate %',
      'Lead to Conversion Rate %',
      'Avg Leads Per Day',
      'Market Rank',
      'Last Updated',
    ];

    // Generate CSV rows
    const rows = properties.map((prop) => [
      prop.propertyId,
      prop.leadScore.toFixed(2),
      prop.totalViews,
      prop.totalLeads,
      prop.totalConversions,
      prop.viewToLeadRate.toFixed(2),
      prop.leadToConversionRate.toFixed(2),
      prop.avgLeadsPerDay.toFixed(2),
      prop.marketRank || 'N/A',
      new Date(prop.updatedAt).toISOString(),
    ]);

    // Combine headers and rows
    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  } catch (error) {
    console.error('Error generating properties report:', error);
    return '';
  }
}

/**
 * Generate CSV export for import logs
 */
export async function generateImportReport(days: number = 30): Promise<string> {
  const db = await getDb();
  if (!db) return '';

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const imports = await db
      .select()
      .from(importLogs)
      .where(gte(importLogs.startedAt, startDate))
      .orderBy(desc(importLogs.startedAt));

    // Generate CSV header
    const headers = [
      'Date',
      'Type',
      'Location',
      'Requested',
      'Imported',
      'Failed',
      'Success Rate %',
      'GHL Imported',
      'GHL Failed',
      'Status',
      'Duration (sec)',
    ];

    // Generate CSV rows
    const rows = imports.map((imp) => [
      new Date(imp.startedAt).toISOString(),
      imp.importType,
      imp.location,
      imp.propertiesRequested,
      imp.propertiesImported,
      imp.propertiesFailed,
      imp.successRate.toFixed(2),
      imp.ghlImported,
      imp.ghlFailed,
      imp.status,
      imp.duration || 'N/A',
    ]);

    // Combine headers and rows
    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  } catch (error) {
    console.error('Error generating import report:', error);
    return '';
  }
}

/**
 * Generate market analysis report
 */
export async function generateMarketReport(days: number = 30): Promise<string> {
  const db = await getDb();
  if (!db) return '';

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const markets = await db
      .select()
      .from(marketAnalytics)
      .where(gte(marketAnalytics.updatedAt, startDate))
      .orderBy(desc(marketAnalytics.heatScore));

    // Generate CSV header
    const headers = [
      'City',
      'State',
      'Market Heat',
      'Heat Score',
      'Total Properties',
      'Active Listings',
      'Avg Price',
      'Avg Days on Market',
      'Total Leads',
      'Leads Per Property',
      'Conversion Rate %',
      'Price Change %',
      'Leads Trend %',
    ];

    // Generate CSV rows
    const rows = markets.map((market) => [
      market.city,
      market.state,
      market.marketHeat,
      market.heatScore.toFixed(2),
      market.totalProperties,
      market.activeListings,
      market.avgPrice || 'N/A',
      market.avgDaysOnMarket.toFixed(1),
      market.totalLeads,
      market.leadsPerProperty.toFixed(2),
      market.conversionRate.toFixed(2),
      (market.priceChange || 0).toFixed(2),
      (market.leadsTrend || 0).toFixed(2),
    ]);

    // Combine headers and rows
    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  } catch (error) {
    console.error('Error generating market report:', error);
    return '';
  }
}

/**
 * Generate performance summary report
 */
export async function generatePerformanceSummary(days: number = 30): Promise<{
  period: string;
  totalLeads: number;
  totalConversions: number;
  conversionRate: number;
  avgLeadScore: number;
  topProperty: any;
  topMarket: any;
  importStats: {
    totalImports: number;
    totalImported: number;
    totalFailed: number;
    avgSuccessRate: number;
  };
}> {
  const db = await getDb();
  if (!db) {
    return {
      period: '',
      totalLeads: 0,
      totalConversions: 0,
      conversionRate: 0,
      avgLeadScore: 0,
      topProperty: null,
      topMarket: null,
      importStats: {
        totalImports: 0,
        totalImported: 0,
        totalFailed: 0,
        avgSuccessRate: 0,
      },
    };
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const endDate = new Date();

    // Get daily metrics summary
    const dailyData = await db
      .select()
      .from(dailyMetrics)
      .where(and(gte(dailyMetrics.date, startDate), gte(endDate, dailyMetrics.date)));

    const totalLeads = dailyData.reduce((sum, d) => sum + (d.totalLeads || 0), 0);
    const totalConversions = dailyData.reduce((sum, d) => sum + (d.totalConversions || 0), 0);
    const conversionRate = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;

    // Get top property
    const topProperty = await db
      .select()
      .from(propertyMetrics)
      .orderBy(desc(propertyMetrics.leadScore))
      .limit(1);

    // Get top market
    const topMarket = await db
      .select()
      .from(marketAnalytics)
      .orderBy(desc(marketAnalytics.heatScore))
      .limit(1);

    // Get import stats
    const importData = await db
      .select()
      .from(importLogs)
      .where(gte(importLogs.startedAt, startDate));

    const importStats = {
      totalImports: importData.length,
      totalImported: importData.reduce((sum, i) => sum + i.propertiesImported, 0),
      totalFailed: importData.reduce((sum, i) => sum + i.propertiesFailed, 0),
      avgSuccessRate:
        importData.length > 0
          ? importData.reduce((sum, i) => sum + i.successRate, 0) / importData.length
          : 0,
    };

    // Calculate average lead score
    const allProperties = await db.select().from(propertyMetrics);
    const avgLeadScore =
      allProperties.length > 0
        ? allProperties.reduce((sum, p) => sum + p.leadScore, 0) / allProperties.length
        : 0;

    return {
      period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      totalLeads,
      totalConversions,
      conversionRate: Math.round(conversionRate * 100) / 100,
      avgLeadScore: Math.round(avgLeadScore * 100) / 100,
      topProperty: topProperty?.[0] || null,
      topMarket: topMarket?.[0] || null,
      importStats,
    };
  } catch (error) {
    console.error('Error generating performance summary:', error);
    return {
      period: '',
      totalLeads: 0,
      totalConversions: 0,
      conversionRate: 0,
      avgLeadScore: 0,
      topProperty: null,
      topMarket: null,
      importStats: {
        totalImports: 0,
        totalImported: 0,
        totalFailed: 0,
        avgSuccessRate: 0,
      },
    };
  }
}

/**
 * Generate JSON report for API consumption
 */
export async function generateJsonReport(days: number = 30): Promise<{
  properties: any[];
  imports: any[];
  markets: any[];
  summary: any;
}> {
  const db = await getDb();
  if (!db) {
    return {
      properties: [],
      imports: [],
      markets: [],
      summary: null,
    };
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [properties, imports, markets, summary] = await Promise.all([
      db.select().from(propertyMetrics).orderBy(desc(propertyMetrics.leadScore)).limit(100),
      db
        .select()
        .from(importLogs)
        .where(gte(importLogs.startedAt, startDate))
        .orderBy(desc(importLogs.startedAt)),
      db
        .select()
        .from(marketAnalytics)
        .where(gte(marketAnalytics.updatedAt, startDate))
        .orderBy(desc(marketAnalytics.heatScore)),
      generatePerformanceSummary(days),
    ]);

    return {
      properties,
      imports,
      markets,
      summary,
    };
  } catch (error) {
    console.error('Error generating JSON report:', error);
    return {
      properties: [],
      imports: [],
      markets: [],
      summary: null,
    };
  }
}
