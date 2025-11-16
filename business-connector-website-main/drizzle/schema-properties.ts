// src/schema-properties.ts - Enhanced for performance and relations

import { int, mysqlEnum, mysqlTable, text, varchar, decimal, boolean, timestamp, index } from "drizzle-orm/mysql-core";

export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  mls_id: varchar("mls_id", { length: 100 }),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zip_code: varchar("zip_code", { length: 20 }),
  county: varchar("county", { length: 100 }),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  bedrooms: int("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  sqft: int("sqft"),
  lot_size: int("lot_size"),
  year_built: int("year_built"),
  property_type: mysqlEnum("property_type", ['Single Family', 'Condo', 'Townhouse', 'Multi Family', 'Land', 'Commercial', 'Other', 'notNull']),
  listing_status: mysqlEnum("listing_status", ['Active', 'Pending', 'Sold', 'For Rent', 'Off Market']),
  image_url: text("image_url"),
  listing_url: text("listing_url"),
  virtual_tour_url: text("virtual_tour_url"),
  video_url: text("video_url"),
  has_3d_tour: boolean("has_3d_tour"),
  notes: text("notes"), // For distressed detection
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").onUpdateNow(),
}, (table) => ({
  cityIndex: index("city_idx").on(table.city), // For fast search
  priceIndex: index("price_idx").on(table.price), // For filters
  statusIndex: index("status_idx").on(table.listing_status), // For active listings
}));

/**
 * Property images table
 * Stores multiple images per property
 */
export const propertyImages = mysqlTable("property_images", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("property_id").notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  caption: varchar("caption", { length: 500 }),
  order: int("order").default(0).notNull(), // display order
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  propertyIdIdx: index("property_id_idx").on(table.propertyId),
}));

/**
 * MLS sync log table
 * Tracks synchronization history
 */
export const mlsSyncLog = mysqlTable("mls_sync_log", {
  id: int("id").autoincrement().primaryKey(),
  source: varchar("source", { length: 100 }).notNull(), // zillow, realtor.com, etc.
  syncType: mysqlEnum("sync_type", ["full", "incremental"]).notNull(),
  status: mysqlEnum("status", ["started", "completed", "failed"]).notNull(),

  // Stats
  propertiesAdded: int("properties_added").default(0),
  propertiesUpdated: int("properties_updated").default(0),
  propertiesRemoved: int("properties_removed").default(0),

  // Error tracking
  errorMessage: text("error_message"),
  errorDetails: text("error_details"), // JSON string

  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  sourceIdx: index("source_idx").on(table.source),
  statusIdx: index("status_idx").on(table.status),
}));

/**
 * Property views tracking
 * Track which properties users view (for analytics)
 */
export const propertyViews = mysqlTable("property_views", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("property_id").notNull(),
  sessionId: varchar("session_id", { length: 100 }), // anonymous tracking
  userId: int("user_id"), // if user is registered
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
}, (table) => ({
  propertyIdIdx: index("property_id_idx").on(table.propertyId),
  sessionIdIdx: index("session_id_idx").on(table.sessionId),
}));

// Type exports
export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;
export type PropertyImage = typeof propertyImages.$inferSelect;
export type InsertPropertyImage = typeof propertyImages.$inferInsert;
export type MlsSyncLog = typeof mlsSyncLog.$inferSelect;
export type InsertMlsSyncLog = typeof mlsSyncLog.$inferInsert;
export type PropertyView = typeof propertyViews.$inferSelect;
export type InsertPropertyView = typeof propertyViews.$inferInsert;
