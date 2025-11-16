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
