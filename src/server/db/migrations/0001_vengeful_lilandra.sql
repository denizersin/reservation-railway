CREATE TABLE `waiting_table_session` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservation_id` int NOT NULL,
	`table_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `waiting_table_session_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `reservation` ADD `waiting_session_id` int;--> statement-breakpoint
ALTER TABLE `waiting_table_session` ADD CONSTRAINT `waiting_table_session_reservation_id_reservation_id_fk` FOREIGN KEY (`reservation_id`) REFERENCES `reservation`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `waiting_table_session` ADD CONSTRAINT `waiting_table_session_table_id_table_id_fk` FOREIGN KEY (`table_id`) REFERENCES `table`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservation` DROP COLUMN `waiting_room_id`;--> statement-breakpoint
ALTER TABLE `reservation` DROP COLUMN `is_in_waiting_room`;