CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`language` enum('en','es') NOT NULL DEFAULT 'en',
	`rating` int,
	`interested` boolean NOT NULL DEFAULT false,
	`name` varchar(200),
	`phone` varchar(50),
	`consultant` enum('lucas','vicky'),
	`restaurantName` varchar(200),
	`notified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
