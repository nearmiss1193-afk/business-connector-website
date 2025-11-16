CREATE TABLE `alert_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alert_type` enum('high_lead_volume','import_failed','market_heat_change','property_trending','low_conversion_rate','api_quota_warning') NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`details` text,
	`property_id` int,
	`city` varchar(100),
	`status` enum('new','acknowledged','resolved') NOT NULL DEFAULT 'new',
	`notified` boolean NOT NULL DEFAULT false,
	`notified_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`acknowledged_at` timestamp,
	CONSTRAINT `alert_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`total_leads` int NOT NULL DEFAULT 0,
	`total_views` int NOT NULL DEFAULT 0,
	`total_conversions` int NOT NULL DEFAULT 0,
	`imports_completed` int NOT NULL DEFAULT 0,
	`imports_failed` int NOT NULL DEFAULT 0,
	`properties_imported` int NOT NULL DEFAULT 0,
	`avg_lead_score` float NOT NULL DEFAULT 0,
	`conversion_rate` float NOT NULL DEFAULT 0,
	`top_property` int,
	`top_city` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_metrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `daily_metrics_date_unique` UNIQUE(`date`)
);
--> statement-breakpoint
CREATE TABLE `import_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`import_type` enum('zillow','mls','realtor','manual') NOT NULL,
	`location` varchar(200) NOT NULL,
	`properties_requested` int NOT NULL,
	`properties_imported` int NOT NULL,
	`properties_failed` int NOT NULL DEFAULT 0,
	`success_rate` float NOT NULL,
	`status` enum('started','completed','failed','partial') NOT NULL,
	`error_message` text,
	`error_details` text,
	`ghl_imported` int NOT NULL DEFAULT 0,
	`ghl_failed` int NOT NULL DEFAULT 0,
	`ghl_status` enum('pending','synced','failed') NOT NULL DEFAULT 'pending',
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	`duration` int,
	CONSTRAINT `import_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lead_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lead_id` int,
	`property_id` int NOT NULL,
	`score` float NOT NULL,
	`view_score` float NOT NULL DEFAULT 0,
	`engagement_score` float NOT NULL DEFAULT 0,
	`conversion_score` float NOT NULL DEFAULT 0,
	`market_score` float NOT NULL DEFAULT 0,
	`lead_source` varchar(100),
	`lead_quality` enum('hot','warm','cold','unqualified') NOT NULL DEFAULT 'warm',
	`factors` text,
	`status` enum('pending','contacted','qualified','converted','lost') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lead_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `market_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(2) NOT NULL,
	`zip_code` varchar(10),
	`total_properties` int NOT NULL DEFAULT 0,
	`active_listings` int NOT NULL DEFAULT 0,
	`sold_listings` int NOT NULL DEFAULT 0,
	`avg_price` decimal(12,2),
	`median_price` decimal(12,2),
	`price_per_sqft` decimal(10,2),
	`market_heat` enum('cold','warm','hot','very_hot') NOT NULL DEFAULT 'warm',
	`heat_score` float NOT NULL DEFAULT 50,
	`avg_days_on_market` float NOT NULL DEFAULT 0,
	`price_reduction_rate` float NOT NULL DEFAULT 0,
	`total_leads` int NOT NULL DEFAULT 0,
	`leads_per_property` float NOT NULL DEFAULT 0,
	`conversion_rate` float NOT NULL DEFAULT 0,
	`price_change` float DEFAULT 0,
	`leads_trend` float DEFAULT 0,
	`period_start` timestamp NOT NULL,
	`period_end` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `market_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `property_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`property_id` int NOT NULL,
	`total_views` int NOT NULL DEFAULT 0,
	`total_leads` int NOT NULL DEFAULT 0,
	`total_conversions` int NOT NULL DEFAULT 0,
	`view_to_lead_rate` float NOT NULL DEFAULT 0,
	`lead_to_conversion_rate` float NOT NULL DEFAULT 0,
	`lead_score` float NOT NULL DEFAULT 0,
	`score_factors` text,
	`market_rank` int,
	`city_average_score` float NOT NULL DEFAULT 0,
	`avg_leads_per_day` float NOT NULL DEFAULT 0,
	`avg_leads_per_week` float NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`last_lead_at` timestamp,
	CONSTRAINT `property_metrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `property_metrics_property_id_unique` UNIQUE(`property_id`)
);
--> statement-breakpoint
CREATE INDEX `alert_type_idx` ON `alert_logs` (`alert_type`);--> statement-breakpoint
CREATE INDEX `severity_idx` ON `alert_logs` (`severity`);--> statement-breakpoint
CREATE INDEX `property_id_idx` ON `alert_logs` (`property_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `alert_logs` (`status`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `daily_metrics` (`date`);--> statement-breakpoint
CREATE INDEX `location_idx` ON `import_logs` (`location`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `import_logs` (`status`);--> statement-breakpoint
CREATE INDEX `import_type_idx` ON `import_logs` (`import_type`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `import_logs` (`started_at`);--> statement-breakpoint
CREATE INDEX `property_id_idx` ON `lead_scores` (`property_id`);--> statement-breakpoint
CREATE INDEX `score_idx` ON `lead_scores` (`score`);--> statement-breakpoint
CREATE INDEX `quality_idx` ON `lead_scores` (`lead_quality`);--> statement-breakpoint
CREATE INDEX `city_idx` ON `market_analytics` (`city`);--> statement-breakpoint
CREATE INDEX `heat_idx` ON `market_analytics` (`market_heat`);--> statement-breakpoint
CREATE INDEX `period_idx` ON `market_analytics` (`period_start`);--> statement-breakpoint
CREATE INDEX `property_id_idx` ON `property_metrics` (`property_id`);--> statement-breakpoint
CREATE INDEX `score_idx` ON `property_metrics` (`lead_score`);--> statement-breakpoint
CREATE INDEX `market_rank_idx` ON `property_metrics` (`market_rank`);