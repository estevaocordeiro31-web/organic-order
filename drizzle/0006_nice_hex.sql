CREATE TABLE `partner_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`username` varchar(100) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`displayName` varchar(200) NOT NULL,
	`role` enum('partner','master') NOT NULL DEFAULT 'partner',
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `partner_users_username_unique` UNIQUE(`username`)
);
