CREATE TABLE `game_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentName` varchar(200) NOT NULL,
	`tableId` int,
	`gameType` enum('voice_order','phrase_builder','qa_simulation') NOT NULL,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'easy',
	`score` int NOT NULL DEFAULT 0,
	`totalQuestions` int NOT NULL DEFAULT 0,
	`language` enum('en','es') NOT NULL DEFAULT 'en',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ordering_expressions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`language` enum('en','es') NOT NULL DEFAULT 'en',
	`category` enum('greeting','ordering','asking','thanking','paying','special_request','response') NOT NULL,
	`expression` varchar(500) NOT NULL,
	`translation` varchar(500) NOT NULL,
	`chunks` text,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'easy',
	`context` varchar(255),
	`sortOrder` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ordering_expressions_id` PRIMARY KEY(`id`)
);
