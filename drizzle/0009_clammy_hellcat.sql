ALTER TABLE `leads` ADD `consultantId` int;--> statement-breakpoint
ALTER TABLE `leads` ADD `consultantName` varchar(100);--> statement-breakpoint
ALTER TABLE `leads` ADD `consultantWhatsapp` varchar(30);--> statement-breakpoint
ALTER TABLE `leads` ADD `consultantNotified` boolean DEFAULT false NOT NULL;