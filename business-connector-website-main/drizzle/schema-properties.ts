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
    "coming_soon"
  ]).default("active").notNull(),
  
  listingDate: timestamp("listing_date"),
  soldDate: timestamp("sold_date"),
  daysOnMarket: int("days_on_market"),
  
  // Description & Features
  description: text("description"),
  features: text("features"), // JSON string of features array
  amenities: text("amenities"), // JSON string of amenities
  
  // Media
  primaryImage: varchar("primary_image", { length: 500 }),
  hasVirtualTour: boolean("has_virtual_tour").default(false),
  virtualTourUrl: varchar("virtual_tour_url", { length: 500 }),
  videoUrl: varchar("video_url", { length: 500 }),
  
  // Location Data
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  neighborhood: varchar("neighborhood", { length: 200 }),
  
  // School Information
  elementarySchool: varchar("elementary_school", { length: 200 }),
  middleSchool: varchar("middle_school", { length: 200 }),
  highSchool: varchar("high_school", { length: 200 }),
  schoolDistrict: varchar("school_district", { length: 200 }),
  
  // HOA Information
  hasHOA: boolean("has_hoa").default(false),
  hoaFee: decimal("hoa_fee", { precision: 10, scale: 2 }),
  hoaFrequency: varchar("hoa_frequency", { length: 50 }), // monthly, annually, etc.
  
  // Additional Details
  parking: varchar("parking", { length: 100 }),
  garage: int("garage"), // number of garage spaces
  stories: int("stories"),
  pool: boolean("pool").default(false),
  waterfront: boolean("waterfront").default(false),
  
  // Agent/Listing Info
  listingAgentName: varchar("listing_agent_name", { length: 200 }),
  listingAgentPhone: varchar("listing_agent_phone", { length: 20 }),
  listingAgentEmail: varchar("listing_agent_email", { length: 200 }),
  listingBrokerage: varchar("listing_brokerage", { length: 200 }),
  
  // Metadata
  source: varchar("source", { length: 100 }).notNull(), // zillow, realtor.com, etc.
  lastSyncedAt: timestamp("last_synced_at").defaultNow().notNull(),
  
  // Verification & Cleanup
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(), // Last time property appeared in API
  isActive: boolean("is_active").default(true).notNull(), // False if off-market
  verificationStatus: mysqlEnum("verification_status", [
    "active",      // Normal active listing
    "off_market",  // Not seen in API for 7+ days
    "flagged",     // Manually flagged by admin
    "reported",    // User reported as inaccurate
    "verified"     // Admin verified as accurate
  ]).default("active").notNull(),
  flaggedReason: text("flagged_reason"), // Reason for flagging
  flaggedAt: timestamp("flagged_at"),
  flaggedBy: varchar("flagged_by", { length: 100 }), // Admin user ID
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // Indexes for search performance
  cityIdx: index("city_idx").on(table.city),
  priceIdx: index("price_idx").on(table.price),
  statusIdx: index("status_idx").on(table.listingStatus),
  bedroomsIdx: index("bedrooms_idx").on(table.bedrooms),
  bathroomsIdx: index("bathrooms_idx").on(table.bathrooms),
  propertyTypeIdx: index("property_type_idx").on(table.propertyType),
  mlsIdIdx: index("mls_id_idx").on(table.mlsId),
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
