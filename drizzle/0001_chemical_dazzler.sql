CREATE TABLE `mls_sync_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(100) NOT NULL,
	`sync_type` enum('full','incremental') NOT NULL,
	`status` enum('started','completed','failed') NOT NULL,
	`properties_added` int DEFAULT 0,
	`properties_updated` int DEFAULT 0,
	`properties_removed` int DEFAULT 0,
	`error_message` text,
	`error_details` text,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `mls_sync_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mls_id` varchar(100) NOT NULL,
	`listing_id` varchar(100),
	`address` varchar(500) NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(2) NOT NULL DEFAULT 'FL',
	`zip_code` varchar(10) NOT NULL,
	`county` varchar(100),
	`price` decimal(12,2) NOT NULL,
	`bedrooms` int NOT NULL,
	`bathrooms` decimal(3,1) NOT NULL,
	`sqft` int,
	`lot_size` int,
	`year_built` int,
	`property_type` enum('single_family','condo','townhouse','multi_family','land','commercial','other') NOT NULL,
	`listing_status` enum('active','pending','sold','off_market','coming_soon') NOT NULL DEFAULT 'active',
	`listing_date` timestamp,
	`sold_date` timestamp,
	`days_on_market` int,
	`description` text,
	`features` text,
	`amenities` text,
	`primary_image` varchar(500),
	`has_virtual_tour` boolean DEFAULT false,
	`virtual_tour_url` varchar(500),
	`video_url` varchar(500),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`neighborhood` varchar(200),
	`elementary_school` varchar(200),
	`middle_school` varchar(200),
	`high_school` varchar(200),
	`school_district` varchar(200),
	`has_hoa` boolean DEFAULT false,
	`hoa_fee` decimal(10,2),
	`hoa_frequency` varchar(50),
	`parking` varchar(100),
	`garage` int,
	`stories` int,
	`pool` boolean DEFAULT false,
	`waterfront` boolean DEFAULT false,
	`listing_agent_name` varchar(200),
	`listing_agent_phone` varchar(20),
	`listing_agent_email` varchar(200),
	`listing_brokerage` varchar(200),
	`source` varchar(100) NOT NULL,
	`last_synced_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`),
	CONSTRAINT `properties_mls_id_unique` UNIQUE(`mls_id`)
);
--> statement-breakpoint
CREATE TABLE `property_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`property_id` int NOT NULL,
	`image_url` varchar(500) NOT NULL,
	`caption` varchar(500),
	`order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `property_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `property_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`property_id` int NOT NULL,
	`session_id` varchar(100),
	`user_id` int,
	`viewed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `property_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `source_idx` ON `mls_sync_log` (`source`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `mls_sync_log` (`status`);--> statement-breakpoint
CREATE INDEX `city_idx` ON `properties` (`city`);--> statement-breakpoint
CREATE INDEX `price_idx` ON `properties` (`price`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `properties` (`listing_status`);--> statement-breakpoint
CREATE INDEX `bedrooms_idx` ON `properties` (`bedrooms`);--> statement-breakpoint
CREATE INDEX `bathrooms_idx` ON `properties` (`bathrooms`);--> statement-breakpoint
CREATE INDEX `property_type_idx` ON `properties` (`property_type`);--> statement-breakpoint
CREATE INDEX `mls_id_idx` ON `properties` (`mls_id`);--> statement-breakpoint
CREATE INDEX `property_id_idx` ON `property_images` (`property_id`);--> statement-breakpoint
CREATE INDEX `property_id_idx` ON `property_views` (`property_id`);--> statement-breakpoint
CREATE INDEX `session_id_idx` ON `property_views` (`session_id`);