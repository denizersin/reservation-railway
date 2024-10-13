CREATE TABLE `personel` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`full_name` varchar(256) NOT NULL,
	`phone` varchar(256),
	`email` varchar(256),
	`birth_date` date,
	`special_id` varchar(256),
	CONSTRAINT `personel_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `language` MODIFY COLUMN `language_code` enum('en','tr','de') NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurant_translation` MODIFY COLUMN `language_code` enum('en','tr','de') NOT NULL DEFAULT 'tr';