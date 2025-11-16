CREATE TABLE `ad_clicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ad_id` int NOT NULL,
	`clicked_at` timestamp NOT NULL DEFAULT (now()),
	`ip_address` varchar(45),
	`user_agent` text,
	`referrer` varchar(500),
	`page_url` varchar(500),
	`property_id` int,
	CONSTRAINT `ad_clicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ad_inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ad_id` int,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`company_name` varchar(255),
	`message` text,
	`interested_package` enum('starter','professional','premium','custom'),
	`budget` varchar(100),
	`status` enum('new','contacted','qualified','converted','lost') NOT NULL DEFAULT 'new',
	`sent_to_ghl` boolean NOT NULL DEFAULT false,
	`ghl_contact_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`source` varchar(100) DEFAULT 'agent_ad_inquiry',
	CONSTRAINT `ad_inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_ads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agent_name` varchar(255) NOT NULL,
	`company_name` varchar(255),
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`website` varchar(500),
	`banner_image_url` varchar(1000) NOT NULL,
	`banner_title` varchar(255),
	`banner_description` text,
	`cta_text` varchar(100) DEFAULT 'Contact Agent',
	`cta_url` varchar(500),
	`placement` enum('sidebar','between_listings','property_detail','all') NOT NULL DEFAULT 'sidebar',
	`position` int DEFAULT 0,
	`status` enum('pending','active','paused','expired','rejected') NOT NULL DEFAULT 'pending',
	`start_date` timestamp,
	`end_date` timestamp,
	`impressions` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`approved_by` int,
	`approved_at` timestamp,
	`notes` text,
	CONSTRAINT `agent_ads_id` PRIMARY KEY(`id`)
);
