CREATE TABLE `country` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`code` varchar(10) NOT NULL,
	`phone_code` varchar(10) NOT NULL,
	CONSTRAINT `country_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `language` (
	`id` int AUTO_INCREMENT NOT NULL,
	`language_code` varchar(10) NOT NULL,
	`name` varchar(50) NOT NULL,
	`is_rtl` boolean NOT NULL,
	CONSTRAINT `language_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meal` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` enum('breakfast','lunch','dinner','bar') NOT NULL,
	CONSTRAINT `meal_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` enum('draft','reservation','provision','confirmation','cancel','waitApprove') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reservation_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurant_general_setting` (
	`id` int AUTO_INCREMENT NOT NULL,
	`is_auto_check_out` boolean NOT NULL,
	`restaurant_id` int NOT NULL,
	`new_reservation_state_id` int NOT NULL,
	`default_language_id` int NOT NULL,
	`default_country_id` int NOT NULL,
	`table_view` enum('standartTable','floorPlan') NOT NULL DEFAULT 'standartTable',
	CONSTRAINT `restaurant_general_setting_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurant_general_setting_to_meal` (
	`id` int AUTO_INCREMENT NOT NULL,
	`meal_id` int NOT NULL,
	`restaurant_general_setting_id` int NOT NULL,
	CONSTRAINT `restaurant_general_setting_to_meal_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_meal_and_rst_sttng` UNIQUE(`meal_id`,`restaurant_general_setting_id`)
);
--> statement-breakpoint
CREATE TABLE `reservation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`user_id` int NOT NULL,
	`reservation_date` datetime NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reservation_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_user_reservation` UNIQUE(`user_id`,`reservation_date`)
);
--> statement-breakpoint
CREATE TABLE `restaurant_translation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`language_code` enum('en','tr') NOT NULL DEFAULT 'tr',
	`description` varchar(500) NOT NULL,
	CONSTRAINT `restaurant_translation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurant` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phone_number` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`name` varchar(255) NOT NULL,
	`owner_id` int NOT NULL,
	CONSTRAINT `restaurant_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refresh_token` (
	`id` int AUTO_INCREMENT NOT NULL,
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
	`reservation_listing_type` enum('smartList','newestOnTop') NOT NULL DEFAULT 'smartList',
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
ALTER TABLE `refresh_token` ADD CONSTRAINT `refresh_token_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;