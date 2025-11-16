/**
 * Lead Scoring and Analytics Schema
 * Tracks property performance, lead metrics, and import success rates
 */

import { int, mysqlTable, text, varchar, decimal, boolean, timestamp, mysqlEnum, index, float } from "drizzle-orm/mysql-core";

/**
 * Property Metrics Table
 * Aggregated metrics for each property (views, leads, conversions, score)
 */
export const propertyMetrics = mysqlTable("property_metrics", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("property_id").notNull().unique(),
  
  // Engagement metrics
  totalViews: int("total_views").default(0).notNull(),
  totalLeads: int("total_leads").default(0).notNull(),
  totalConversions: int("total_conversions").default(0).notNull(),
  
  // Conversion rates
  viewToLeadRate: float("view_to_lead_rate").default(0).notNull(), // percentage
  leadToConversionRate: float("lead_to_conversion_rate").default(0).notNull(), // percentage
  
  // Lead scoring
  leadScore: float("lead_score").default(0).notNull(), // 0-100
  scoreFactors: text("score_factors"), // JSON: {views: 20, leads: 50, conversions: 30, ...}
  
  // Performance ranking
  marketRank: int("market_rank"), // Rank within city/market
  cityAverageScore: float("city_average_score").default(0).notNull(),
  
  // Time-based metrics
  avgLeadsPerDay: float("avg_leads_per_day").default(0).notNull(),
  avgLeadsPerWeek: float("avg_leads_per_week").default(0).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  lastLeadAt: timestamp("last_lead_at"),
}, (table) => ({
  propertyIdIdx: index("property_id_idx").on(table.propertyId),
  scoreIdx: index("score_idx").on(table.leadScore),
  marketRankIdx: index("market_rank_idx").on(table.marketRank),
}));

/**
 * Lead Scores Table
 * Individual lead scoring records for tracking and analysis
 */
export const leadScores = mysqlTable("lead_scores", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("lead_id"),
  propertyId: int("property_id").notNull(),
  
  // Scoring breakdown
  score: float("score").notNull(), // 0-100
  viewScore: float("view_score").default(0).notNull(), // Based on property views
  engagementScore: float("engagement_score").default(0).notNull(), // Based on lead engagement
  conversionScore: float("conversion_score").default(0).notNull(), // Based on conversion likelihood
  marketScore: float("market_score").default(0).notNull(), // Based on market conditions
  
  // Lead details
  leadSource: varchar("lead_source", { length: 100 }), // property_detail, search, email, etc.
  leadQuality: mysqlEnum("lead_quality", ["hot", "warm", "cold", "unqualified"]).default("warm").notNull(),
  
  // Scoring factors
  factors: text("factors"), // JSON: detailed breakdown of score calculation
  
  // Status
  status: mysqlEnum("status", ["pending", "contacted", "qualified", "converted", "lost"]).default("pending").notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  propertyIdIdx: index("property_id_idx").on(table.propertyId),
  scoreIdx: index("score_idx").on(table.score),
  qualityIdx: index("quality_idx").on(table.leadQuality),
}));

/**
 * Import Logs Table
 * Track Zillow/MLS import success rates and metrics
 */
export const importLogs = mysqlTable("import_logs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Import details
  importType: mysqlEnum("import_type", ["zillow", "mls", "realtor", "manual"]).notNull(),
  location: varchar("location", { length: 200 }).notNull(), // City, State or ZIP
  
  // Metrics
  propertiesRequested: int("properties_requested").notNull(),
  propertiesImported: int("properties_imported").notNull(),
  propertiesFailed: int("properties_failed").default(0).notNull(),
  successRate: float("success_rate").notNull(), // percentage
  
  // Details
  status: mysqlEnum("status", ["started", "completed", "failed", "partial"]).notNull(),
  errorMessage: text("error_message"),
  errorDetails: text("error_details"), // JSON
  
  // GHL integration
  ghlImported: int("ghl_imported").default(0).notNull(),
  ghlFailed: int("ghl_failed").default(0).notNull(),
  ghlStatus: mysqlEnum("ghl_status", ["pending", "synced", "failed"]).default("pending").notNull(),
  
  // Timestamps
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  duration: int("duration"), // seconds
}, (table) => ({
  locationIdx: index("location_idx").on(table.location),
  statusIdx: index("status_idx").on(table.status),
  importTypeIdx: index("import_type_idx").on(table.importType),
  createdAtIdx: index("created_at_idx").on(table.startedAt),
}));

/**
 * Market Analytics Table
 * City/market level analytics for trend identification
 */
