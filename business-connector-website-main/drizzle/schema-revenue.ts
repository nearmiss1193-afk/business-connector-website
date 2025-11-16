import {
  int,
  varchar,
  text,
  timestamp,
  decimal,
  mysqlEnum,
  boolean,
  mysqlTable,
  index,
  foreignKey,
} from "drizzle-orm/mysql-core";

/**
 * AGENT SUBSCRIPTIONS
 * Tracks agent subscription plans and billing
 */
export const agentSubscriptions = mysqlTable(
  "agent_subscriptions",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: int("agentId").notNull(),
    planType: mysqlEnum("planType", ["starter", "professional", "premium"])
      .notNull(),
    monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).notNull(),
    stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
    status: mysqlEnum("status", ["active", "paused", "cancelled", "expired"])
      .default("active")
      .notNull(),
    startDate: timestamp("startDate").defaultNow().notNull(),
    renewalDate: timestamp("renewalDate"),
    cancelledAt: timestamp("cancelledAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("agent_subscriptions_agentId_idx").on(table.agentId),
    stripeIdIdx: index("agent_subscriptions_stripeId_idx").on(
      table.stripeSubscriptionId
    ),
  })
);

export type AgentSubscription = typeof agentSubscriptions.$inferSelect;
export type InsertAgentSubscription = typeof agentSubscriptions.$inferInsert;

/**
 * LEADS
 * All captured leads from property searches, mortgage calculator, etc.
 */
export const leads = mysqlTable(
  "leads",
  {
    id: int("id").autoincrement().primaryKey(),
    leadType: mysqlEnum("leadType", ["buyer", "seller", "mortgage"])
      .notNull(),
    firstName: varchar("firstName", { length: 100 }).notNull(),
    lastName: varchar("lastName", { length: 100 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    zipCode: varchar("zipCode", { length: 10 }),
    // Buyer-specific fields
    interestedPropertyId: int("interestedPropertyId"),
    budgetMin: decimal("budgetMin", { precision: 12, scale: 2 }),
    budgetMax: decimal("budgetMax", { precision: 12, scale: 2 }),
    timelineMonths: int("timelineMonths"),
    // Seller-specific fields
    propertyAddress: varchar("propertyAddress", { length: 255 }),
    propertyCity: varchar("propertyCity", { length: 100 }),
    estimatedValue: decimal("estimatedValue", { precision: 12, scale: 2 }),
    // Mortgage-specific fields
    homePrice: decimal("homePrice", { precision: 12, scale: 2 }),
    downPayment: decimal("downPayment", { precision: 12, scale: 2 }),
    interestRate: decimal("interestRate", { precision: 5, scale: 2 }),
    loanTerm: int("loanTerm"),
    monthlyPayment: decimal("monthlyPayment", { precision: 10, scale: 2 }),
    // Lead quality scoring
    qualityScore: mysqlEnum("qualityScore", ["hot", "warm", "cold"])
      .default("warm")
      .notNull(),
    qualityReason: text("qualityReason"),
    // Lead status
    status: mysqlEnum("status", [
      "new",
      "contacted",
      "qualified",
      "converted",
      "lost",
    ])
      .default("new")
      .notNull(),
    // Lead source tracking
    source: varchar("source", { length: 100 }).notNull(), // "property_search", "mortgage_calculator", "buyer_registration"
    sourcePropertyId: int("sourcePropertyId"),
    // Purchase tracking
    isPurchased: boolean("isPurchased").default(false).notNull(),
    purchasedBy: int("purchasedBy"), // agentId
    purchasedAt: timestamp("purchasedAt"),
    purchasePrice: decimal("purchasePrice", { precision: 10, scale: 2 }),
    // GoHighLevel integration
    ghlContactId: varchar("ghlContactId", { length: 255 }),
    ghlPipelineId: varchar("ghlPipelineId", { length: 255 }),
    // Timestamps
    capturedAt: timestamp("capturedAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    leadTypeIdx: index("leads_leadType_idx").on(table.leadType),
    statusIdx: index("leads_status_idx").on(table.status),
    qualityIdx: index("leads_qualityScore_idx").on(table.qualityScore),
    emailIdx: index("leads_email_idx").on(table.email),
    isPurchasedIdx: index("leads_isPurchased_idx").on(table.isPurchased),
    purchasedByIdx: index("leads_purchasedBy_idx").on(table.purchasedBy),
  })
);

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * LEAD PURCHASES
 * Track individual lead purchases by agents
 */
export const leadPurchases = mysqlTable(
  "lead_purchases",
  {
    id: int("id").autoincrement().primaryKey(),
    leadId: int("leadId").notNull(),
    agentId: int("agentId").notNull(),
    leadType: mysqlEnum("leadType", ["buyer", "seller", "mortgage"]).notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
    paymentStatus: mysqlEnum("paymentStatus", [
      "pending",
      "succeeded",
      "failed",
      "refunded",
    ])
      .default("pending")
      .notNull(),
    // Delivery tracking
    deliveredVia: mysqlEnum("deliveredVia", ["email", "sms", "api", "manual"])
      .default("email"),
    deliveredAt: timestamp("deliveredAt"),
    // Agent feedback
    agentRating: int("agentRating"), // 1-5 stars
    agentFeedback: text("agentFeedback"),
    // Conversion tracking
    leadConverted: boolean("leadConverted").default(false),
    conversionNotes: text("conversionNotes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    leadIdIdx: index("lead_purchases_leadId_idx").on(table.leadId),
    agentIdIdx: index("lead_purchases_agentId_idx").on(table.agentId),
    paymentStatusIdx: index("lead_purchases_paymentStatus_idx").on(
      table.paymentStatus
    ),
  })
);

export type LeadPurchase = typeof leadPurchases.$inferSelect;
export type InsertLeadPurchase = typeof leadPurchases.$inferInsert;

/**
 * AGENT PROFILES
 * Extended agent information for advertising and lead marketplace
 */
export const agentProfiles = mysqlTable(
  "agent_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    companyName: varchar("companyName", { length: 255 }),
    licenseNumber: varchar("licenseNumber", { length: 100 }),
    specialties: text("specialties"), // JSON: ["luxury", "first-time-buyers", "investment"]
    yearsExperience: int("yearsExperience"),
    bio: text("bio"),
    profileImageUrl: varchar("profileImageUrl", { length: 500 }),
    website: varchar("website", { length: 500 }),
    phone: varchar("phone", { length: 20 }),
    // Service areas
    serviceAreas: text("serviceAreas"), // JSON: ["Orlando", "Tampa", "Miami"]
    // Ratings
    averageRating: decimal("averageRating", { precision: 3, scale: 2 }),
    totalReviews: int("totalReviews").default(0),
    // Subscription info
    currentPlan: mysqlEnum("currentPlan", ["starter", "professional", "premium"]),
    subscriptionActive: boolean("subscriptionActive").default(false),
    // Lead preferences
    preferredLeadTypes: text("preferredLeadTypes"), // JSON: ["buyer", "seller"]
    maxLeadsPerMonth: int("maxLeadsPerMonth"),
    // Verification
    isVerified: boolean("isVerified").default(false),
    verifiedAt: timestamp("verifiedAt"),
    // Stats
    leadsReceived: int("leadsReceived").default(0),
    leadsPurchased: int("leadsPurchased").default(0),
    conversionRate: decimal("conversionRate", { precision: 5, scale: 2 }),
    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("agent_profiles_userId_idx").on(table.userId),
    verifiedIdx: index("agent_profiles_isVerified_idx").on(table.isVerified),
  })
);

