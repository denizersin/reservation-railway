DROP TABLE `guest_assistant`;--> statement-breakpoint
ALTER TABLE `guest` RENAME COLUMN `assistant_id` TO `assistant_name`;--> statement-breakpoint
ALTER TABLE `guest` MODIFY COLUMN `assistant_name` varchar(256);--> statement-breakpoint
ALTER TABLE `guest` ADD `assistant_phone` varchar(256);--> statement-breakpoint
ALTER TABLE `guest` ADD `assistant_email` varchar(256);--> statement-breakpoint
ALTER TABLE `guest` ADD `is_contact_assistant` boolean DEFAULT false NOT NULL;