export const marketAnalytics = mysqlTable("market_analytics", {
  id: int("id").autoincrement().primaryKey(),
  
  // Market identification
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  zipCode: varchar("zip_code", { length: 10 }),
  
  // Market metrics
  totalProperties: int("total_properties").default(0).notNull(),
  activeListings: int("active_listings").default(0).notNull(),
  soldListings: int("sold_listings").default(0).notNull(),
  
  // Price metrics
  avgPrice: decimal("avg_price", { precision: 12, scale: 2 }),
  medianPrice: decimal("median_price", { precision: 12, scale: 2 }),
  pricePerSqft: decimal("price_per_sqft", { precision: 10, scale: 2 }),
  
  // Market heat
  marketHeat: mysqlEnum("market_heat", ["cold", "warm", "hot", "very_hot"]).default("warm").notNull(),
  heatScore: float("heat_score").default(50).notNull(), // 0-100
  
  // Demand metrics
  avgDaysOnMarket: float("avg_days_on_market").default(0).notNull(),
  priceReductionRate: float("price_reduction_rate").default(0).notNull(), // percentage
  
  // Lead metrics
  totalLeads: int("total_leads").default(0).notNull(),
  leadsPerProperty: float("leads_per_property").default(0).notNull(),
  conversionRate: float("conversion_rate").default(0).notNull(),
  
  // Trends
  priceChange: float("price_change").default(0), // percentage change from previous period
  leadsTrend: float("leads_trend").default(0), // percentage change
  
  // Timestamps
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  cityIdx: index("city_idx").on(table.city),
  heatIdx: index("heat_idx").on(table.marketHeat),
  periodIdx: index("period_idx").on(table.periodStart),
}));

/**
 * Daily Metrics Snapshot Table
 * Daily aggregated metrics for trend analysis
 */
export const dailyMetrics = mysqlTable("daily_metrics", {
  id: int("id").autoincrement().primaryKey(),
  
  // Date
  date: timestamp("date").notNull().unique(),
  
  // Daily totals
  totalLeads: int("total_leads").default(0).notNull(),
  totalViews: int("total_views").default(0).notNull(),
  totalConversions: int("total_conversions").default(0).notNull(),
  
  // Import metrics
  importsCompleted: int("imports_completed").default(0).notNull(),
  importsFailed: int("imports_failed").default(0).notNull(),
  propertiesImported: int("properties_imported").default(0).notNull(),
  
  // Performance
  avgLeadScore: float("avg_lead_score").default(0).notNull(),
  conversionRate: float("conversion_rate").default(0).notNull(),
  
  // Top performers
  topProperty: int("top_property"), // property_id
  topCity: varchar("top_city", { length: 100 }),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  dateIdx: index("date_idx").on(table.date),
}));

/**
 * Alert Logs Table
 * Track system alerts and notifications
 */
export const alertLogs = mysqlTable("alert_logs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Alert details
  alertType: mysqlEnum("alert_type", [
    "high_lead_volume",
    "import_failed",
    "market_heat_change",
    "property_trending",
    "low_conversion_rate",
    "api_quota_warning"
  ]).notNull(),
  
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
  
  // Content
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  details: text("details"), // JSON
  
  // References
  propertyId: int("property_id"),
  city: varchar("city", { length: 100 }),
  
  // Status
  status: mysqlEnum("status", ["new", "acknowledged", "resolved"]).default("new").notNull(),
  
  // Notification
  notified: boolean("notified").default(false).notNull(),
  notifiedAt: timestamp("notified_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  acknowledgedAt: timestamp("acknowledged_at"),
}, (table) => ({
  alertTypeIdx: index("alert_type_idx").on(table.alertType),
  severityIdx: index("severity_idx").on(table.severity),
  propertyIdIdx: index("property_id_idx").on(table.propertyId),
  statusIdx: index("status_idx").on(table.status),
}));

// Type exports
export type PropertyMetrics = typeof propertyMetrics.$inferSelect;
export type InsertPropertyMetrics = typeof propertyMetrics.$inferInsert;
export type LeadScore = typeof leadScores.$inferSelect;
export type InsertLeadScore = typeof leadScores.$inferInsert;
export type ImportLog = typeof importLogs.$inferSelect;
export type InsertImportLog = typeof importLogs.$inferInsert;
export type MarketAnalytics = typeof marketAnalytics.$inferSelect;
export type InsertMarketAnalytics = typeof marketAnalytics.$inferInsert;
export type DailyMetrics = typeof dailyMetrics.$inferSelect;
export type InsertDailyMetrics = typeof dailyMetrics.$inferInsert;
export type AlertLog = typeof alertLogs.$inferSelect;
export type InsertAlertLog = typeof alertLogs.$inferInsert;
