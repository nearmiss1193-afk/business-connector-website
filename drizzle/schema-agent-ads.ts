import { int, mysqlTable, text, timestamp, varchar, mysqlEnum, boolean } from "drizzle-orm/mysql-core";

/**
 * Agent advertising system schema
 * Allows realtors/agents to place banner ads on the property website
 * Captures interested agents as leads for Business Conector packages
 */

export const agentAds = mysqlTable("agent_ads", {
  id: int("id").autoincrement().primaryKey(),
  
  // Agent Information
  agentName: varchar("agent_name", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  website: varchar("website", { length: 500 }),
  
  // Banner Details
  bannerImageUrl: varchar("banner_image_url", { length: 1000 }).notNull(),
  bannerTitle: varchar("banner_title", { length: 255 }),
  bannerDescription: text("banner_description"),
  ctaText: varchar("cta_text", { length: 100 }).default("Contact Agent"),
  ctaUrl: varchar("cta_url", { length: 500 }),
  
  // Placement Configuration
  placement: mysqlEnum("placement", ["sidebar", "between_listings", "property_detail", "all"]).default("sidebar").notNull(),
  position: int("position").default(0), // Order priority (lower = higher priority)
  
  // Status & Scheduling
  status: mysqlEnum("status", ["pending", "active", "paused", "expired", "rejected"]).default("pending").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Tracking
  impressions: int("impressions").default(0).notNull(),
  clicks: int("clicks").default(0).notNull(),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  approvedBy: int("approved_by"), // Admin user ID who approved
  approvedAt: timestamp("approved_at"),
  notes: text("notes"), // Admin notes
});

export const adClicks = mysqlTable("ad_clicks", {
  id: int("id").autoincrement().primaryKey(),
  adId: int("ad_id").notNull(),
  
  // Tracking Information
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  referrer: varchar("referrer", { length: 500 }),
  
  // Context
  pageUrl: varchar("page_url", { length: 500 }),
  propertyId: int("property_id"), // If clicked from property detail page
});

export const adInquiries = mysqlTable("ad_inquiries", {
  id: int("id").autoincrement().primaryKey(),
  adId: int("ad_id"),
  
  // Inquirer Information (agent interested in advertising)
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  companyName: varchar("company_name", { length: 255 }),
  
  // Inquiry Details
  message: text("message"),
  interestedPackage: mysqlEnum("interested_package", ["starter", "professional", "premium", "custom"]),
  budget: varchar("budget", { length: 100 }),
  
  // Lead Status
  status: mysqlEnum("status", ["new", "contacted", "qualified", "converted", "lost"]).default("new").notNull(),
  sentToGHL: boolean("sent_to_ghl").default(false).notNull(),
  ghlContactId: varchar("ghl_contact_id", { length: 255 }),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  source: varchar("source", { length: 100 }).default("agent_ad_inquiry"),
});

export type AgentAd = typeof agentAds.$inferSelect;
export type InsertAgentAd = typeof agentAds.$inferInsert;
export type AdClick = typeof adClicks.$inferSelect;
export type InsertAdClick = typeof adClicks.$inferInsert;
export type AdInquiry = typeof adInquiries.$inferSelect;
export type InsertAdInquiry = typeof adInquiries.$inferInsert;
