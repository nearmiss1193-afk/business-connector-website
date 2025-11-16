CREATE TABLE `property_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`property_id` int NOT NULL,
	`mls_id` varchar(100) NOT NULL,
	`reporter_name` varchar(200),
	`reporter_email` varchar(320),
	`reporter_phone` varchar(20),
	`report_type` enum('sold','off_market','wrong_price','wrong_details','wrong_address','duplicate','spam','other') NOT NULL,
	`description` text,
	`status` enum('pending','reviewing','resolved','dismissed') NOT NULL DEFAULT 'pending',
	`admin_notes` text,
	`reviewed_by` varchar(100),
	`reviewed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `property_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `property_id_idx` ON `property_reports` (`property_id`);--> statement-breakpoint
CREATE INDEX `mls_id_idx` ON `property_reports` (`mls_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `property_reports` (`status`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `property_reports` (`created_at`);