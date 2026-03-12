CREATE TABLE `restaurant_staff` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`role` varchar(100),
	`characterName` varchar(100),
	`avatarUrl` text,
	`language` enum('en','es') NOT NULL DEFAULT 'en',
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `restaurant_staff_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(50) NOT NULL,
	`name` varchar(200) NOT NULL,
	`nameEn` varchar(200),
	`nameEs` varchar(200),
	`cuisineType` varchar(100),
	`tagline` text,
	`address` varchar(300),
	`themeColor` varchar(20) DEFAULT '#1a2e1a',
	`accentColor` varchar(20) DEFAULT '#4ade80',
	`logoUrl` text,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `restaurants_id` PRIMARY KEY(`id`),
	CONSTRAINT `restaurants_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `tables` DROP INDEX `tables_number_unique`;--> statement-breakpoint
ALTER TABLE `game_scores` ADD `restaurantId` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `menu_categories` ADD `restaurantId` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `menu_items` ADD `restaurantId` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `restaurantId` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `tables` ADD `restaurantId` int DEFAULT 1 NOT NULL;