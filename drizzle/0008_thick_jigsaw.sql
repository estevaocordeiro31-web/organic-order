CREATE TABLE `partner_consultants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`role` varchar(150),
	`roleEs` varchar(150),
	`avatarUrl` text,
	`whatsappNumber` varchar(30) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_consultants_id` PRIMARY KEY(`id`)
);
