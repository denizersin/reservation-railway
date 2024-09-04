CREATE TABLE `restaurant_translations` (
	`restaurant_id` int NOT NULL,
	`language_code` varchar(5) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(500) NOT NULL,
	CONSTRAINT `id` PRIMARY KEY(`restaurant_id`,`language_code`)
);
--> statement-breakpoint
CREATE TABLE `restaurants` (
	`id` int NOT NULL,
	`location` varchar(255) NOT NULL,
	`phone_number` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`name` varchar(255) NOT NULL,
	`description` varchar(500) NOT NULL,
	CONSTRAINT `restaurants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refresh_token` (
	`id` int NOT NULL,
	`user_id` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`revoked_at` timestamp DEFAULT NULL,
	`ip_address` varchar(45) DEFAULT NULL,
	`user_agent` varchar(255) DEFAULT NULL,
	CONSTRAINT `refresh_token_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_refresh_token_and_user_id` UNIQUE(`token`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256),
	`email` varchar(256),
	`password` varchar(256) NOT NULL,
	`role` enum('admin','owner','user') NOT NULL DEFAULT 'user',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`optional_field` varchar(256),
	CONSTRAINT `user_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_personal_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`sound_for_notifications` boolean NOT NULL DEFAULT false,
	`reservation_listing_type` enum('smart_list','newest_on_top') NOT NULL DEFAULT 'smart_list',
	`guest_selection_side` enum('left','right') NOT NULL DEFAULT 'left',
	`corporate_information_selectable` boolean NOT NULL DEFAULT false,
	`open_reservation_window_on_call` boolean NOT NULL DEFAULT false,
	`open_reservation_window_full_screen` boolean NOT NULL DEFAULT true,
	`reservation_screen_follow_main_calendar` boolean NOT NULL DEFAULT true,
	`hide_daily_summary_section` boolean NOT NULL DEFAULT false,
	CONSTRAINT `user_personal_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_personal_settings_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `restaurant_translations` ADD CONSTRAINT `restaurant_translations_restaurant_id_restaurants_id_fk` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refresh_token` ADD CONSTRAINT `refresh_token_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;