CREATE TABLE `agent_lead_limits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`year` int NOT NULL,
	`month` int NOT NULL,
	`leadsPurchased` int NOT NULL DEFAULT 0,
	`maxAllowed` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_lead_limits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255),
	`licenseNumber` varchar(100),
	`specialties` text,
	`yearsExperience` int,
	`bio` text,
	`profileImageUrl` varchar(500),
	`website` varchar(500),
	`phone` varchar(20),
	`serviceAreas` text,
	`averageRating` decimal(3,2),
	`totalReviews` int DEFAULT 0,
	`currentPlan` enum('starter','professional','premium'),
	`subscriptionActive` boolean DEFAULT false,
	`preferredLeadTypes` text,
	`maxLeadsPerMonth` int,
	`isVerified` boolean DEFAULT false,
	`verifiedAt` timestamp,
	`leadsReceived` int DEFAULT 0,
	`leadsPurchased` int DEFAULT 0,
	`conversionRate` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`planType` enum('starter','professional','premium') NOT NULL,
	`monthlyPrice` decimal(10,2) NOT NULL,
	`stripeSubscriptionId` varchar(255),
	`status` enum('active','paused','cancelled','expired') NOT NULL DEFAULT 'active',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`renewalDate` timestamp,
	`cancelledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lead_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`agentId` int NOT NULL,
	`notificationType` enum('email','sms','in_app') NOT NULL,
	`status` enum('sent','failed','bounced') NOT NULL DEFAULT 'sent',
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`openedAt` timestamp,
	`clickedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lead_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lead_purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`agentId` int NOT NULL,
	`leadType` enum('buyer','seller','mortgage') NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`stripePaymentIntentId` varchar(255),
	`paymentStatus` enum('pending','succeeded','failed','refunded') NOT NULL DEFAULT 'pending',
	`deliveredVia` enum('email','sms','api','manual') DEFAULT 'email',
	`deliveredAt` timestamp,
	`agentRating` int,
	`agentFeedback` text,
	`leadConverted` boolean DEFAULT false,
	`conversionNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lead_purchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lead_quality_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`leadType` enum('buyer','seller','mortgage') NOT NULL,
	`criteria` text NOT NULL,
	`qualityScore` enum('hot','warm','cold') NOT NULL,
	`weight` int DEFAULT 1,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lead_quality_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadType` enum('buyer','seller','mortgage') NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`city` varchar(100),
	`state` varchar(2),
	`zipCode` varchar(10),
	`interestedPropertyId` int,
	`budgetMin` decimal(12,2),
	`budgetMax` decimal(12,2),
	`timelineMonths` int,
	`propertyAddress` varchar(255),
	`propertyCity` varchar(100),
	`estimatedValue` decimal(12,2),
	`homePrice` decimal(12,2),
	`downPayment` decimal(12,2),
	`interestRate` decimal(5,2),
	`loanTerm` int,
	`monthlyPayment` decimal(10,2),
	`qualityScore` enum('hot','warm','cold') NOT NULL DEFAULT 'warm',
	`qualityReason` text,
	`status` enum('new','contacted','qualified','converted','lost') NOT NULL DEFAULT 'new',
	`source` varchar(100) NOT NULL,
	`sourcePropertyId` int,
	`isPurchased` boolean NOT NULL DEFAULT false,
	`purchasedBy` int,
	`purchasedAt` timestamp,
	`purchasePrice` decimal(10,2),
	`ghlContactId` varchar(255),
	`ghlPipelineId` varchar(255),
	`capturedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`paymentType` enum('subscription','lead_purchase') NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`stripePaymentId` varchar(255) NOT NULL,
	`stripeInvoiceId` varchar(255),
	`status` enum('pending','succeeded','failed','refunded') NOT NULL DEFAULT 'pending',
	`subscriptionId` int,
	`leadPurchaseId` int,
	`refundedAmount` decimal(12,2),
	`refundReason` text,
	`refundedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `agent_lead_limits_agent_month_idx` ON `agent_lead_limits` (`agentId`,`year`,`month`);--> statement-breakpoint
CREATE INDEX `agent_profiles_userId_idx` ON `agent_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `agent_profiles_isVerified_idx` ON `agent_profiles` (`isVerified`);--> statement-breakpoint
CREATE INDEX `agent_subscriptions_agentId_idx` ON `agent_subscriptions` (`agentId`);--> statement-breakpoint
CREATE INDEX `agent_subscriptions_stripeId_idx` ON `agent_subscriptions` (`stripeSubscriptionId`);--> statement-breakpoint
CREATE INDEX `lead_notifications_leadId_idx` ON `lead_notifications` (`leadId`);--> statement-breakpoint
CREATE INDEX `lead_notifications_agentId_idx` ON `lead_notifications` (`agentId`);--> statement-breakpoint
CREATE INDEX `lead_purchases_leadId_idx` ON `lead_purchases` (`leadId`);--> statement-breakpoint
CREATE INDEX `lead_purchases_agentId_idx` ON `lead_purchases` (`agentId`);--> statement-breakpoint
CREATE INDEX `lead_purchases_paymentStatus_idx` ON `lead_purchases` (`paymentStatus`);--> statement-breakpoint
CREATE INDEX `leads_leadType_idx` ON `leads` (`leadType`);--> statement-breakpoint
CREATE INDEX `leads_status_idx` ON `leads` (`status`);--> statement-breakpoint
CREATE INDEX `leads_qualityScore_idx` ON `leads` (`qualityScore`);--> statement-breakpoint
CREATE INDEX `leads_email_idx` ON `leads` (`email`);--> statement-breakpoint
CREATE INDEX `leads_isPurchased_idx` ON `leads` (`isPurchased`);--> statement-breakpoint
CREATE INDEX `leads_purchasedBy_idx` ON `leads` (`purchasedBy`);--> statement-breakpoint
CREATE INDEX `payments_agentId_idx` ON `payments` (`agentId`);--> statement-breakpoint
CREATE INDEX `payments_stripePaymentId_idx` ON `payments` (`stripePaymentId`);--> statement-breakpoint
CREATE INDEX `payments_status_idx` ON `payments` (`status`);