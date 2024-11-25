ALTER TABLE `reservation` RENAME COLUMN `is_came_from_waitlist` TO `waitlist_id`;--> statement-breakpoint
ALTER TABLE `reservation` MODIFY COLUMN `waitlist_id` int;--> statement-breakpoint
ALTER TABLE `reservation` ADD `allergen_warning` boolean DEFAULT false NOT NULL;