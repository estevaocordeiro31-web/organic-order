CREATE TABLE `app_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `app_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `app_settings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentStatus` enum('unpaid','pending_verification','paid','refunded') DEFAULT 'unpaid' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentMethod` varchar(50);--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentProofUrl` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `whatsappNotified` boolean DEFAULT false NOT NULL;