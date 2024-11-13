CREATE TABLE `guest_assistant` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guest_id` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`phone` varchar(256) NOT NULL,
	`email` varchar(256) NOT NULL,
	CONSTRAINT `guest_assistant_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `guest` ADD `assistant_id` int;--> statement-breakpoint
ALTER TABLE `guest` DROP COLUMN `assistant_name`;--> statement-breakpoint
ALTER TABLE `guest` DROP COLUMN `assistant_phone`;--> statement-breakpoint
ALTER TABLE `guest` DROP COLUMN `assistant_email`;