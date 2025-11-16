import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, index } from "drizzle-orm/mysql-core";

/**
 * Property Reports Table
 * Tracks user-submitted reports of inaccurate or problematic listings
 */
export const propertyReports = mysqlTable("property_reports", {
  id: int("id").autoincrement().primaryKey(),
  
  // Property reference
  propertyId: int("property_id").notNull(),
  mlsId: varchar("mls_id", { length: 100 }).notNull(),
  
  // Reporter information
  reporterName: varchar("reporter_name", { length: 200 }),
  reporterEmail: varchar("reporter_email", { length: 320 }),
  reporterPhone: varchar("reporter_phone", { length: 20 }),
  
  // Report details
  reportType: mysqlEnum("report_type", [
    "sold",           // Property has been sold
    "off_market",     // Property is off market
    "wrong_price",    // Price is incorrect
    "wrong_details",  // Beds, baths, sqft incorrect
    "wrong_address",  // Address is wrong
    "duplicate",      // Duplicate listing
    "spam",           // Spam or fake listing
    "other"           // Other issue
  ]).notNull(),
  
  description: text("description"), // Detailed description of the issue
  
  // Status tracking
  status: mysqlEnum("status", [
    "pending",    // New report, not reviewed
    "reviewing",  // Admin is reviewing
    "resolved",   // Issue fixed
    "dismissed"   // Report was invalid
  ]).default("pending").notNull(),
  
  // Admin response
  adminNotes: text("admin_notes"),
  reviewedBy: varchar("reviewed_by", { length: 100 }), // Admin user ID
  reviewedAt: timestamp("reviewed_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  propertyIdIdx: index("property_id_idx").on(table.propertyId),
  mlsIdIdx: index("mls_id_idx").on(table.mlsId),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type PropertyReport = typeof propertyReports.$inferSelect;
export type InsertPropertyReport = typeof propertyReports.$inferInsert;
