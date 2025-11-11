ALTER TABLE `properties` ADD `last_seen_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `is_active` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `verification_status` enum('active','off_market','flagged','reported','verified') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `flagged_reason` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `flagged_at` timestamp;--> statement-breakpoint
ALTER TABLE `properties` ADD `flagged_by` varchar(100);