export type AgentProfile = typeof agentProfiles.$inferSelect;
export type InsertAgentProfile = typeof agentProfiles.$inferInsert;

/**
 * PAYMENTS
 * Track all transactions (subscriptions and lead purchases)
 */
export const payments = mysqlTable(
  "payments",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: int("agentId").notNull(),
    paymentType: mysqlEnum("paymentType", ["subscription", "lead_purchase"])
      .notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    stripePaymentId: varchar("stripePaymentId", { length: 255 }).notNull(),
    stripeInvoiceId: varchar("stripeInvoiceId", { length: 255 }),
    status: mysqlEnum("status", [
      "pending",
      "succeeded",
      "failed",
      "refunded",
    ])
      .default("pending")
      .notNull(),
    // Related objects
    subscriptionId: int("subscriptionId"),
    leadPurchaseId: int("leadPurchaseId"),
    // Refund tracking
    refundedAmount: decimal("refundedAmount", { precision: 12, scale: 2 }),
    refundReason: text("refundReason"),
    refundedAt: timestamp("refundedAt"),
    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("payments_agentId_idx").on(table.agentId),
    stripePaymentIdIdx: index("payments_stripePaymentId_idx").on(
      table.stripePaymentId
    ),
    statusIdx: index("payments_status_idx").on(table.status),
  })
);

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * LEAD QUALITY RULES
 * Configuration for automatic lead quality scoring
 */
export const leadQualityRules = mysqlTable("lead_quality_rules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  leadType: mysqlEnum("leadType", ["buyer", "seller", "mortgage"]).notNull(),
  // Scoring criteria
  criteria: text("criteria").notNull(), // JSON: { budgetMin: 100000, budgetMax: 500000, timelineMonths: 3, ... }
  qualityScore: mysqlEnum("qualityScore", ["hot", "warm", "cold"]).notNull(),
  weight: int("weight").default(1), // Priority weight for rule evaluation
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeadQualityRule = typeof leadQualityRules.$inferSelect;
export type InsertLeadQualityRule = typeof leadQualityRules.$inferInsert;

/**
 * AGENT LEAD LIMITS
 * Track lead purchases to enforce monthly limits
 */
export const agentLeadLimits = mysqlTable(
  "agent_lead_limits",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: int("agentId").notNull(),
    year: int("year").notNull(),
    month: int("month").notNull(),
    leadsPurchased: int("leadsPurchased").default(0).notNull(),
    maxAllowed: int("maxAllowed").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    agentMonthIdx: index("agent_lead_limits_agent_month_idx").on(
      table.agentId,
      table.year,
      table.month
    ),
  })
);

export type AgentLeadLimit = typeof agentLeadLimits.$inferSelect;
export type InsertAgentLeadLimit = typeof agentLeadLimits.$inferInsert;

/**
 * LEAD NOTIFICATIONS
 * Track which agents have been notified about available leads
 */
export const leadNotifications = mysqlTable(
  "lead_notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    leadId: int("leadId").notNull(),
    agentId: int("agentId").notNull(),
    notificationType: mysqlEnum("notificationType", [
      "email",
      "sms",
      "in_app",
    ]).notNull(),
    status: mysqlEnum("status", ["sent", "failed", "bounced"])
      .default("sent")
      .notNull(),
    sentAt: timestamp("sentAt").defaultNow().notNull(),
    openedAt: timestamp("openedAt"),
    clickedAt: timestamp("clickedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    leadIdIdx: index("lead_notifications_leadId_idx").on(table.leadId),
    agentIdIdx: index("lead_notifications_agentId_idx").on(table.agentId),
  })
);

export type LeadNotification = typeof leadNotifications.$inferSelect;
export type InsertLeadNotification = typeof leadNotifications.$inferInsert;
